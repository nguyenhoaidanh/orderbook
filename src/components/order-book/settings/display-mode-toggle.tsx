import { Button } from "@heroui/react"

import { DisplayMode } from "@/store/order-book-store"

interface DisplayToggleOption {
    mode: DisplayMode
    title: string
    topColor: string
    bottomColor: string
}

const OPTIONS: DisplayToggleOption[] = [
    {
        mode: DisplayMode.Default,
        title: "Default",
        topColor: "bg-askRed",
        bottomColor: "bg-bidGreen",
    },
    {
        mode: DisplayMode.Bid,
        title: "Bid only",
        topColor: "bg-orderBorder",
        bottomColor: "bg-bidGreen",
    },
    {
        mode: DisplayMode.Ask,
        title: "Ask only",
        topColor: "bg-askRed",
        bottomColor: "bg-orderBorder",
    },
    {
        mode: DisplayMode.TwoCol,
        title: "Two Columns",
        topColor: "two-col",
        bottomColor: "two-col",
    },
]

interface DisplayModeToggleProps {
    value: DisplayMode
    onChange: (mode: DisplayMode) => void
}

export default function DisplayModeToggle({ value, onChange }: DisplayModeToggleProps) {
    return (
        <div className="flex gap-2">
            {OPTIONS.map(({ mode, title, topColor, bottomColor }) => (
                <Button
                    key={mode}
                    isIconOnly
                    size="sm"
                    variant="bordered"
                    onPress={() => onChange(mode)}
                    title={title}
                    className={`w-6 h-6 min-w-6 border-1 border-orderBorder rounded-none transition-colors ${
                        value === mode ? "opacity-100" : "opacity-50 hover:opacity-100"
                    }`}
                >
                    {topColor === "two-col" ? (
                        <span className="flex gap-[2px]">
                            <span className="flex flex-col gap-[2px]">
                                <span className="block w-[5px] h-[2px] bg-bidGreen" />
                                <span className="block w-[5px] h-[2px] bg-bidGreen" />
                                <span className="block w-[5px] h-[2px] bg-bidGreen" />
                                <span className="block w-[5px] h-[2px] bg-bidGreen" />
                            </span>
                            <span className="flex flex-col gap-[2px]">
                                <span className="block w-[5px] h-[2px] bg-askRed" />
                                <span className="block w-[5px] h-[2px] bg-askRed" />
                                <span className="block w-[5px] h-[2px] bg-askRed" />
                                <span className="block w-[5px] h-[2px] bg-askRed" />
                            </span>
                        </span>
                    ) : (
                        <span className="flex flex-col gap-[2px]">
                            <span className={`block w-3 h-[2px] ${topColor}`} />
                            <span className={`block w-3 h-[2px] ${topColor}`} />
                            <span className={`block w-3 h-[2px] ${bottomColor}`} />
                            <span className={`block w-3 h-[2px] ${bottomColor}`} />
                        </span>
                    )}
                </Button>
            ))}
        </div>
    )
}
