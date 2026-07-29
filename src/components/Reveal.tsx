import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { DUR, EASE_REVEAL, viewportOnce } from "@/lib/motion"
import { cn } from "@/lib/utils"

type RevealProps = {
  children: ReactNode
  className?: string
  /** delay in seconds */
  delay?: number
  /** vertical travel in px */
  y?: number
  as?: "div" | "section" | "li" | "span"
}

/** Fires once when scrolled into view. Reduced-motion users get the final
 *  state instantly (framer-motion drops transforms under the OS setting). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div
  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: DUR.reveal, ease: EASE_REVEAL, delay }}
    >
      {children}
    </MotionTag>
  )
}
