export interface OrderBookLevel {
    price: string
    quantity: string
    order_count: number
    block_number: number
}

export enum WsChannel {
    Orderbook = "orderbook",
}

export enum WsMessageType {
    Snapshot = "snapshot",
    Update = "update",
}

export interface OrderBookMessageData {
    channel: WsChannel
    market_id?: string | number
    type: WsMessageType
    checksum?: number
    data?: {
        market_id: number
        bids: OrderBookLevel[]
        asks: OrderBookLevel[]
    }
}
