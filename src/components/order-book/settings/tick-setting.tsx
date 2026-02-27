import { formatWei } from "@/utils/number"
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react"
import { useState } from "react"

import { selectSelectedMarket, useOrderBookStore } from "@/store/order-book-store"

const TICK_MULTIPLIERS: readonly number[] = [1, 2, 4, 10, 20, 50, 100]

export default function OrderBookTickSetting() {
    const { tickMultiplier, setTickMultiplier } = useOrderBookStore()
    const market = useOrderBookStore(selectSelectedMarket)
    const [open, setOpen] = useState(false)

    const stepPrice = market ? BigInt(market.config.step_price) : 0n

    const label = (m: number): string => (stepPrice ? formatWei(stepPrice * BigInt(m)) : String(m))

    const select = (m: number): void => {
        setTickMultiplier(m)
        setOpen(false)
    }

    return (
        <Popover isOpen={open} onOpenChange={setOpen} placement="bottom">
            <PopoverTrigger>
                <button className="flex items-center justify-between gap-1 h-6 min-w-16 w-max border-1 border-orderBorder text-white text-xs px-2 hover:border-white/50 transition-colors">
                    {label(tickMultiplier)}
                    <i className="ri-arrow-down-s-line text-orderMuted" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-orderBg border-1 border-orderBorder rounded-none w-fit">
                {TICK_MULTIPLIERS.map((m) => (
                    <button
                        key={m}
                        onClick={() => select(m)}
                        className={`w-full text-center px-3 py-1.5 text-xs transition-colors hover:bg-white/5 ${
                            m === tickMultiplier ? "text-white" : "text-orderMuted"
                        }`}
                    >
                        {label(m)}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    )
}
