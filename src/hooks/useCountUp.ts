import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"

function easeExpoOut(t: number) {
  // matches the EASE_REVEAL feel closely enough for scalar counting
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Counts from 0 → `value` once the element enters view. Respects
 * reduced-motion (snaps to final). Returns [displayValue, ref].
 */
export function useCountUp(value: number, duration = 1100, decimals = 0) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      return
    }
    let raf = 0
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setDisplay(value * easeExpoOut(p))
      if (p < 1) raf = requestAnimationFrame(step)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, value, duration])

  const factor = Math.pow(10, decimals)
  const rounded = Math.round(display * factor) / factor
  return [rounded.toFixed(decimals), ref] as const
}
