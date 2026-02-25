import { calcQty } from "@/utils/order-book/calculation"
import { memo, useMemo } from "react"

import OrderBookItem from "@/components/order-book/list/order-item"
import { AssetType } from "@/store/order-book-store"

export interface OrderBookListProps {
    type: "ask" | "bid"
    prices: string[]
    orderMap: Map<string, bigint>
    highestRowValue: bigint
    loading?: boolean
    visibleRows: number
    flashMode?: boolean
    assetType?: AssetType
    isTwoCol?: boolean
}

const OrderBookList = memo(function OrderBookList({
    type,
    prices,
    orderMap,
    highestRowValue,
    loading,
    visibleRows,
    flashMode,
    assetType = AssetType.Base,
    isTwoCol,
}: OrderBookListProps) {
    const direction = type === "ask" ? (!isTwoCol ? "-reverse" : "") : ""
    const wrapperClass = `w-full flex flex-col${direction} gap-0.5 flex-1 overflow-hidden`

    const cumulativeTotals = useMemo(() => {
        let running = 0n
        return prices.map((price) => {
            const size = orderMap.get(price) ?? 0n
            const qty = calcQty(size, price, assetType)
            running = running + qty
            return running
        })
    }, [prices, orderMap, assetType])

    if (loading) {
        return (
            <div className={wrapperClass}>
                {Array.from({ length: visibleRows }).map((_, i) => (
                    <OrderBookItem
                        key={i}
                        type={type}
                        price="0"
                        size={0n}
                        total={0n}
                        highestRowValue={0n}
                        loading
                        isTwoCol={isTwoCol}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={wrapperClass}>
            {prices.map((price, i) => (
                <OrderBookItem
                    key={price}
                    type={type}
                    price={price}
                    size={calcQty(orderMap.get(price) ?? 0n, price, assetType)}
                    total={cumulativeTotals[i]}
                    highestRowValue={highestRowValue}
                    flashMode={flashMode}
                    isTwoCol={isTwoCol}
                />
            ))}
        </div>
    )
})

export default OrderBookList
