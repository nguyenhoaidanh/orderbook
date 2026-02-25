import { memo } from "react"

import BuySellPercent from "@/components/order-book/display/buy-sell-percent"
import OrderBookMidPrice from "@/components/order-book/display/mid-price"
import OrderBookSingleColLayout from "@/components/order-book/layouts/single-col-layout"
import OrderBookTwoColLayout from "@/components/order-book/layouts/two-col-layout"
import OrderBookSetting from "@/components/order-book/settings/setting"
import TokenSelector from "@/components/tokens/token-selector"
import { useOrderBookDisplay } from "@/hooks/order-book/use-order-book-display"
import { Market } from "@/types/market"

interface OrderBookPanelProps {
    market: Market | undefined
    askMap: Map<string, bigint>
    bidMap: Map<string, bigint>
    slicedAsks: string[]
    slicedBids: string[]
    highestRowValue: bigint
    midPrice: bigint | undefined
    isMidPriceGreen: boolean
    onSelectMarket: () => void
    showLoading: boolean
    buyPercentage: number
    sellPercentage: number
    visibleRows: number
}

const OrderBookPanel = memo(function OrderBookPanel({
    market,
    askMap,
    bidMap,
    slicedAsks,
    slicedBids,
    highestRowValue,
    midPrice,
    isMidPriceGreen,
    onSelectMarket,
    showLoading,
    buyPercentage,
    sellPercentage,
    visibleRows,
}: OrderBookPanelProps) {
    const {
        symbols,
        baseSymbol,
        activeSymbol,
        highestRowValueScaled,
        isDefault,
        isTwoCol,
        showAsk,
        showBid,
        flashMode,
        assetType,
        setAssetType,
    } = useOrderBookDisplay({ market, highestRowValue, midPrice, visibleRows })

    return (
        <div className="flex flex-col gap-3 w-full md:w-[unset]">
            <TokenSelector baseSymbol={baseSymbol} onClick={onSelectMarket} />

            <div className="flex flex-col items-center w-full md:w-100 max-w-full md:p-4 p-3 border-1 border-orderBorder gap-2 ">
                <OrderBookSetting>
                    {!isDefault && (
                        <OrderBookMidPrice
                            className="w-fit"
                            midPrice={midPrice}
                            isMidPriceGreen={isMidPriceGreen}
                            loading={showLoading}
                        />
                    )}
                </OrderBookSetting>

                {isTwoCol ? (
                    <OrderBookTwoColLayout
                        {...{
                            market,
                            activeSymbol,
                            symbols,
                            assetType,
                            onAssetTypeChange: setAssetType,
                            slicedAsks,
                            askMap,
                            slicedBids,
                            bidMap,
                            highestRowValue: highestRowValueScaled,
                            showLoading,
                            visibleRows,
                            flashMode,
                        }}
                    />
                ) : (
                    <OrderBookSingleColLayout
                        {...{
                            market,
                            activeSymbol,
                            symbols,
                            assetType,
                            onAssetTypeChange: setAssetType,
                            slicedAsks,
                            askMap,
                            slicedBids,
                            bidMap,
                            highestRowValue: highestRowValueScaled,
                            midPrice,
                            isMidPriceGreen,
                            showLoading,
                            visibleRows,
                            flashMode,
                            showAsk,
                            showBid,
                            isDefault,
                        }}
                    />
                )}

                <BuySellPercent
                    buyPercentage={buyPercentage}
                    sellPercentage={sellPercentage}
                    loading={showLoading}
                />
            </div>
        </div>
    )
})

export default OrderBookPanel
