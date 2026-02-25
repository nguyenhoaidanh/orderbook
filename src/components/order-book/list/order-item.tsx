import { formatWei } from "@/utils/number"
import { FC, memo, useEffect, useRef, useState } from "react"

import OrderBookRowCells from "./row-cells"

interface OrderBookItemProps {
    type: "bid" | "ask"
    price: string
    size: bigint
    total: bigint
    highestRowValue: bigint
    loading?: boolean
    flashMode?: boolean
    isTwoCol?: boolean
}

const OrderBookItem: FC<OrderBookItemProps> = memo(
    ({ type, price, size, total, highestRowValue, loading, flashMode, isTwoCol }) => {
        const isAsk = type === "ask"
        const prevSizeRef = useRef<bigint>(size)
        const [isFlashing, setIsFlashing] = useState(false)

        useEffect(() => {
            if (flashMode && prevSizeRef.current !== size) {
                setIsFlashing(true)
                const t = setTimeout(() => setIsFlashing(false), 400)
                return () => clearTimeout(t)
            }
            prevSizeRef.current = size
        }, [size, flashMode])

        if (loading) {
            return (
                <div className="flex items-center w-full relative h-7 animate-pulse">
                    <div className="flex-1 h-3 bg-white/10 rounded mr-1" />
                    <div className="flex-1 h-3 bg-white/10 rounded mx-1" />
                    {!isTwoCol && <div className="flex-1 h-3 bg-white/10 rounded ml-1" />}
                </div>
            )
        }

        const formattedPrice = formatWei(price)
        const formattedSize = formatWei(size)
        const formattedTotal = formatWei(total)
        const percent = highestRowValue > 0n ? Number((total * 10000n) / highestRowValue) / 100 : 0
        const depthAlignment = isTwoCol && isAsk ? "left-0" : "right-0"

        return (
            <div
                className={`flex items-center w-full min-h-7 relative py-1 cursor-pointer transition-transform duration-150 hover:scale-[1.01] ${
                    isFlashing ? "animate-flash" : ""
                }`}
            >
                <div
                    className={`transition-all ease-in-out duration-200 absolute top-0 ${depthAlignment} opacity-20 h-full ${
                        isAsk ? "bg-askRed" : "bg-bidGreen"
                    }`}
                    style={{ width: `${percent}%` }}
                />

                {isTwoCol ? (
                    <OrderBookRowCells
                        isAsk={isAsk}
                        formattedPrice={formattedPrice}
                        formattedSize={formattedSize}
                        formattedTotal={formattedTotal}
                        reverse={!isAsk}
                        showTotal={false}
                    />
                ) : (
                    <OrderBookRowCells
                        isAsk={isAsk}
                        formattedPrice={formattedPrice}
                        formattedSize={formattedSize}
                        formattedTotal={formattedTotal}
                    />
                )}
            </div>
        )
    }
)

export default OrderBookItem
