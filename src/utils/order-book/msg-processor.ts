import { patchOrderLevels } from "@/utils/order-book/calculation"
import { computeOrderBookChecksum } from "@/utils/order-book/crc32"

import { OrderBookMessageData, WsChannel, WsMessageType } from "@/types/order-book"

export type OrderBookData = {
    ask: Map<string, bigint>
    bid: Map<string, bigint>
}

export enum MessageAction {
    Skip = "skip",
    Resubscribe = "resubscribe",
    Commit = "commit",
}

export type MessageResult =
    | { action: MessageAction.Skip }
    | { action: MessageAction.Resubscribe }
    | { action: MessageAction.Commit; store: OrderBookData; isSnapshot: boolean }

export const newOrderBookData = (): OrderBookData => ({ ask: new Map(), bid: new Map() })

function processOrderbookMessage(
    msg: OrderBookMessageData,
    selectedMarketId: string,
    currentStore: OrderBookData
): MessageResult {
    if (!msg.data) return { action: MessageAction.Skip }

    const { asks, bids, market_id } = msg.data
    const marketId = (market_id ?? msg.market_id)?.toString()
    if (marketId !== selectedMarketId) return { action: MessageAction.Skip }

    switch (msg.type) {
        case WsMessageType.Snapshot: {
            const store = newOrderBookData()
            patchOrderLevels(store.ask, asks)
            patchOrderLevels(store.bid, bids)
            return { action: MessageAction.Commit, store, isSnapshot: true }
        }
        case WsMessageType.Update: {
            patchOrderLevels(currentStore.ask, asks)
            patchOrderLevels(currentStore.bid, bids)
            if (msg.checksum) {
                const computed = computeOrderBookChecksum(currentStore.bid, currentStore.ask)
                if (computed !== msg.checksum) {
                    console.warn(
                        `[OrderBook] Checksum mismatch for market ${marketId}, resubscribing`
                    )
                    return { action: MessageAction.Resubscribe }
                }
            }
            return { action: MessageAction.Commit, store: currentStore, isSnapshot: false }
        }
        default:
            return { action: MessageAction.Skip }
    }
}

export function processMessageByChannel(
    raw: string,
    selectedMarketId: string,
    currentStore: OrderBookData
): MessageResult {
    let msg: OrderBookMessageData
    try {
        msg = JSON.parse(raw)
    } catch {
        console.error("[OrderBook] Failed to parse message JSON:", raw)
        return { action: MessageAction.Skip }
    }

    try {
        switch (msg.channel) {
            case WsChannel.Orderbook:
                return processOrderbookMessage(msg, selectedMarketId, currentStore)
            default:
                // Other channels (heartbeats, etc.) are expected — skip silently
                return { action: MessageAction.Skip }
        }
    } catch (err) {
        console.error("[OrderBook] Error processing message", err)
        return { action: MessageAction.Skip }
    }
}
