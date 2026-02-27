import { computeOrderBookChecksum } from "@/utils/order-book/crc32"

import { WsChannel, WsMessageType } from "@/types/order-book"

import { MessageAction, newOrderBookData, processMessageByChannel } from "./msg-processor"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MARKET_ID = "42"

/** Build a minimal raw snapshot message string for a given market. */
function snapshotMsg(
    marketId: string | number = MARKET_ID,
    asks: { price: string; quantity: string }[] = [],
    bids: { price: string; quantity: string }[] = [],
    checksum?: number
): string {
    return JSON.stringify({
        channel: WsChannel.Orderbook,
        market_id: marketId,
        type: WsMessageType.Snapshot,
        checksum,
        data: {
            market_id: Number(marketId),
            asks: asks.map((a) => ({ ...a, order_count: 1, block_number: 1 })),
            bids: bids.map((b) => ({ ...b, order_count: 1, block_number: 1 })),
        },
    })
}

/** Build a minimal raw update (delta) message string. */
function updateMsg(
    marketId: string | number = MARKET_ID,
    asks: { price: string; quantity: string }[] = [],
    bids: { price: string; quantity: string }[] = [],
    checksum?: number
): string {
    return JSON.stringify({
        channel: WsChannel.Orderbook,
        market_id: marketId,
        type: WsMessageType.Update,
        checksum,
        data: {
            market_id: Number(marketId),
            asks: asks.map((a) => ({ ...a, order_count: 1, block_number: 1 })),
            bids: bids.map((b) => ({ ...b, order_count: 1, block_number: 1 })),
        },
    })
}

// ---------------------------------------------------------------------------
// newOrderBookData
// ---------------------------------------------------------------------------

describe("newOrderBookData()", () => {
    it("returns an object with empty ask and bid maps", () => {
        const store = newOrderBookData()
        expect(store.ask).toBeInstanceOf(Map)
        expect(store.bid).toBeInstanceOf(Map)
        expect(store.ask.size).toBe(0)
        expect(store.bid.size).toBe(0)
    })

    it("returns a fresh independent store on each call", () => {
        const a = newOrderBookData()
        const b = newOrderBookData()
        a.ask.set("100", 5n)
        expect(b.ask.size).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// processMessageByChannel — malformed / channel-level failures
// ---------------------------------------------------------------------------

describe("processMessageByChannel() — input validation", () => {
    it("returns Skip for malformed JSON", () => {
        const result = processMessageByChannel("not json", MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Skip)
    })

    it("returns Skip for an unrecognised channel (throws + catches)", () => {
        const raw = JSON.stringify({ channel: "trades", type: "snapshot" })
        const result = processMessageByChannel(raw, MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Skip)
    })
})

// ---------------------------------------------------------------------------
// processMessageByChannel — market-id filtering
// ---------------------------------------------------------------------------

describe("processMessageByChannel() — market_id filtering", () => {
    it("returns Skip when top-level market_id does not match", () => {
        const raw = snapshotMsg("99")
        const result = processMessageByChannel(raw, MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Skip)
    })

    it("returns Skip when data.market_id does not match and no top-level market_id", () => {
        const msg = {
            channel: WsChannel.Orderbook,
            type: WsMessageType.Snapshot,
            data: { market_id: 99, asks: [], bids: [] },
        }
        const result = processMessageByChannel(JSON.stringify(msg), MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Skip)
    })
})

// ---------------------------------------------------------------------------
// processMessageByChannel — snapshot
// ---------------------------------------------------------------------------

describe("processMessageByChannel() — snapshot", () => {
    it("returns Commit with isSnapshot:true and populated ask/bid maps", () => {
        const raw = snapshotMsg(
            MARKET_ID,
            [{ price: "100", quantity: "5" }],
            [{ price: "90", quantity: "3" }]
        )
        const result = processMessageByChannel(raw, MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Commit)
        if (result.action !== MessageAction.Commit) return
        expect(result.isSnapshot).toBe(true)
        expect(result.store.ask.get("100")).toBe(5n)
        expect(result.store.bid.get("90")).toBe(3n)
    })

    it("snapshot always creates a fresh store (does not mutate currentStore)", () => {
        const current = newOrderBookData()
        current.ask.set("999", 1n)
        const raw = snapshotMsg(MARKET_ID, [{ price: "100", quantity: "5" }], [])
        const result = processMessageByChannel(raw, MARKET_ID, current)
        if (result.action !== MessageAction.Commit) return
        // The returned store must not carry over stale data from currentStore
        expect(result.store.ask.has("999")).toBe(false)
    })

    it("returns Commit for snapshot with empty asks and bids", () => {
        const raw = snapshotMsg(MARKET_ID, [], [])
        const result = processMessageByChannel(raw, MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Commit)
        if (result.action !== MessageAction.Commit) return
        expect(result.isSnapshot).toBe(true)
        expect(result.store.ask.size).toBe(0)
        expect(result.store.bid.size).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// processMessageByChannel — update (delta)
// ---------------------------------------------------------------------------

describe("processMessageByChannel() — update (delta)", () => {
    it("returns Commit with isSnapshot:false and applies delta to existing store", () => {
        const current = newOrderBookData()
        current.ask.set("100", 5n)

        const raw = updateMsg(MARKET_ID, [{ price: "100", quantity: "8" }], [])
        const result = processMessageByChannel(raw, MARKET_ID, current)
        expect(result.action).toBe(MessageAction.Commit)
        if (result.action !== MessageAction.Commit) return
        expect(result.isSnapshot).toBe(false)
        expect(result.store.ask.get("100")).toBe(8n)
    })

    it("removes a price level when quantity '0' is received in a delta", () => {
        const current = newOrderBookData()
        current.ask.set("100", 5n)

        const raw = updateMsg(MARKET_ID, [{ price: "100", quantity: "0" }], [])
        const result = processMessageByChannel(raw, MARKET_ID, current)
        if (result.action !== MessageAction.Commit) return
        expect(result.store.ask.has("100")).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// processMessageByChannel — CRC32 checksum
// ---------------------------------------------------------------------------

describe("processMessageByChannel() — checksum", () => {
    it("returns Commit when no checksum is provided in an update", () => {
        const raw = updateMsg(MARKET_ID, [], [])
        const result = processMessageByChannel(raw, MARKET_ID, newOrderBookData())
        expect(result.action).toBe(MessageAction.Commit)
    })

    it("returns Resubscribe when checksum is provided and does not match", () => {
        // NOTE: the source guards with `if (msg.checksum)` which is falsy for 0,
        // so we must use a non-zero value that is still wrong.
        const current = newOrderBookData()
        const raw = updateMsg(
            MARKET_ID,
            [],
            [{ price: "90", quantity: "5" }],
            0xdeadbeef // non-zero but deliberately wrong
        )
        const result = processMessageByChannel(raw, MARKET_ID, current)
        expect(result.action).toBe(MessageAction.Resubscribe)
    })

    it("returns Commit when checksum matches the computed value", () => {
        // Start from a clean store so we know its exact content after the update
        const current = newOrderBookData()

        // The update adds one bid; after patching, store will have bid["90"]=5n, ask empty
        const expectedStore = newOrderBookData()
        expectedStore.bid.set("90", 5n)
        const correctChecksum = computeOrderBookChecksum(expectedStore.bid, expectedStore.ask)

        const raw = updateMsg(MARKET_ID, [], [{ price: "90", quantity: "5" }], correctChecksum)
        const result = processMessageByChannel(raw, MARKET_ID, current)
        expect(result.action).toBe(MessageAction.Commit)
    })
})
