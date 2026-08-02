import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Marker } from "@/components/primitives"
import { CountNumber } from "@/components/CountNumber"
import { SpecPanel } from "@/components/SpecPanel"
import { MaskLine } from "@/components/fx/SplitText"
import { PointerField } from "@/components/fx/PointerField"
import { Magnetic } from "@/components/fx/Magnetic"
import { Tilt } from "@/components/fx/Tilt"
import { PageNext } from "@/components/PageShell"
import { EASE_REVEAL } from "@/lib/motion"

const ROTATIONS: [string, string][] = [
  ["jeweler", "Dallas"],
  ["med spa", "Austin"],
  ["law firm", "Miami"],
  ["boutique", "Nashville"],
  ["dentist", "Scottsdale"],
]

/** Rotating word — soft rise/fade swap, wraps naturally, never clips. */
function WordSwap({ value }: { value: string }) {
  const reduce = useReducedMotion()
  return (
    <span className="inline-flex text-blue">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: "0.24em", filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: "-0.24em", filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: EASE_REVEAL }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Home() {
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

  // Depth: the audit panel drifts slower than the headline as the page leaves.
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const drift = useSpring(scrollYProgress, { stiffness: 80, damping: 26 })
  const panelY = useTransform(drift, [0, 1], [0, -46])
  const headlineY = useTransform(drift, [0, 1], [0, 18])

  return (
    <>
      <header
        ref={heroRef}
        id="top"
        className="relative overflow-hidden pt-24 pb-8 sm:pt-28"
      >
        {/* the cursor-reactive ground the whole hero sits on */}
        <PointerField className="z-0" gap={36} radius={190} push={30} fade={0.5} />

        <Container className="relative z-10">
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 flex items-center justify-between border-t-2 border-ink pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground dark:border-border-strong"
          >
            <span>AI Visibility Index</span>
            <span className="hidden sm:inline">One client per market</span>
            <span className="inline-flex items-center gap-2 text-foreground/70">
              <span className="size-[6px] rounded-full bg-yellow" />
              Baseline in progress
            </span>
          </motion.div>

          <div className="relative mt-12 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <motion.div
              style={reduce ? undefined : { y: headlineY }}
              className="lg:col-span-8 lg:col-start-1 lg:row-start-1"
            >
              <h1 className="font-display text-h1 font-[640] tracking-[-0.03em]">
                <MaskLine delay={0.1}>Ask AI for the best</MaskLine>
                <MaskLine delay={0.2}>
                  <WordSwap value={category} /> in <WordSwap value={city} />.
                </MaskLine>
                <MaskLine delay={0.3}>
                  Does it <span className="hl-yellow">say your name?</span>
                </MaskLine>
              </h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.46 }}
                className="mt-8 max-w-[34ch] text-lead text-muted-foreground"
              >
                It names three businesses.{" "}
                <span className="font-medium text-foreground">
                  Cited makes you one of them.
                </span>
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.56 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Magnetic strength={7}>
                  <Button asChild size="lg">
                    <Link to="/try">
                      See your visibility team <ArrowRight />
                    </Link>
                  </Button>
                </Magnetic>
                {/*
                  The homepage previously offered no route to the demo at all.
                  Every comparable site pairs the self-serve action with a
                  human one right here, in the hero, where intent is highest.
                */}
                <Magnetic strength={7}>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/demo">Get your report</Link>
                  </Button>
                </Magnetic>
                <Link
                  to="/shift"
                  className="text-[14px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Why now
                </Link>
              </motion.div>
            </motion.div>

            <div className="relative z-20 mt-14 sm:max-w-[430px] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mt-0 lg:max-w-none lg:translate-y-[120px] lg:-mr-4 lg:justify-self-end">
              <motion.div style={reduce ? undefined : { y: panelY }}>
                <Tilt max={8} className="overflow-hidden rounded-[var(--r-lg)]">
                  <SpecPanel />
                </Tilt>
              </motion.div>
            </div>
          </div>

          <motion.dl
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.68 }}
            className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-6 lg:max-w-[58%]"
          >
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
              label={<>engines watched: GPT, Perplexity,<br />Gemini, Claude</>}
            />
          </motion.dl>
        </Container>
      </header>

      <Container>
        <div className="flex items-center gap-3 pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          <Marker tone="yellow" />
          Short pages. Scroll to travel, not to hunt.
        </div>
      </Container>

      <PageNext to="/shift" label="The shift" kicker="Start here" />
    </>
  )
}

function HeroStat({ figure, label }: { figure: ReactNode; label: ReactNode }) {
  return (
    // <dt> must precede <dd> for the pair to be associated; the visual order
    // (figure above label) is restored with flex-col-reverse.
    <div className="flex flex-col-reverse">
      <dt className="mt-2 font-mono text-[10px] uppercase leading-[1.55] tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-display text-[1.9rem] font-[640] leading-none tracking-[-0.01em] text-foreground tnum">
        {figure}
      </dd>
    </div>
  )
}
