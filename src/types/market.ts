export interface MarketConfig {
    name: string
    quote: string
    step_size: string
    step_price: string
    maintenance_margin_factor: string
    max_leverage: string
    min_order_size: string
    unlocked: boolean
    open_interest_limit: string
}

export interface Market {
    market_id: string
    config: MarketConfig
    available: boolean
    base_asset_symbol: string
    quote_asset_symbol: string
    underlying: string
    display_name: string
    quote_volume_24h: string
    change_24h: string
    high_24h: string
    low_24h: string
    last_price: string
    mark_price: string
    index_price: string
    max_position_size: string
    open_interest: string
    funding_interval: string
    next_funding_time: string
    post_only: boolean
    last_cumulative_funding: string
    predicted_funding_rate: string
    visible: boolean
    display_base_asset_symbol: string
    current_funding_rate: string
}

export interface GetMarketsResponseData {
    data: {
        markets: Market[]
        cached_at: string
    }
    request_id: string
}
