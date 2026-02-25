import TokenLogo from "@/components/tokens/token-logo"

interface TokenItemProps {
    symbol: string
}

export default function TokenItem({ symbol }: TokenItemProps) {
    return (
        <>
            <TokenLogo symbol={symbol} />
            {symbol}-PERP
        </>
    )
}
