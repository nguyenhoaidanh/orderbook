import { config } from "@/config"
import {
    MessageAction,
    OrderBookData,
    newOrderBookData,
    processMessageByChannel,
} from "@/utils/order-book/msg-processor"
import { throttle } from "@/utils/throttle"
import { useCallback, useEffect, useRef, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useShallow } from "zustand/react/shallow"

import { selectSelectedMarket, useOrderBookStore } from "@/store/order-book-store"
import { WsChannel } from "@/types/order-book"

export function useOrderBookSocket() {
    // Subscribe to only the store slices needed to avoid unnecessary re-renders
    const { setOrderBook, setHasSnapshot, resetOrderBook, setConnected } = useOrderBookStore(
        useShallow((s) => ({
            setOrderBook: s.setOrderBook,
            setHasSnapshot: s.setHasSnapshot,
            resetOrderBook: s.resetOrderBook,
            setConnected: s.setConnected,
        }))
    )

    const selectedMarket = useOrderBookStore(selectSelectedMarket)

    // Mutable in-memory order book state — kept in a ref to avoid triggering renders on every update
    const internalRef = useRef(newOrderBookData())
    // Incrementing this value forces a re-subscribe (e.g. after a CRC32 checksum mismatch)
    const [resubscribeTrigger, setResubscribeTrigger] = useState(0)

    // Throttle React state updates to at most once every XX ms to prevent excessive renders
    const syncThrottled = useRef(
        throttle((store: OrderBookData) => {
            setOrderBook(new Map(store.ask), new Map(store.bid))
        }, 300)
    )

    // Cancel any pending throttled flush on unmount to prevent post-unmount state updates
    useEffect(() => () => syncThrottled.current.cancel(), [])

    // Clear internal state and reset the store when the market changes or the socket closes
    const onReset = useCallback(() => {
        internalRef.current = newOrderBookData()
        resetOrderBook()
    }, [resetOrderBook])

    const handleMessage = useCallback(
        (event: MessageEvent) => {
            const market = selectedMarket
            if (!market) return

            const result = processMessageByChannel(
                event.data,
                market.market_id,
                internalRef.current
            )

            switch (result.action) {
                case MessageAction.Resubscribe:
                    setResubscribeTrigger((t) => t + 1)
                    break
                case MessageAction.Commit:
                    if (result.isSnapshot) setHasSnapshot(true)
                    internalRef.current = result.store
                    syncThrottled.current(result.store)
                    break
                default:
                    break
            }
        },
        [setHasSnapshot, selectedMarket]
    )

    const { sendMessage, readyState } = useWebSocket(config.wsUrl, {
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
        onClose: onReset,
        onMessage: handleMessage,
    })

    // Keep the connection status in the global store in sync with the WebSocket ready state
    useEffect(() => {
        setConnected(readyState === ReadyState.OPEN)
    }, [readyState, setConnected])

    // Reset order book data whenever the selected market changes
    useEffect(() => {
        onReset()
    }, [selectedMarket, onReset])

    // Subscribe / unsubscribe to the orderbook channel for the selected market.
    // Re-runs when the market changes, the socket reconnects, or a resubscribe is triggered.
    useEffect(() => {
        if (readyState !== ReadyState.OPEN || !selectedMarket) return

        sendMessage(
            JSON.stringify({
                method: "subscribe",
                params: {
                    channel: WsChannel.Orderbook,
                    market_ids: [parseInt(selectedMarket.market_id)],
                },
            })
        )

        return () => {
            sendMessage(
                JSON.stringify({ method: "unsubscribe", params: { channel: WsChannel.Orderbook } })
            )
        }
    }, [selectedMarket, readyState, sendMessage, resubscribeTrigger])
}
