import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"

import "./globals.css"
import "remixicon/fonts/remixicon.css"

import Providers from "./providers"

const font = Roboto_Mono({
    subsets: ["latin"],
    display: "swap",
    weight: "400",
})

export const metadata: Metadata = {
    title: "Rise Order Book",
    description: "Rise Order Book Assignment",
    icons: {
        icon: "/risex.svg",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={font.className} suppressHydrationWarning>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
