import { memo } from "react"

import OrderBookColumnHeader from "@/components/order-book/display/column-header"
import OrderBookList from "@/components/order-book/list/order-list"
import { AssetType } from "@/store/order-book-store"
import { Market } from "@/types/market"

interface OrderBookTwoColLayoutProps {
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
    showLoading: boolean
    visibleRows: number
    flashMode: boolean
}

const OrderBookTwoColLayout = memo(function OrderBookTwoColLayout({
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
    showLoading,
    visibleRows,
    flashMode,
}: OrderBookTwoColLayoutProps) {
    const sharedHeaderProps = {
        assetTypePlace: "size" as const,
        market,
        activeSymbol,
        symbols,
        assetType,
        onAssetTypeChange,
        showTotal: false,
        isTwoCol: true,
    }

    return (
        <div className="flex w-full md:gap-4 gap-3">
            <div className="flex flex-col flex-1 gap-2 min-w-0">
                <OrderBookColumnHeader {...sharedHeaderProps} />
                <OrderBookList
                    type="ask"
                    prices={slicedAsks}
                    orderMap={askMap}
                    highestRowValue={highestRowValue}
                    loading={showLoading}
                    visibleRows={visibleRows}
                    flashMode={flashMode}
                    assetType={assetType}
                    isTwoCol
                />
            </div>
            <div className="w-px bg-orderBorder shrink-0" />
            <div className="flex flex-col flex-1 gap-2 min-w-0">
                <OrderBookColumnHeader {...sharedHeaderProps} reverse />
                <OrderBookList
                    type="bid"
                    prices={slicedBids}
                    orderMap={bidMap}
                    highestRowValue={highestRowValue}
                    loading={showLoading}
                    visibleRows={visibleRows}
                    flashMode={flashMode}
                    assetType={assetType}
                    isTwoCol
                />
            </div>
        </div>
    )
})

export default OrderBookTwoColLayout
