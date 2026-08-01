import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { usePointer, useHasPointer } from "@/lib/pointer"

/**
 * Trailing cursor ring. The native cursor stays visible (this is a marketing
 * site, not an art piece, and hiding it costs usability); the ring lags behind
 * it and swells over anything interactive. Desktop pointers only.
 */
export function Cursor() {
  const reduce = useReducedMotion()
  const hasPointer = useHasPointer()
  const { x, y } = usePointer(120, 18)
  const [hot, setHot] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduce || !hasPointer) return
    const interactive = "a, button, input, [role='button'], [data-cursor='hot']"
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null
      setHot(Boolean(t?.closest?.(interactive)))
      setVisible(true)
    }
    const onOut = () => setVisible(false)
    window.addEventListener("pointerover", onOver, { passive: true })
    window.addEventListener("pointerleave", onOut)
    return () => {
      window.removeEventListener("pointerover", onOver)
      window.removeEventListener("pointerleave", onOut)
    }
  }, [reduce, hasPointer])

  if (reduce || !hasPointer) return null

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
    >
      <motion.span
        animate={{
          width: hot ? 46 : 26,
          height: hot ? 46 : 26,
          opacity: visible ? (hot ? 0.9 : 0.42) : 0,
          borderWidth: hot ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="block -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue"
      />
    </motion.div>
  )
}
