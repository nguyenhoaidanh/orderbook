import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react"
import { useState } from "react"

import { AssetType } from "@/store/order-book-store"

interface AssetTypeSelectProps {
    symbols: string[]
    value: AssetType
    onChange: (value: AssetType) => void
    prefix?: string
}

export default function AssetTypeSelect({
    symbols,
    value,
    onChange,
    prefix,
}: AssetTypeSelectProps) {
    const [open, setOpen] = useState(false)

    const select = (type: AssetType) => {
        onChange(type)
        setOpen(false)
    }

    const options: { type: AssetType; label: string }[] = [
        { type: AssetType.Base, label: symbols[0] },
        { type: AssetType.Quote, label: symbols[1] },
    ]

    const activeLabel = value === AssetType.Base ? symbols[0] : symbols[1]

    return (
        <Popover isOpen={open} onOpenChange={setOpen} placement="bottom">
            <PopoverTrigger>
                <button className="flex items-center justify-between gap-1 h-5 min-w-14 text-orderMuted text-xs cursor-pointer hover:text-white transition-colors">
                    {prefix && <span>{prefix}</span>}({activeLabel})
                    <i className="ri-arrow-down-s-line" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-orderBg border-1 border-orderBorder rounded-none w-fit">
                {options.map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => select(opt.type)}
                        className={`w-full text-center px-3 py-1.5 text-xs transition-colors hover:bg-white/5 ${
                            opt.type === value ? "text-white" : "text-orderMuted"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    )
}
