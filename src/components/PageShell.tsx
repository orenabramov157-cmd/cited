import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { MaskLine } from "@/components/fx/SplitText"
import { Magnetic } from "@/components/fx/Magnetic"
import { EASE_REVEAL } from "@/lib/motion"
import { PAGES } from "@/components/Nav"
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
    <div className="pt-28 sm:pt-32">
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3.5 border-t-2 border-ink pt-3.5 dark:border-border-strong"
      >
        <span className="font-mono text-caption tabular-nums text-faint">{index}</span>
        <Eyebrow tone={tone}>
          <Marker tone={tone} />
          {eyebrow}
        </Eyebrow>
      </motion.div>

      <h1 className="mt-7 max-w-[24ch] font-display text-h1 font-[640] tracking-[-0.03em]">
        {title}
      </h1>

      {lead ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.34 }}
          className="mt-6 max-w-[46ch] text-lead text-muted-foreground"
        >
          {lead}
        </motion.p>
      ) : null}
    </div>
  )
}

export { MaskLine }

/**
 * End-of-page pager. Replaces "keep scrolling" with one deliberate step, and
 * it is the biggest hover target on the page so the motion has room to play.
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
  const idx = PAGES.findIndex((p) => p.to === to)
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
              {idx >= 0 ? ` · ${PAGES[idx].n}` : ""}
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
