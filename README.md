# RiseX Order Book Assignment

A real-time order book viewer for the RiseX exchange, built with Next.js 15, React 19, and WebSocket integration.

## Features

- Real-time order book updates via WebSocket subscription
- Snapshot + incremental update processing with CRC32 checksum verification
- Multi-market support with market selector
- Throttled UI sync (100ms) for smooth rendering
- Auto-reconnect with resubscribe on checksum mismatch
- Zustand global state management
- Single-column and two-column layout modes
- Configurable tick size / price grouping
- Buy/sell percentage visualization and mid-price display

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, HeroUI, Tailwind CSS v4, Remixicon, Motion
- **State**: Zustand v5
- **WebSocket**: react-use-websocket
- **HTTP Client**: apisauce (axios)
- **Testing**: Jest + ts-jest
- **Package Manager**: pnpm ≥ 9.1.1

## Getting Started

### Prerequisites

- Node.js ≥ 20.9.0
- pnpm ≥ 9.1.1

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_BASE_URL=<REST API base URL>
NEXT_PUBLIC_WS_URL=<WebSocket URL>
```

### Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Check Prettier formatting |
| `pnpm format:fix` | Auto-fix formatting |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

## Order Book Implementation

### Data Flow

```
WebSocket message
      │
      ▼
processMessageByChannel()       ← parse JSON, route by channel
      │
      ▼
processOrderbookMessage()       ← Snapshot: replace store / Update: mutate in-place
      │
      ├─ checksum mismatch? ──► resubscribe (increment trigger, get fresh snapshot)
      │
      ▼
internalRef (Map<price, qty>)   ← mutable ref, never causes a React render
      │
      ▼
throttle(300ms)
      │
      ▼
Zustand store (askMap / bidMap) ← immutable copies, triggers UI re-renders
      │
      ▼
useOrderBookData()              ← grouping, sorting, slicing, derived values
      │
      ▼
React components
```

### Internal State: `Map<string, bigint>`

Price levels are stored in two `Map<string, bigint>` instances (`ask` / `bid`) held in a **mutable ref** (`internalRef`) that lives outside React state. This avoids triggering a render on every raw WebSocket message — React only re-renders when the throttled flush copies the maps into the Zustand store.

Quantities use `bigint` to avoid floating-point precision loss on large integer values from the exchange.

### Snapshot vs. Incremental Updates

| Message type | Behavior |
|---|---|
| `snapshot` | Create a fresh store, populate from the full level list |
| `update` (delta) | Mutate the existing store in-place via `patchOrderLevels` |

`patchOrderLevels` applies the exchange's delta format: a quantity of `0` means **remove the level**, any other value means **upsert** it.

### CRC32 Integrity Check

After every incremental update the checksum is recomputed locally and compared to the value sent by the server:

1. Sort bids **descending** by price, asks **ascending**.
2. Interleave them: `bid[0].price : bid[0].qty : ask[0].price : ask[0].qty : …`
3. Run CRC32 (IEEE 802.3 polynomial `0xEDB88320`) over the joined string.
4. If the result differs from `msg.checksum` → **resubscribe** to get a fresh snapshot.

### Throttled UI Sync (300 ms)

Every incoming message is processed synchronously in the mutable ref. React state is updated via a throttled flush (300 ms) so the UI rerenders at most ~3 times per second regardless of the WebSocket message rate.

### Tick / Price Grouping

`useOrderBookData` applies `groupByTick` before rendering:

```
bucket = Math.floor(price / tickSize) * tickSize
```

All levels that fall into the same bucket are merged — their quantities are summed. `tickSize = market.config.step_price × tickMultiplier`, where `tickMultiplier` is user-configurable (1×, 2×, 5×, 10×, …).

### Display Calculations

| Value | Formula |
|---|---|
| **Mid price** | `(bestAsk + bestBid) / 2` |
| **Depth bar width** | `rowQuantity / highestRowValue * 100%` |
| **Highest row value** | `max(sum of visible ask quantities, sum of visible bid quantities)` |
| **Buy %** | `totalBidQty / (totalBidQty + totalAskQty) * 100` |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages & providers
├── components/
│   ├── order-book/
│   │   ├── order-book.tsx              # Main order book component
│   │   ├── order-book-panel.tsx        # Panel wrapper
│   │   ├── list/
│   │   │   ├── order-list.tsx          # Order list container
│   │   │   ├── order-item.tsx          # Individual order row
│   │   │   └── row-cells.tsx           # Row cell components
│   │   ├── display/
│   │   │   ├── column-header.tsx       # Column headers
│   │   │   ├── mid-price.tsx           # Mid-price display
│   │   │   └── buy-sell-percent.tsx    # Buy/sell percentage display
│   │   ├── layouts/
│   │   │   ├── single-col-layout.tsx   # Single column layout
│   │   │   └── two-col-layout.tsx      # Two column layout
│   │   └── settings/
│   │       ├── setting.tsx             # Settings container
│   │       ├── tick-setting.tsx        # Tick/price grouping setting
│   │       └── display-mode-toggle.tsx # Layout mode toggle
│   ├── modal/
│   │   └── select-market/
│   │       ├── modal-select-market.tsx # Market selector modal
│   │       └── market-item.tsx         # Market list item
│   └── tokens/
│       └── token-selector.tsx          # Token selector component
├── hooks/
│   └── order-book/
│       ├── use-order-book-socket.ts    # WebSocket connection & message processing
│       ├── use-order-book-data.ts      # Order book display logic
│       └── use-order-book-panel.ts     # Panel state management
├── store/
│   └── order-book-store.ts             # Zustand store
├── types/
│   ├── market.ts                       # Market & WebSocket types
│   └── order-book.ts                   # Order book types
├── utils/
│   ├── order-book/
│   │   ├── msg-processor.ts            # WebSocket message routing & state machine
│   │   ├── calculation.ts              # Order level patching & row value computation
│   │   └── crc32.ts                    # CRC32 checksum for data integrity
│   ├── api-client.ts                   # REST API helpers
│   ├── throttle.ts                     # Throttle utility
│   └── number.ts                       # Number formatting helpers
└── config.ts                           # App config (env vars)
```
