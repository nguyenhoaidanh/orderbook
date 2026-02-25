import { FC } from "react"

interface BuySellPercentProps {
    buyPercentage: number
    sellPercentage: number
    loading?: boolean
}

const BuySellPercent: FC<BuySellPercentProps> = ({ buyPercentage, sellPercentage, loading }) => (
    <div className="flex flex-col w-full gap-1.5">
        {loading ? (
            <div className="w-full h-7 rounded animate-pulse bg-white/10" />
        ) : (
            <>
                <div className="flex w-full h-1.5">
                    <div
                        className="h-full bg-bidGreen transition-[width] duration-300"
                        style={{
                            width: `${buyPercentage}%`,
                            clipPath: "polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                    />
                    <div
                        className="h-full bg-askRed transition-[width] duration-300"
                        style={{
                            width: `${sellPercentage}%`,
                            clipPath: "polygon(4px 0, 100% 0, 100% 100%, 0 100%)",
                            marginLeft: "-2px",
                        }}
                    />
                </div>
                <div className="flex justify-between items-center w-full text-xs">
                    <span className="text-bidGreen">Buy: {buyPercentage}%</span>
                    <span className="text-askRed">Sell: {sellPercentage}%</span>
                </div>
            </>
        )}
    </div>
)

export default BuySellPercent
