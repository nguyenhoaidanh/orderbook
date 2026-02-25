export function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
    let last = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const throttled = (...args: T) => {
        const now = Date.now()
        const remaining = ms - (now - last)
        clearTimeout(timer)
        if (remaining <= 0) {
            timer = undefined
            last = now
            fn(...args)
        } else {
            timer = setTimeout(() => {
                last = Date.now()
                fn(...args)
            }, remaining)
        }
    }

    throttled.cancel = () => {
        clearTimeout(timer)
        timer = undefined
    }

    return throttled
}
