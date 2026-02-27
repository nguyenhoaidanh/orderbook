import { Button, Modal, ModalContent, Spacer } from "@heroui/react"
import { memo, useCallback } from "react"

import MarketItem from "@/components/modal/select-market/market-item"
import { useOrderBookStore } from "@/store/order-book-store"
import { Market } from "@/types/market"

function ModalSelectMarket({
    marketList,
    isOpen,
    onClose,
    onOpenChange,
}: {
    marketList: Market[]
    isOpen: boolean
    onClose: () => void
    onOpenChange: (isOpen: boolean) => void
}) {
    const setMarket = useOrderBookStore((s) => s.setMarket)
    const selectedMarketId = useOrderBookStore((s) => s.selectedMarketId)
    const setMarketAndClose = useCallback(
        (market: Market) => {
            setMarket(market)
            onClose()
        },
        [setMarket, onClose]
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            backdrop="blur"
            hideCloseButton
            disableAnimation
        >
            <ModalContent className="max-w-100 bg-orderBg md:p-4 p-3 pb-0 text-foreground dark h-fit max-h-[70vh] self-end sm:h-auto sm:max-h-none sm:self-auto overflow-x-hidden">
                <div className="flex items-center justify-between">
                    <div className="text-l font-medium">Select a market</div>
                    <Button
                        isIconOnly
                        variant="light"
                        className="h-6 w-6 min-w-fit p-0 border border-foreground/20"
                        onPress={onClose}
                    >
                        <i className="ri-close-line text-lg" />
                    </Button>
                </div>

                <Spacer y={4} />

                <div className="relative -mx-4 border-t-1 border-t-background overflow-y-auto max-h-[50vh]">
                    {marketList?.length > 0 ? (
                        marketList.map((market) => (
                            <MarketItem
                                key={market.market_id}
                                market={market}
                                setMarket={setMarketAndClose}
                                isSelected={market.market_id === selectedMarketId}
                            />
                        ))
                    ) : (
                        <p className="py-4 text-center text-sm text-foreground/50">
                            No markets found
                        </p>
                    )}
                </div>
            </ModalContent>
        </Modal>
    )
}

const MemoizedModalSelectMarket = memo(ModalSelectMarket)
export default MemoizedModalSelectMarket
