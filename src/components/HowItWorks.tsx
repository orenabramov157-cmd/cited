import { useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Container, SectionHeading } from "@/components/primitives"
import { Rise } from "@/components/Rise"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    k: "Baseline",
    color: "var(--ink)",
    title: "First, the uncomfortable snapshot.",
    d: "Your real buyer questions, four engines, three passes. Do they name you?",
  },
  {
    k: "Diagnose",
    color: "var(--primary-blue)",
    title: "Trace why the machine picked them.",
    d: "Every loss traced to the sources the AI leaned on.",
  },
  {
    k: "Fix",
    color: "var(--primary-blue)",
    title: "Move the signals that decide it.",
    d: "The moves that change who gets named, shipped in sequence.",
  },
  {
    k: "Re-measure",
    color: "var(--data-green)",
    title: "Same questions. Different answer.",
    d: "Same questions again. Absent → named, in black and white.",
  },
]

/** Rail tab — label + underline that fills with that step's scroll progress. */
function RailTab({
  i,
  active,
  progress,
  onClick,
}: {
  i: number
  active: boolean
  progress: MotionValue<number>
  onClick: () => void
}) {
  const step = STEPS[i]
  const fill = useTransform(progress, [i / STEPS.length, (i + 1) / STEPS.length], [0, 1])
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      className="group flex w-fit cursor-pointer flex-col items-start text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="flex items-baseline gap-2.5">
        <span className="font-mono text-[10px] tabular-nums text-faint">
          {String(i + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "font-display text-[17px] font-[560] tracking-[-0.01em] transition-colors duration-400",
            active ? "text-foreground" : "text-faint group-hover:text-muted-foreground"
          )}
        >
          {step.k}
        </span>
      </span>
      <span
        aria-hidden
        className="relative mt-2 h-px w-[176px] overflow-visible bg-border"
      >
        <motion.span
          className="absolute -top-px left-0 h-[3px] w-full origin-left"
          style={{ scaleX: fill, backgroundColor: step.color }}
        />
      </span>
    </button>
  )
}

export function HowItWorks() {
  const reduce = useReducedMotion()
  const stepsRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  // One listener drives everything: overall progress through the step column.
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 0.55", "end 0.65"],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })
  const progress = reduce ? scrollYProgress : smooth

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))))
  })

  const scrollToStep = (i: number) => {
    document.getElementById(`how-step-${i}`)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    })
  }

  return (
    <section id="how" className="relative border-t border-border py-8 md:py-12">
      <Container>
        <SectionHeading
          eyebrow="The Method"
          index="03"
          tone="green"
          title={
            <>
              We don't guess. We measure it, move it,{" "}
              <span className="text-green">and measure again.</span>
            </>
          }
          lead={
            <>
              A before-and-after on your real customer questions. Lift, not vibes.
            </>
          }
        />

        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* pinned rail — stays with you while the steps scroll (lg+) */}
          <div className="hidden lg:col-span-4 lg:block">
            <nav
              aria-label="Method steps"
              className="sticky top-28 flex flex-col items-start gap-5 py-6"
            >
              {STEPS.map((s, i) => (
                <RailTab
                  key={s.k}
                  i={i}
                  active={active === i}
                  progress={progress}
                  onClick={() => scrollToStep(i)}
                />
              ))}
              <p className="mt-4 max-w-[24ch] text-[14px] leading-relaxed text-faint">
                One loop. Four to six weeks. Evidence at both ends.
              </p>
            </nav>
          </div>

          {/* scrolling step column */}
          <div ref={stepsRef} className="lg:col-span-7 lg:col-start-6">
            {STEPS.map((s, i) => (
              <article
                key={s.k}
                id={`how-step-${i}`}
                className={cn(
                  "scroll-mt-28 border-t border-border py-7 first:border-t-0 first:pt-0 lg:flex lg:min-h-[32vh] lg:flex-col lg:justify-center lg:py-8"
                )}
              >
                <Rise amount={46}>
                  <div className="flex items-baseline gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em]">
                    <span className="tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ color: s.color }} className="font-medium">
                      {s.k}
                    </span>
                  </div>
                  <h3 className="mt-3 max-w-[24ch] font-display text-[1.6rem] font-[620] leading-[1.15] tracking-[-0.02em] sm:text-[1.85rem]">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 max-w-[52ch] text-[16px] leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                  {[<BaselinePanel key="b" />, <DiagnosePanel key="d" />, <FixPanel key="f" />, <RemeasurePanel key="r" />][i]}
                </Rise>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ---------- illustrative panels — format only, no claimed results ---------- */

function PanelShell({
  title,
  meta,
  children,
}: {
  title: string
  meta: string
  children: React.ReactNode
}) {
  // KokonutUI-style spotlight — a soft cobalt glow that tracks the cursor
  const mx = useMotionValue(-300)
  const my = useMotionValue(-300)
  const spotlight = useMotionTemplate`radial-gradient(230px circle at ${mx}px ${my}px, var(--spotlight), transparent 72%)`
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
      }}
      onMouseLeave={() => {
        mx.set(-300)
        my.set(-300)
      }}
      className="group relative mt-5 max-w-[520px] overflow-hidden rounded-[var(--r-lg)] border border-border bg-panel shadow-[var(--shadow-panel)] transition-colors duration-300 hover:border-blue/45"
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em]">
        <span className="font-medium text-foreground/85">{title}</span>
        <span className="text-faint">{meta}</span>
      </div>
      <div className="px-5 py-3.5">{children}</div>
    </div>
  )
}

const QUERIES = [
  "best jeweler in Dallas",
  "custom engagement ring designer",
  "highest-rated jewelry store",
]

function BaselinePanel() {
  return (
    <PanelShell title="◳ Baseline run" meta="4 engines · 3 passes">
      <div className="flex flex-col gap-3">
        {QUERIES.map((q) => (
          <div key={q} className="flex items-center justify-between gap-4">
            <span className="truncate text-[14px] text-muted-foreground">“{q}”</span>
            <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((e) => (
                <span key={e} className="size-[9px] rounded-[1px] bg-coral/75" />
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
        <span className="size-[9px] rounded-[1px] bg-coral/75" aria-hidden />
        competitor named · you, absent
      </div>
    </PanelShell>
  )
}

function DiagnosePanel() {
  const rows = [
    ["Directory citations", "w-[82%]"],
    ["Review corpus", "w-[64%]"],
    ["Entity & schema signals", "w-[38%]"],
    ["Answer-page content", "w-[24%]"],
  ] as const
  return (
    <PanelShell title="◳ Source trace" meta="what the answer leaned on">
      <div className="flex flex-col gap-3.5">
        {rows.map(([label, w]) => (
          <div key={label}>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-1.5 h-[6px] w-full rounded-[1px] bg-border/60">
              <div className={cn("h-full rounded-[1px] bg-blue", w)} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-border pt-3 font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
        categories shown. The source map stays in-house
      </div>
    </PanelShell>
  )
}

function FixPanel() {
  const rows = [
    ["Trusted-source citations", "shipped", "bg-green", "text-green"],
    ["Schema & entity signals", "shipped", "bg-green", "text-green"],
    ["Review thresholds", "in progress", "bg-yellow", "text-foreground/70"],
    ["Answer-page content", "queued", "bg-border-strong", "text-faint"],
  ] as const
  return (
    <PanelShell title="◳ Fix queue" meta="shipped in sequence">
      <ul className="flex flex-col gap-3">
        {rows.map(([label, status, dot, tone]) => (
          <li key={label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
              <span className={cn("size-[7px] rounded-[1px]", dot)} aria-hidden />
              {label}
            </span>
            <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.08em]", tone)}>
              {status}
            </span>
          </li>
        ))}
      </ul>
    </PanelShell>
  )
}

function RemeasurePanel() {
  return (
    <PanelShell title="◳ Re-measure" meta="same questions, same protocol">
      <div className="flex flex-col gap-3">
        {QUERIES.map((q) => (
          <div key={q} className="flex items-center justify-between gap-4">
            <span className="truncate text-[14px] text-muted-foreground">“{q}”</span>
            <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em]">
              <span className="text-faint line-through decoration-coral/60">absent</span>
              <ArrowRight size={11} className="text-faint" aria-hidden />
              <span className="rounded-[2px] bg-green/12 px-1.5 py-0.5 font-medium text-green">
                named
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-border pt-3 font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
        the goal state. Every claim ships with dated screenshots
      </div>
    </PanelShell>
  )
}
