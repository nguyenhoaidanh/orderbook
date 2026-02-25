const TABLE = (() => {
    const t: number[] = []
    for (let i = 0; i < 256; i++) {
        let c = i
        for (let j = 0; j < 8; j++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        }
        t[i] = c
    }
    return t
})()

export function crc32(str: string): number {
    let crc = 0xffffffff
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ TABLE[(crc ^ str.charCodeAt(i)) & 0xff]
    }
    return (crc ^ 0xffffffff) >>> 0
}

export function computeOrderBookChecksum(
    bids: Map<string, bigint>,
    asks: Map<string, bigint>
): number {
    const sortedBids = [...bids.keys()].sort((a, b) => (BigInt(b) > BigInt(a) ? 1 : -1))
    const sortedAsks = [...asks.keys()].sort((a, b) => (BigInt(a) > BigInt(b) ? 1 : -1))
    const parts: string[] = []
    const len = Math.max(sortedBids.length, sortedAsks.length)
    for (let i = 0; i < len; i++) {
        if (i < sortedBids.length) parts.push(sortedBids[i], bids.get(sortedBids[i])!.toString())
        if (i < sortedAsks.length) parts.push(sortedAsks[i], asks.get(sortedAsks[i])!.toString())
    }
    return crc32(parts.join(":"))
}
