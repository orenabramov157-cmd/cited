import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { EASE_REVEAL } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Word-level assemble. Each word rises out of a clipping mask with a small
 * blur burn-off, staggered left to right. Words stay whole words, so the text
 * still wraps and still reads to a screen reader as one string.
 */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as: As = "span",
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: "span" | "h1" | "h2" | "p"
}) {
  const reduce = useReducedMotion()
  const words = text.split(" ")

  if (reduce) return <As className={className}>{text}</As>

  return (
    <As className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "108%", opacity: 0, filter: "blur(5px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.62, ease: EASE_REVEAL, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </As>
  )
}

/** One masked line that rises on mount. Use for headline lines with markup. */
export function MaskLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span className={cn("block overflow-hidden pb-[0.06em]", className)}>
      <motion.span
        className="block"
        initial={reduce ? false : { y: "112%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.68, ease: EASE_REVEAL, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}
