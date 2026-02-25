import TokenItem from "@/components/tokens/token-item"

interface TokenSelectorProps {
    baseSymbol: string | undefined
    onClick: () => void
}

export default function TokenSelector({ baseSymbol, onClick }: TokenSelectorProps) {
    return (
        <div
            className="border-1 border-orderBorder md:w-100 max-w-full flex items-center md:p-4 p-3 text-white justify-between cursor-pointer "
            onClick={onClick}
        >
            <div className="flex gap-2">{baseSymbol && <TokenItem symbol={baseSymbol} />}</div>
            <i className="ri-arrow-down-s-line" />
        </div>
    )
}
