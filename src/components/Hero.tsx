import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Marker } from "@/components/primitives"
import { CountNumber } from "@/components/CountNumber"
import { EASE_REVEAL } from "@/lib/motion"

const ROTATIONS: [string, string][] = [
  ["jeweler", "Dallas"],
  ["med spa", "Austin"],
  ["law firm", "Miami"],
  ["boutique", "Nashville"],
  ["dentist", "Scottsdale"],
]

function MaskLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.05em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: "112%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_REVEAL, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Rotating word — soft rise/fade swap, wraps naturally, never clips. */
function WordSwap({ value }: { value: string }) {
  const reduce = useReducedMotion()
  return (
    <span className="inline-flex text-blue">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: "0.24em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: "-0.24em" }}
          transition={{ duration: 0.38, ease: EASE_REVEAL }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const reduce = useReducedMotion()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (reduce) return
    let intervalId: number | undefined
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(
        () => setIdx((v) => (v + 1) % ROTATIONS.length),
        3600
      )
    }, 2200)
    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [reduce])

  const [category, city] = ROTATIONS[idx]

  // Depth: the audit panel drifts slightly slower than the headline on scroll.
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const drift = useSpring(scrollYProgress, { stiffness: 80, damping: 26 })
  const panelY = useTransform(drift, [0, 1], [0, -46])
  const headlineY = useTransform(drift, [0, 1], [0, 14])

  return (
    <header
      ref={heroRef}
      id="top"
      className="relative overflow-hidden pt-24 pb-14 sm:pt-28 lg:pb-20"
    >
      <Container>
        {/* masthead rule — thin directional element */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 flex items-center justify-between border-t-2 border-ink pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        >
          <span>AI Visibility Index</span>
          <span className="hidden sm:inline">Local &amp; luxury retail · Dallas — Fort Worth</span>
          <span className="inline-flex items-center gap-2 text-green">
            <span className="size-[6px] rounded-full bg-green" />
            Live
          </span>
        </motion.div>

        <div className="relative mt-12 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* dominant mass: headline */}
          <motion.div
            style={reduce ? undefined : { y: headlineY }}
            className="lg:col-span-9 lg:col-start-1 lg:row-start-1"
          >
            <h1 className="font-display text-h1 font-[640] tracking-[-0.03em]">
              <MaskLine delay={0.1}>When a customer asks AI</MaskLine>
              <MaskLine delay={0.18}>
                for the best <WordSwap value={category} /> in <WordSwap value={city} />,
              </MaskLine>
              <MaskLine delay={0.26}>
                does it <span className="hl-yellow">say your name?</span>
              </MaskLine>
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.42 }}
              className="mt-8 max-w-[46ch] text-lead text-muted-foreground"
            >
              Your buyers stopped Googling. They ask ChatGPT, Perplexity and Gemini — and
              the machine names a handful of businesses.{" "}
              <span className="font-medium text-foreground">
                Cited makes sure you're one of them.
              </span>
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.52 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg">
                <a href="#build">
                  See your visibility team <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">The method</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* secondary mass: audit panel — overlaps the headline from the right */}
          <div className="relative z-20 mt-12 sm:max-w-[430px] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mt-0 lg:max-w-none lg:translate-y-[210px] lg:-mr-4 lg:justify-self-end">
            {/* nested so framer's transform doesn't clobber the Tailwind translate above */}
            <motion.div style={reduce ? undefined : { y: panelY }}>
              <SpecPanel />
            </motion.div>
          </div>
        </div>

        {/* counterweights: stats lower-left + scroll cue far right */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.64 }}
          className="mt-14 flex items-end justify-between gap-6 border-t border-border pt-7 lg:mt-10 lg:max-w-[58%]"
        >
          <dl className="flex flex-wrap gap-x-10 gap-y-6">
            <HeroStat
              figure={<CountNumber value={1.2} decimals={1} prefix="~" suffix="%" />}
              label={<>of local businesses<br />get named by AI</>}
            />
            <HeroStat
              figure={<CountNumber value={4.3} decimals={1} suffix="★" />}
              label={<>the rating bar<br />ChatGPT looks for</>}
            />
            <HeroStat
              figure="4"
              label={<>engines watched — GPT,<br />Perplexity, Gemini, Claude</>}
            />
          </dl>
          <a
            href="#problem"
            className="hidden shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint transition-colors hover:text-blue sm:inline-flex"
          >
            The shift <ArrowDown size={13} />
          </a>
        </motion.div>
      </Container>
    </header>
  )
}

function HeroStat({ figure, label }: { figure: ReactNode; label: ReactNode }) {
  return (
    <div>
      <dd className="font-display text-[1.9rem] font-[640] leading-none tracking-[-0.01em] text-foreground tnum">
        {figure}
      </dd>
      <dt className="mt-2 font-mono text-[10px] uppercase leading-[1.55] tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
    </div>
  )
}

function SpecPanel() {
  const reduce = useReducedMotion()
  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_REVEAL, delay: 0.3 }}
      aria-label="AI visibility audit"
      className="relative overflow-hidden rounded-[var(--r-lg)] border border-border bg-panel shadow-[var(--shadow-panel)]"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.1em]">
        <span className="font-medium text-foreground">◳ Visibility audit</span>
        <span className="inline-flex items-center gap-2 text-green">
          <span className="size-[6px] rounded-full bg-green" />
          Active
        </span>
      </div>

      <div className="px-5 py-5">
        <div className="font-display text-[1.3rem] font-[640] tracking-[-0.01em]">
          AI Recommendation Engine
        </div>
        <div className="mt-1 font-mono text-[10.5px] text-muted-foreground">
          Vertical-tuned · built on your real signals
        </div>

        <div className="my-5 grid grid-cols-2 gap-y-5 border-y border-border py-5">
          <PanelMetric k="Agents" v={<CountNumber value={6} />} />
          <PanelMetric k="Engines" v={<CountNumber value={4} />} />
          <PanelMetric k="Baseline" v={<><CountNumber value={48} /> hrs</>} />
          <PanelMetric k="Working" v="24 / 7" />
        </div>

        <ul className="flex flex-col gap-2.5">
          {[
            "Trusted-source citations",
            "Schema & entity signals",
            "Review thresholds",
            "Answer-page content",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
              <span className="size-[6px] rounded-[1px] bg-blue" aria-hidden />
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
          <span>Monitoring · 4 engines</span>
          <Marker tone="yellow" />
        </div>
      </div>
    </motion.aside>
  )
}

function PanelMetric({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{k}</div>
      <div className="mt-1 font-display text-[1.35rem] font-[640] leading-none tnum">{v}</div>
    </div>
  )
}
