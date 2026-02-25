import { getActiveMarkets } from "@/utils/api-client"
import Image from "next/image"

import OrderBook from "@/components/order-book/order-book"

export const revalidate = 300

export default async function Page() {
    const markets = await getActiveMarkets()

    return (
        <div className="min-h-screen bg-orderBg flex justify-center flex-col items-center md:p-4 p-3 md:gap-6 gap-4">
            <Image src="/risex.svg" alt="RiseX" width={100} height={20} priority />
            <OrderBook markets={markets} />
        </div>
    )
}
