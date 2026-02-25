import DisplayModeToggle from "@/components/order-book/settings/display-mode-toggle"
import OrderBookTickSetting from "@/components/order-book/settings/tick-setting"
import { useOrderBookStore } from "@/store/order-book-store"

export default function OrderBookSetting({ children }: { children?: React.ReactNode }) {
    const { displayMode, setDisplayMode } = useOrderBookStore()

    return (
        <div className="flex items-center w-full gap-2 justify-between">
            {children}
            <div className={`flex gap-2 ${children ? "" : "w-full justify-between"}`}>
                <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
                <OrderBookTickSetting />
            </div>
        </div>
    )
}
