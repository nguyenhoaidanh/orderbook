import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/*.test.ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    collectCoverageFrom: [
        "src/utils/crc32.ts",
        "src/utils/order-book.ts",
        "src/store/order-book-store.ts",
    ],
    coverageThreshold: {
        global: { branches: 80, functions: 90, lines: 90 },
    },
}

export default config
