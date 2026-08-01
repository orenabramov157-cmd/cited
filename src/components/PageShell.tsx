import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { MaskLine } from "@/components/fx/SplitText"
import { Magnetic } from "@/components/fx/Magnetic"
import { PointerField } from "@/components/fx/PointerField"
import { EASE_REVEAL } from "@/lib/motion"
import { trackIndex, TRACK } from "@/lib/route-order"
import { cn } from "@/lib/utils"

/**
 * Page masthead. Every inner page opens the same way: index, eyebrow, one
 * animated headline, at most one line of lead copy. Short by construction.
 */
export function PageHead({
  index,
  eyebrow,
  title,
  lead,
  tone = "blue",
}: {
  index: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  tone?: "blue" | "coral" | "green"
}) {
  const reduce = useReducedMotion()
  return (
    <div className="relative pt-28 sm:pt-32">
      {/* every stop stands on the same reactive ground as the hero */}
      <PointerField
        className="!inset-auto !left-0 !right-0 !top-0 h-[420px]"
        gap={40}
        radius={172}
        push={22}
        fade={0.3}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center gap-3.5 border-t-2 border-ink pt-3.5 dark:border-border-strong"
      >
        <span className="font-mono text-caption tabular-nums text-faint">{index}</span>
        <Eyebrow tone={tone}>
          <Marker tone={tone} />
          {eyebrow}
        </Eyebrow>
      </motion.div>

      <h1 className="relative mt-7 max-w-[24ch] font-display text-h1 font-[640] tracking-[-0.03em]">
        {title}
      </h1>

      {lead ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.34 }}
          className="relative mt-6 max-w-[46ch] text-lead text-muted-foreground"
        >
          {lead}
        </motion.p>
      ) : null}
    </div>
  )
}

export { MaskLine }

/**
 * End-of-page pager. The scroll gesture already carries most people sideways
 * to the next stop, so this is the deliberate, clickable, keyboard-reachable
 * version of the same move — and the reason the gesture is never a trap.
 */
export function PageNext({
  to,
  label,
  kicker = "Next",
}: {
  to: string
  label: string
  kicker?: string
}) {
  const idx = trackIndex(to)
  return (
    <Container className="pb-16 pt-14">
      <Link
        to={to}
        className="group block border-t-2 border-ink pt-6 dark:border-border-strong"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <span className="eyebrow text-faint">
              {kicker}
              {idx >= 0 ? ` · ${TRACK[idx].n}` : ""}
            </span>
            <div className="mt-2 font-display text-h2 font-[640] tracking-[-0.025em] transition-colors duration-300 group-hover:text-blue">
              <span className="relative inline-block">
                {label}
                <span className="absolute inset-x-0 -bottom-1 h-[3px] origin-left scale-x-0 bg-yellow transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              </span>
            </div>
          </div>
          <Magnetic strength={9}>
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-border-strong text-blue transition-colors duration-300 group-hover:border-blue group-hover:bg-blue-soft">
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </Magnetic>
        </div>
      </Link>
    </Container>
  )
}

/** A page section with generous but bounded rhythm. */
export function Block({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn("py-10 md:py-12", className)}>{children}</section>
}
