import { create } from "zustand"

import { Market } from "@/types/market"

export enum DisplayMode {
    Default = "default",
    Bid = "bid",
    Ask = "ask",
    TwoCol = "two-col",
}

export enum AssetType {
    Base = "base",
    Quote = "quote",
}

interface OrderBookState {
    marketList: Market[]
    selectedMarketId: string | undefined
    askMap: Map<string, bigint>
    bidMap: Map<string, bigint>
    hasSnapshot: boolean
    isConnected: boolean
    displayMode: DisplayMode
    flashMode: boolean
    tickMultiplier: number
    assetType: AssetType
}

interface OrderBookActions {
    setMarketList: (markets: Market[]) => void
    setMarket: (market: Market) => void
    setOrderBook: (ask: Map<string, bigint>, bid: Map<string, bigint>) => void
    setHasSnapshot: (hasSnapshot: boolean) => void
    resetOrderBook: () => void
    setConnected: (isConnected: boolean) => void
    setDisplayMode: (mode: DisplayMode) => void
    toggleFlashMode: () => void
    setTickMultiplier: (multiplier: number) => void
    setAssetType: (assetType: AssetType) => void
}

type OrderBookStore = OrderBookState & OrderBookActions

const initialState: OrderBookState = {
    marketList: [],
    selectedMarketId: undefined,
    askMap: new Map(),
    bidMap: new Map(),
    hasSnapshot: false,
    isConnected: false,
    displayMode: DisplayMode.Default,
    flashMode: true,
    tickMultiplier: 1,
    assetType: AssetType.Base,
}

export const selectSelectedMarket = (s: OrderBookStore) =>
    s.marketList.find((m) => m.market_id === s.selectedMarketId)

export const useOrderBookStore = create<OrderBookStore>((set) => ({
    ...initialState,
    setMarketList: (markets) =>
        set((state) => ({
            marketList: markets,
            selectedMarketId: state.selectedMarketId ?? markets[0]?.market_id,
        })),
    setMarket: (market) => set({ selectedMarketId: market.market_id, tickMultiplier: 1 }),
    setOrderBook: (askMap, bidMap) => set({ askMap, bidMap }),
    setHasSnapshot: (hasSnapshot) => set({ hasSnapshot }),
    resetOrderBook: () => set({ askMap: new Map(), bidMap: new Map(), hasSnapshot: false }),
    setConnected: (isConnected) => set({ isConnected }),
    setDisplayMode: (displayMode) => set({ displayMode }),
    toggleFlashMode: () => set((s) => ({ flashMode: !s.flashMode })),
    setTickMultiplier: (tickMultiplier) => set({ tickMultiplier }),
    setAssetType: (assetType) => set({ assetType }),
}))
