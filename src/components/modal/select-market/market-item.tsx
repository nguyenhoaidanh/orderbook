import { formatWei } from "@/utils/number"
import { memo } from "react"

import TokenItem from "@/components/tokens/token-item"
import { Market } from "@/types/market"

const MarketItem = memo(function MarketItem({
    market,
    setMarket,
    isSelected,
}: {
    market: Market
    setMarket: (market: Market) => void
    isSelected: boolean
}) {
    const symbol = market.display_base_asset_symbol?.split("/")[0] ?? ""
    const maxLeverage = market.config?.max_leverage
    return (
        <div
            className={
                "flex items-center gap-2 pl-4 pr-4 py-2 cursor-pointer transition-all duration-150 hover:pl-5 " +
                (isSelected ? "bg-background" : "hover:bg-background")
            }
            onClick={() => setMarket(market)}
        >
            <TokenItem symbol={symbol} />
            {maxLeverage && (
                <span className="text-xs text-foreground/50">{formatWei(maxLeverage)}x</span>
            )}
            {isSelected && <i className="ri-check-line ml-auto text-bidGreen" />}
        </div>
    )
})

export default MarketItem
