import { useRef, type ReactNode } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"

/**
 * Continuous counter-scroll drift. The block starts slightly below its
 * natural spot when it enters at the bottom of the viewport and glides
 * upward the WHOLE time it crosses the screen, scrubbed to scroll in both
 * directions. The user scrolls down while the content moves up: both
 * motions at once. `amount` sets the travel; vary it between neighbors so
 * they drift at different speeds.
 */
export function Rise({
  amount = 48,
  fade = true,
  className,
  id,
  children,
}: {
  amount?: number
  fade?: boolean
  className?: string
  id?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    restDelta: 0.001,
  })
  const y = useTransform(smooth, [0, 1], [amount, -amount * 0.55])
  const opacity = useTransform(smooth, [0, 0.14], [0, 1])

  if (reduce)
    return (
      <div id={id} className={className}>
        {children}
      </div>
    )
  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ y, opacity: fade ? opacity : undefined }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
