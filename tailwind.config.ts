import { heroui } from "@heroui/react"
import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                flash: {
                    "0%": { backgroundColor: "rgba(255,255,255,0.15)" },
                    "100%": { backgroundColor: "transparent" },
                },
            },
            animation: {
                flash: "flash 400ms ease-out",
            },
            colors: {
                askRed: "#CA3F64",
                bidGreen: "#25A750",
                orderBg: "#131313",
                orderBorder: "#2e2e2e",
                orderMuted: "#909090",
            },
        },
    },
    darkMode: "class",
    plugins: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (heroui as any)({
            themes: {
                dark: {
                    colors: {
                        background: "#161c20",
                    },
                },
            },
        }),
    ],
}
export default config
