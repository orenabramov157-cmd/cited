import { useEffect, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { EASE_REVEAL } from "@/lib/motion"

/**
 * Route transition. The outgoing page falls away and dims while a paper
 * curtain sweeps up from the bottom, then the incoming page rises in behind
 * it. No white flash, and scroll is reset per route.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [location.pathname])

  if (reduce) return <>{children}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} className="relative">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.42, ease: EASE_REVEAL }}
        >
          {children}
        </motion.div>

        {/* curtain: sweeps up on enter, down on exit */}
        <motion.span
          aria-hidden
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.44, ease: EASE_REVEAL }}
          style={{ originY: 0 }}
          className="pointer-events-none fixed inset-0 z-[55] bg-canvas"
        />
      </motion.div>
    </AnimatePresence>
  )
}
