import { memo } from "react"

interface OrderBookRowCellsProps {
    isAsk: boolean
    formattedPrice: string
    formattedSize: string
    formattedTotal: string
    reverse?: boolean
    showTotal?: boolean
}

const OrderBookRowCells = memo<OrderBookRowCellsProps>(
    ({
        isAsk,
        formattedPrice,
        formattedSize,
        formattedTotal,
        reverse = false,
        showTotal = true,
    }) => {
        const priceCell = (
            <div
                className={`flex-1 text-[13px] ${isAsk ? "text-askRed" : "text-bidGreen"} ${
                    reverse ? "text-end" : ""
                }`}
            >
                {formattedPrice}
            </div>
        )

        const sizeCell = (
            <div className={`flex-1 text-[13px] text-white ${reverse ? "" : "text-end"}`}>
                {formattedSize}
            </div>
        )

        const totalCell = showTotal && (
            <div className="flex-1 text-[13px] text-end text-white">{formattedTotal}</div>
        )

        return reverse ? (
            <>
                {totalCell}
                {sizeCell}
                {priceCell}
            </>
        ) : (
            <>
                {priceCell}
                {sizeCell}
                {totalCell}
            </>
        )
    }
)

export default OrderBookRowCells
