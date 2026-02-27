import { AssetType } from "@/store/order-book-store"
import { OrderBookLevel } from "@/types/order-book"

export function patchOrderLevels(map: Map<string, bigint>, orders: OrderBookLevel[]) {
    orders.forEach(({ price, quantity }) => {
        const qty = BigInt(quantity)
        if (qty === 0n) {
            map.delete(price)
        } else {
            map.set(price, qty)
        }
    })
}

export function calcQty(size: bigint, price: string, assetType: AssetType): bigint {
    return assetType === AssetType.Quote ? (size * BigInt(price)) / 10n ** 18n : size
}

function sumOrderBookSide(prices: string[], map: Map<string, bigint>): bigint {
    return prices.reduce((acc, price) => acc + (map.get(price) ?? 0n), 0n)
}

export function computeBuySellPercentage(
    slicedAsks: string[],
    askMap: Map<string, bigint>,
    slicedBids: string[],
    bidMap: Map<string, bigint>
): { buyPercentage: number; sellPercentage: number } {
    let totalAsk = 0n
    let totalBid = 0n
    for (const price of slicedAsks) totalAsk += askMap.get(price) || 0n
    for (const price of slicedBids) totalBid += bidMap.get(price) || 0n
    const total = totalBid + totalAsk
    if (total === 0n) return { buyPercentage: 50, sellPercentage: 50 }
    const buy = Number((totalBid * 100n) / total)
    return { buyPercentage: buy, sellPercentage: 100 - buy }
}

export function computeHighestRowValue(
    slicedAsks: string[],
    askMap: Map<string, bigint>,
    slicedBids: string[],
    bidMap: Map<string, bigint>
): bigint {
    const askSum = sumOrderBookSide(slicedAsks, askMap)
    const bidSum = sumOrderBookSide(slicedBids, bidMap)
    return askSum > bidSum ? askSum : bidSum
}
