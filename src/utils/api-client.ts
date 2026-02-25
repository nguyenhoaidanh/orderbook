import { config } from "@/config"
import { create } from "apisauce"

import { GetMarketsResponseData, Market } from "@/types/market"

const apiClient = create({
    baseURL: config.apiBaseUrl,
})

export async function getActiveMarkets(): Promise<Market[]> {
    const response = await apiClient.get<GetMarketsResponseData>("/markets")
    if (!response.ok || !response.data) {
        console.error("[API] getActiveMarkets failed:", response.problem, response.status)
        return []
    }
    return response.data.data.markets.filter((m) => m.visible)
}
