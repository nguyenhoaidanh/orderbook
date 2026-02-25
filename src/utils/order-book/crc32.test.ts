import { computeOrderBookChecksum, crc32 } from "./crc32"

describe("crc32()", () => {
    it("returns 0 for empty string", () => {
        expect(crc32("")).toBe(0)
    })

    it('returns known vector for "a"', () => {
        expect(crc32("a")).toBe(0xe8b7be43)
    })

    it('returns standard test vector for "123456789"', () => {
        expect(crc32("123456789")).toBe(0xcbf43926)
    })

    it("returns an unsigned 32-bit integer", () => {
        const result = crc32("hello world")
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(0xffffffff)
    })

    it("is deterministic", () => {
        expect(crc32("test")).toBe(crc32("test"))
    })

    it("produces different values for different inputs", () => {
        expect(crc32("a")).not.toBe(crc32("b"))
    })
})

describe("computeOrderBookChecksum()", () => {
    it("returns 0 for empty maps", () => {
        expect(computeOrderBookChecksum(new Map(), new Map())).toBe(0)
    })

    it("sorts bids descending by price", () => {
        const bids = new Map<string, bigint>([
            ["1", 10n],
            ["3", 30n],
            ["2", 20n],
        ])
        const asks = new Map<string, bigint>()
        // sorted bids: 3, 2, 1 → "3:30:2:20:1:10"
        const expected = crc32("3:30:2:20:1:10")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it("sorts asks ascending by price", () => {
        const bids = new Map<string, bigint>()
        const asks = new Map<string, bigint>([
            ["3", 30n],
            ["1", 10n],
            ["2", 20n],
        ])
        // sorted asks: 1, 2, 3 → "1:10:2:20:3:30"
        const expected = crc32("1:10:2:20:3:30")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it("interleaves bids and asks correctly", () => {
        const bids = new Map<string, bigint>([["90", 5n]])
        const asks = new Map<string, bigint>([["100", 3n]])
        // i=0: push "90","5","100","3" → "90:5:100:3"
        const expected = crc32("90:5:100:3")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it("handles more bids than asks", () => {
        const bids = new Map<string, bigint>([
            ["90", 5n],
            ["80", 4n],
            ["70", 3n],
        ])
        const asks = new Map<string, bigint>([["100", 2n]])
        // sorted bids: 90,80,70 | sorted asks: 100
        // i=0: "90","5","100","2"  i=1: "80","4"  i=2: "70","3"
        const expected = crc32("90:5:100:2:80:4:70:3")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it("handles more asks than bids", () => {
        const bids = new Map<string, bigint>([["90", 5n]])
        const asks = new Map<string, bigint>([
            ["100", 2n],
            ["110", 3n],
            ["120", 4n],
        ])
        // sorted bids: 90 | sorted asks: 100,110,120
        // i=0: "90","5","100","2"  i=1: "110","3"  i=2: "120","4"
        const expected = crc32("90:5:100:2:110:3:120:4")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it('stringifies bigint quantities without "n" suffix', () => {
        const bids = new Map<string, bigint>([["100", 100n]])
        const asks = new Map<string, bigint>()
        const expected = crc32("100:100")
        expect(computeOrderBookChecksum(bids, asks)).toBe(expected)
    })

    it("is deterministic with the same maps", () => {
        const bids = new Map<string, bigint>([["90", 5n]])
        const asks = new Map<string, bigint>([["100", 3n]])
        expect(computeOrderBookChecksum(bids, asks)).toBe(computeOrderBookChecksum(bids, asks))
    })

    it("produces different checksum when data changes", () => {
        const bids1 = new Map<string, bigint>([["90", 5n]])
        const bids2 = new Map<string, bigint>([["90", 6n]])
        const asks = new Map<string, bigint>([["100", 3n]])
        expect(computeOrderBookChecksum(bids1, asks)).not.toBe(
            computeOrderBookChecksum(bids2, asks)
        )
    })
})
