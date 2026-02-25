import { computeHighestRowValue } from "@/utils/order-book/calculation"
import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { ORDER_BOOK_VISIBLE_ROWS } from "@/constants/order-book"
import usePrevious from "@/hooks/use-previous"
import { DisplayMode, selectSelectedMarket, useOrderBookStore } from "@/store/order-book-store"

function groupByTick(
    map: Map<string, bigint>,
    tickSize: bigint,
    multiplier: number
): Map<string, bigint> {
    if (multiplier <= 1) return map
    const grouped = new Map<string, bigint>()
    for (const [price, size] of map) {
        const bucket = ((BigInt(price) / tickSize) * tickSize).toString()
        grouped.set(bucket, (grouped.get(bucket) ?? 0n) + size)
    }
    return grouped
}

export function useOrderBookData() {
    const { askMap, bidMap, hasSnapshot, isConnected, tickMultiplier, displayMode } =
        useOrderBookStore(
            useShallow((s) => ({
                askMap: s.askMap,
                bidMap: s.bidMap,
                hasSnapshot: s.hasSnapshot,
                isConnected: s.isConnected,
                tickMultiplier: s.tickMultiplier,
                displayMode: s.displayMode,
            }))
        )
    const visibleRows =
        displayMode === DisplayMode.Default ? ORDER_BOOK_VISIBLE_ROWS : ORDER_BOOK_VISIBLE_ROWS * 2
    const selectedMarket = useOrderBookStore(selectSelectedMarket)

    const tickSize = useMemo(
        () =>
            selectedMarket ? BigInt(selectedMarket.config.step_price) * BigInt(tickMultiplier) : 1n,
        [selectedMarket, tickMultiplier]
    )

    const groupedAskMap = useMemo(
        () => (tickMultiplier <= 1 ? askMap : groupByTick(askMap, tickSize, tickMultiplier)),
        [askMap, tickSize, tickMultiplier]
    )
    const groupedBidMap = useMemo(
        () => (tickMultiplier <= 1 ? bidMap : groupByTick(bidMap, tickSize, tickMultiplier)),
        [bidMap, tickSize, tickMultiplier]
    )

    // Asks sorted ascending (lowest ask first) then capped to the visible row count
    const slicedAsks = useMemo(
        () =>
            Array.from(groupedAskMap.keys())
                .toSorted((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
                .slice(0, visibleRows),
        [groupedAskMap, visibleRows]
    )

    // Bids sorted descending (highest bid first) then capped to the visible row count
    const slicedBids = useMemo(
        () =>
            Array.from(groupedBidMap.keys())
                .toSorted((a, b) => (BigInt(a) > BigInt(b) ? -1 : 1))
                .slice(0, visibleRows),
        [groupedBidMap, visibleRows]
    )

    // The largest cumulative value across all visible rows — used to scale the depth bar widths
    const highestRowValue = useMemo(
        () =>
            !selectedMarket
                ? 0n
                : computeHighestRowValue(slicedAsks, groupedAskMap, slicedBids, groupedBidMap),
        [groupedAskMap, groupedBidMap, selectedMarket, slicedAsks, slicedBids]
    )

    // Mid price = average of the best ask and best bid prices
    const midPrice = useMemo((): bigint | undefined => {
        const bestAsk = slicedAsks[0]
        const bestBid = slicedBids[0]
        return bestAsk && bestBid && selectedMarket
            ? (BigInt(bestAsk) + BigInt(bestBid)) / 2n
            : undefined
    }, [selectedMarket, slicedAsks, slicedBids])

    // Track the previous mid price to determine price direction for color coding
    const previousMidPrice = usePrevious(midPrice)
    const isMidPriceGreen = useMemo(
        () =>
            Boolean(
                previousMidPrice !== undefined &&
                    midPrice !== undefined &&
                    previousMidPrice < midPrice
            ),
        [previousMidPrice, midPrice]
    )

    const { buyPercentage, sellPercentage } = useMemo(() => {
        let totalBid = 0n
        let totalAsk = 0n
        for (const price of slicedAsks) {
            totalAsk += groupedAskMap.get(price) || 0n
        }
        for (const price of slicedBids) {
            totalBid += groupedBidMap.get(price) || 0n
        }
        const total = totalBid + totalAsk
        if (total === 0n) return { buyPercentage: 50, sellPercentage: 50 }
        const buy = Number((totalBid * 100n) / total)
        return { buyPercentage: buy, sellPercentage: 100 - buy }
    }, [groupedAskMap, groupedBidMap, slicedAsks, slicedBids])

    return {
        market: selectedMarket,
        askMap: groupedAskMap,
        bidMap: groupedBidMap,
        slicedAsks,
        slicedBids,
        highestRowValue,
        midPrice,
        isMidPriceGreen,
        buyPercentage,
        sellPercentage,
        // Show a loading state until the socket is connected and the first snapshot has arrived
        showLoading: !isConnected || !hasSnapshot,
        visibleRows,
    }
}
