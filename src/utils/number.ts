import { formatEther } from "viem"

/** Formats a wei value (bigint or numeric string) to a human-readable number string. */
export function formatWei(value: bigint | string): string {
    return formatNumber(formatEther(typeof value === "string" ? BigInt(value) : value))
}

function formatNumber(x: string | number) {
    const num = !x ? 0 : Number(x)

    // Large numbers (≥1M) use compact notation: 1.23M, 4.5B, etc.
    if (num >= 1_000_000) {
        return new Intl.NumberFormat("en", {
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(num)
    }

    // Round to 6 significant figures to avoid floating-point noise,
    // then add thousands separators while preserving the decimal part.
    const formatted = parseFloat(num.toPrecision(6))
    const str = formatted.toString()
    const [whole, decimal] = str.split(".")
    let res = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    if (decimal) {
        res += "." + decimal
    }
    return res
}
