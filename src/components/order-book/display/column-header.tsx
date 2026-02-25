import { FC } from "react"

import AssetTypeSelect from "@/components/order-book/settings/asset-type-select"
import { AssetType } from "@/store/order-book-store"
import { Market } from "@/types/market"

interface OrderBookColumnHeaderProps {
    market: Market | undefined
    activeSymbol: string | undefined
    symbols: string[]
    assetType: AssetType
    onAssetTypeChange: (assetType: AssetType) => void
    showTotal?: boolean
    reverse?: boolean
    assetTypePlace?: "total" | "size"
    isTwoCol?: boolean
}

const OrderBookColumnHeader: FC<OrderBookColumnHeaderProps> = ({
    market,
    activeSymbol,
    symbols,
    assetType,
    onAssetTypeChange,
    showTotal = true,
    reverse = false,
    assetTypePlace = "total",
    isTwoCol = false,
}) => {
    const priceLabel = `Price${market && !isTwoCol ? ` (${market.quote_asset_symbol})` : ""}`
    const sizeLabel = `Size${market ? ` (${activeSymbol})` : ""}`

    const priceCol = (
        <div
            className={`flex-1 whitespace-nowrap text-xs text-orderMuted ${
                reverse ? "text-end" : ""
            }`}
        >
            {priceLabel}
        </div>
    )

    const sizeCol = (
        <div
            className={`flex-1 text-xs text-orderMuted flex items-center gap-1 ${
                reverse ? "" : "justify-end"
            }`}
        >
            {assetTypePlace === "size" && symbols.length > 0 ? (
                <AssetTypeSelect
                    prefix="Size"
                    symbols={symbols}
                    value={assetType}
                    onChange={onAssetTypeChange}
                />
            ) : (
                sizeLabel
            )}
        </div>
    )

    const totalCol = showTotal && (
        <div className="flex-1 text-xs text-orderMuted text-end flex justify-end items-center gap-1">
            {assetTypePlace === "total" && symbols.length > 0 ? (
                <AssetTypeSelect
                    prefix="Total"
                    symbols={symbols}
                    value={assetType}
                    onChange={onAssetTypeChange}
                />
            ) : (
                <>Total{market ? ` (${activeSymbol})` : ""}</>
            )}
        </div>
    )

    return (
        <div className={`flex items-center w-full ${reverse ? "flex-row-reverse" : ""}`}>
            {priceCol}
            {sizeCol}
            {totalCol}
        </div>
    )
}

export default OrderBookColumnHeader
