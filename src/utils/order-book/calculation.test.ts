import { computeHighestRowValue, patchOrderLevels } from "./calculation"

// ---------------------------------------------------------------------------
// patchOrderLevels
// ---------------------------------------------------------------------------

describe("patchOrderLevels()", () => {
    it("adds a new price level to an empty map", () => {
        const map = new Map<string, bigint>()
        patchOrderLevels(map, [{ price: "100", quantity: "5", order_count: 1, block_number: 1 }])
        expect(map.get("100")).toBe(5n)
    })

    it("updates an existing price level with a new quantity", () => {
        const map = new Map<string, bigint>([["100", 5n]])
        patchOrderLevels(map, [{ price: "100", quantity: "9", order_count: 1, block_number: 1 }])
        expect(map.get("100")).toBe(9n)
    })

    it("removes a price level when quantity is '0'", () => {
        const map = new Map<string, bigint>([["100", 5n]])
        patchOrderLevels(map, [{ price: "100", quantity: "0", order_count: 0, block_number: 1 }])
        expect(map.has("100")).toBe(false)
    })

    it("does not add a level when quantity is '0' and level was absent", () => {
        const map = new Map<string, bigint>()
        patchOrderLevels(map, [{ price: "100", quantity: "0", order_count: 0, block_number: 1 }])
        expect(map.size).toBe(0)
    })

    it("applies multiple orders in sequence", () => {
        const map = new Map<string, bigint>()
        patchOrderLevels(map, [
            { price: "100", quantity: "5", order_count: 1, block_number: 1 },
            { price: "200", quantity: "3", order_count: 1, block_number: 1 },
            { price: "100", quantity: "0", order_count: 0, block_number: 1 }, // delete
        ])
        expect(map.has("100")).toBe(false)
        expect(map.get("200")).toBe(3n)
    })

    it("does nothing for an empty orders array", () => {
        const map = new Map<string, bigint>([["100", 5n]])
        patchOrderLevels(map, [])
        expect(map.get("100")).toBe(5n)
        expect(map.size).toBe(1)
    })
})

// ---------------------------------------------------------------------------
// computeHighestRowValue
// ---------------------------------------------------------------------------

describe("computeHighestRowValue()", () => {
    it("returns 0n when both sides are empty", () => {
        expect(computeHighestRowValue([], new Map(), [], new Map())).toBe(0n)
    })

    it("returns ask side total when ask sum > bid sum", () => {
        const askMap = new Map<string, bigint>([
            ["100", 10n],
            ["200", 20n],
        ])
        const bidMap = new Map<string, bigint>([["90", 5n]])
        // asks: 10+20=30, bids: 5 → 30
        expect(computeHighestRowValue(["100", "200"], askMap, ["90"], bidMap)).toBe(30n)
    })

    it("returns bid side total when bid sum > ask sum", () => {
        const askMap = new Map<string, bigint>([["100", 3n]])
        const bidMap = new Map<string, bigint>([
            ["90", 15n],
            ["80", 10n],
        ])
        // asks: 3, bids: 15+10=25 → 25
        expect(computeHighestRowValue(["100"], askMap, ["90", "80"], bidMap)).toBe(25n)
    })

    it("returns the tied value when ask sum equals bid sum", () => {
        const askMap = new Map<string, bigint>([["100", 10n]])
        const bidMap = new Map<string, bigint>([["90", 10n]])
        expect(computeHighestRowValue(["100"], askMap, ["90"], bidMap)).toBe(10n)
    })

    it("treats missing map entries as 0", () => {
        const askMap = new Map<string, bigint>([["100", 5n]])
        const bidMap = new Map<string, bigint>()
        // slicedBids contains a price not in bidMap → treated as 0
        expect(computeHighestRowValue(["100"], askMap, ["90"], bidMap)).toBe(5n)
    })

    it("only sums prices from the sliced arrays, not the full map", () => {
        // map has 3 levels but we only slice 1
        const askMap = new Map<string, bigint>([
            ["100", 5n],
            ["110", 10n],
            ["120", 20n],
        ])
        const bidMap = new Map<string, bigint>()
        // only "100" is in the slice → sum = 5
        expect(computeHighestRowValue(["100"], askMap, [], bidMap)).toBe(5n)
    })
})
