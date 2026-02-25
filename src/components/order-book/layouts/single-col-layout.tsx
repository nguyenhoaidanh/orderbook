import { memo } from "react"

import OrderBookColumnHeader from "@/components/order-book/display/column-header"
import OrderBookMidPrice from "@/components/order-book/display/mid-price"
import OrderBookList from "@/components/order-book/list/order-list"
import { AssetType } from "@/store/order-book-store"
import { Market } from "@/types/market"

interface OrderBookSingleColLayoutProps {
    market: Market | undefined
    activeSymbol: string | undefined
    symbols: string[]
    assetType: AssetType
    onAssetTypeChange: (type: AssetType) => void
    slicedAsks: string[]
    askMap: Map<string, bigint>
    slicedBids: string[]
    bidMap: Map<string, bigint>
    highestRowValue: bigint
    midPrice: bigint | undefined
    isMidPriceGreen: boolean
    showLoading: boolean
    visibleRows: number
    flashMode: boolean
    showAsk: boolean
    showBid: boolean
    isDefault: boolean
}

const OrderBookSingleColLayout = memo(function OrderBookSingleColLayout({
    market,
    activeSymbol,
    symbols,
    assetType,
    onAssetTypeChange,
    slicedAsks,
    askMap,
    slicedBids,
    bidMap,
    highestRowValue,
    midPrice,
    isMidPriceGreen,
    showLoading,
    visibleRows,
    flashMode,
    showAsk,
    showBid,
    isDefault,
}: OrderBookSingleColLayoutProps) {
    return (
        <>
            <OrderBookColumnHeader
                market={market}
                activeSymbol={activeSymbol}
                symbols={symbols}
                assetType={assetType}
                onAssetTypeChange={onAssetTypeChange}
            />

            <div className="flex flex-col gap-0.5 w-full">
                {showAsk && (
                    <OrderBookList
                        type="ask"
                        prices={slicedAsks}
                        orderMap={askMap}
                        highestRowValue={highestRowValue}
                        loading={showLoading}
                        visibleRows={visibleRows}
                        flashMode={flashMode}
                        assetType={assetType}
                    />
                )}
                {isDefault && (
                    <OrderBookMidPrice
                        midPrice={midPrice}
                        isMidPriceGreen={isMidPriceGreen}
                        loading={showLoading}
                        className="w-full"
                    />
                )}
                {showBid && (
                    <OrderBookList
                        type="bid"
                        prices={slicedBids}
                        orderMap={bidMap}
                        highestRowValue={highestRowValue}
                        loading={showLoading}
                        visibleRows={visibleRows}
                        flashMode={flashMode}
                        assetType={assetType}
                    />
                )}
            </div>
        </>
    )
})

export default OrderBookSingleColLayout
