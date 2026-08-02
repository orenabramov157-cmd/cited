import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { useHasPointer } from "@/lib/pointer"
import { cn } from "@/lib/utils"

/**
 * Magnetic hover. The child leans toward the cursor while it is nearby and
 * springs back when it leaves. `strength` is the maximum travel in px.
 * Inert under prefers-reduced-motion and on touch pointers.
 */
export function Magnetic({
  children,
  strength = 10,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const reduce = useReducedMotion()
  const hasPointer = useHasPointer()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.5 })
  const y = useSpring(my, { stiffness: 260, damping: 18, mass: 0.5 })

  const enabled = !reduce && hasPointer

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      style={enabled ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!enabled || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength)
        my.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
