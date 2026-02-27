import { config } from "@/config"
import { useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

import { selectSelectedMarket } from "@/store/order-book-store"
import { WsChannel } from "@/types/order-book"

// Returns true for one render when the browser comes back online,
// forcing a fresh WebSocket instance after exhausted reconnect attempts.
function useNeedReconnect(): boolean {
    const [needReconnect, setNeedReconnect] = useState(false)

    useEffect(() => {
        const handleOnline = () => setNeedReconnect(true)
        window.addEventListener("online", handleOnline)
        return () => window.removeEventListener("online", handleOnline)
    }, [])

    useEffect(() => {
        if (needReconnect) setNeedReconnect(false)
    }, [needReconnect])

    return needReconnect
}

export interface ConnectOrderBookSocketOptions {
    selectedMarket: ReturnType<typeof selectSelectedMarket>
    shouldResubscribe: number
    onReset: () => void
    onMessage: (event: MessageEvent) => void
    setConnected: (connected: boolean) => void
}

// Owns the WebSocket connection: opens/closes the socket, syncs readyState to
// the store, and handles subscribe/unsubscribe for the selected market.
export function useConnectOrderBookSocket({
    selectedMarket,
    shouldResubscribe,
    onReset,
    onMessage,
    setConnected,
}: ConnectOrderBookSocketOptions) {
    const needReconnect = useNeedReconnect()

    const { sendMessage, readyState } = useWebSocket(
        config.wsUrl,
        {
            shouldReconnect: () => true,
            reconnectAttempts: 10,
            reconnectInterval: 3000,
            onClose: onReset,
            onMessage,
        },
        !needReconnect
    )

    useEffect(() => {
        setConnected(readyState === ReadyState.OPEN)
    }, [readyState, setConnected])

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
    }, [selectedMarket, readyState, sendMessage, shouldResubscribe])
}
