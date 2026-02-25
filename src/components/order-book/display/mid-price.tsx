import { formatWei } from "@/utils/number"
import { FC } from "react"

interface OrderBookMidPriceProps {
    midPrice: bigint | undefined
    isMidPriceGreen: boolean
    loading?: boolean
    className?: string
}

const OrderBookMidPrice: FC<OrderBookMidPriceProps> = ({
    midPrice,
    isMidPriceGreen,
    loading,
    className,
}) => {
    return (
        <div className={`flex items-center justify-start ${className} h-6`}>
            {loading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
            ) : (
                <>
                    <div
                        className={`md:text-xl text-l font-bold ${
                            isMidPriceGreen ? "text-bidGreen" : "text-askRed"
                        }`}
                    >
                        {midPrice ? formatWei(midPrice) : ""}
                    </div>
                    {midPrice && (
                        <i
                            className={`mt-1 md:text-[22px] text-[18px] ${
                                isMidPriceGreen
                                    ? "ri-arrow-up-line text-bidGreen"
                                    : "ri-arrow-down-line text-askRed"
                            }`}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default OrderBookMidPrice
