import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { AssetType, DisplayMode, useOrderBookStore } from "@/store/order-book-store"
import { Market } from "@/types/market"

interface UseOrderBookDisplayParams {
    market: Market | undefined
    highestRowValue: bigint
    midPrice: bigint | undefined
    visibleRows: number
}

export function useOrderBookDisplay({
    market,
    highestRowValue,
    midPrice,
    visibleRows,
}: UseOrderBookDisplayParams) {
    const { displayMode, flashMode, assetType, setAssetType } = useOrderBookStore(
        useShallow((s) => ({
            displayMode: s.displayMode,
            flashMode: s.flashMode,
            assetType: s.assetType,
            setAssetType: s.setAssetType,
        }))
    )

    const symbols = useMemo(
        () => market?.display_base_asset_symbol?.split("/") || [],
        [market?.display_base_asset_symbol]
    )
    const baseSymbol = symbols[0]
    const activeSymbol = assetType === AssetType.Base ? symbols[0] : symbols[1]

    const highestRowValueScaled = useMemo(() => {
        if (assetType === AssetType.Base) return highestRowValue
        if (!midPrice) return highestRowValue
        return (highestRowValue * midPrice) / 10n ** 18n
    }, [highestRowValue, assetType, midPrice])

    const isDefault = displayMode === DisplayMode.Default
    const isTwoCol = displayMode === DisplayMode.TwoCol
    const showAsk = displayMode !== DisplayMode.Bid
    const showBid = displayMode !== DisplayMode.Ask
    return {
        symbols,
        baseSymbol,
        activeSymbol,
        highestRowValueScaled,
        isDefault,
        isTwoCol,
        showAsk,
        showBid,
        visibleRows,
        flashMode,
        assetType,
        setAssetType,
    }
}
