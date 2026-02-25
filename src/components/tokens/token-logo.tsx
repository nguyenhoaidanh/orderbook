import Image from "next/image"

interface TokenLogoProps {
    symbol: string
    size?: number
    className?: string
}

export default function TokenLogo({ symbol, size = 24, className = "" }: TokenLogoProps) {
    return (
        <Image
            src={`https://testnet.rise.trade/crypto-icons/${symbol.toLowerCase()}.svg`}
            alt={symbol}
            width={size}
            height={size}
            className={`rounded-full ${className}`.trim()}
        />
    )
}
