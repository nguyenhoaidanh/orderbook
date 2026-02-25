"use client"

import { useDisclosure } from "@heroui/react"
import { useEffect } from "react"

import ModalSelectMarket from "@/components/modal/select-market/modal-select-market"
import OrderBookPanel from "@/components/order-book/order-book-panel"
import { useOrderBookData } from "@/hooks/order-book/use-order-book-data"
import { useOrderBookSocket } from "@/hooks/order-book/use-order-book-socket"
import { useOrderBookStore } from "@/store/order-book-store"
import { Market } from "@/types/market"

export default function OrderBook({ markets: marketList }: { markets: Market[] }) {
    const setMarketList = useOrderBookStore((s) => s.setMarketList)
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
    const orderBookData = useOrderBookData()
    useOrderBookSocket()

    useEffect(() => {
        setMarketList(marketList)
    }, [marketList, setMarketList])

    return (
        <>
            <ModalSelectMarket
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onClose}
                marketList={marketList}
            />
            <OrderBookPanel onSelectMarket={onOpen} {...orderBookData} />
        </>
    )
}
