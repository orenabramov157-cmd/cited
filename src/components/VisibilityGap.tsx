import { useRef } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Container, SectionHeading } from "@/components/primitives"
import { CountNumber } from "@/components/CountNumber"
import { EASE_REVEAL } from "@/lib/motion"

const DATA = [
  { m: "’24 Q3", v: 6 },
  { m: "Q4", v: 11 },
  { m: "’25 Q1", v: 19 },
  { m: "Q2", v: 28 },
  { m: "Q3", v: 37 },
  { m: "Now", v: 45 },
]

type TP = {
  active?: boolean
  payload?: Array<{ value: number; payload: { m: string } }>
}

function ChartTooltip({ active, payload }: TP) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-[var(--r-sm)] border border-border bg-popover px-3 py-2 shadow-[var(--shadow-md)]">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
        {p.payload.m}
      </div>
      <div className="mt-0.5 font-display text-lg font-[640] text-blue tnum">{p.value}%</div>
      <div className="font-mono text-[9.5px] text-muted-foreground">ask AI · local search</div>
    </div>
  )
}

/** Event marker label — small mono flag pinned to the top of the plot. */
function EventFlag({ viewBox, text }: { viewBox?: { x: number }; text: string }) {
  if (!viewBox) return null
  return (
    <text x={viewBox.x + 6} y={14} textAnchor="start" className="chart-flag">
      {text}
    </text>
  )
}

/** "Now" endpoint — solid dot with a slow radar pulse. */
function PulseDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx === undefined || cy === undefined) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} className="chart-pulse" />
      <circle cx={cx} cy={cy} r={4.5} fill="var(--blue)" stroke="var(--panel)" strokeWidth={2} />
    </g>
  )
}

export function VisibilityGap() {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const inView = useInView(chartRef, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()

  // Scroll-linked: the trend draws itself as the section moves through view.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "center 0.55"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  })
  // reveal wipes left→right; the un-drawn part is hidden by a panel-colored mask
  const maskLeft = useTransform(smooth, [0, 1], ["0%", "100%"])

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative border-y border-border bg-panel py-10 md:py-14"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <SectionHeading
            className="lg:col-span-7"
            eyebrow="The Shift"
            index="01"
            title={
              <>
                Search didn't die. It moved{" "}
                <span className="text-blue">inside the machine.</span>
              </>
            }
            lead={
              <>
                Nobody scrolls ten blue links anymore. They ask one question and take the
                few names the answer gives back — and if you're not in it, the customer
                never learns you exist.
              </>
            }
          />
          {/* marginal annotation — counterweight, top right */}
          <div className="mt-8 lg:col-span-4 lg:col-start-9 lg:mt-2">
            <p className="border-l-2 border-coral pl-4 text-[14.5px] leading-relaxed text-muted-foreground">
              Right now, for the queries that matter,{" "}
              <span className="font-medium text-coral">the AI is naming your competitors.</span>
            </p>
          </div>
        </div>

        {/* evidence: oversized stat overlapping the chart */}
        <div className="relative mt-8 lg:mt-10">
          <div className="lg:absolute lg:left-0 lg:top-1/2 lg:z-10 lg:max-w-[34%] lg:-translate-y-[56%]">
            <div className="font-display text-stat font-[680] tracking-[-0.03em] text-ink tnum dark:text-foreground">
              <CountNumber value={45} suffix="%" />
            </div>
            <p className="mt-3 max-w-[24ch] text-[14.5px] leading-relaxed text-muted-foreground">
              of buyers now ask AI to find a local business —{" "}
              <span className="font-medium text-foreground">and it climbs every quarter.</span>
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                The engines they ask
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["ChatGPT", "Perplexity", "Gemini", "Claude"].map((e) => (
                  <span
                    key={e}
                    className="rounded-[3px] border border-border px-2 py-0.5 font-mono text-[9.5px] text-muted-foreground"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* chart — right-weighted */}
          <div className="mt-8 lg:ml-[34%] lg:mt-0 lg:pl-8">
            <div className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
              <span className="eyebrow text-muted-foreground">Buyers asking AI · trend</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                share %
              </span>
            </div>
            <div ref={chartRef} className="relative h-[250px] w-full sm:h-[310px]">
              {/* scroll-linked wipe: hides the not-yet-"drawn" part of the trend */}
              {inView && !reduce && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 bg-panel"
                  style={{ left: maskLeft }}
                />
              )}
              {inView ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DATA} margin={{ top: 22, right: 12, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--hair)" />
                    <XAxis
                      dataKey="m"
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-strong)" }}
                      tick={{ fill: "var(--faint)", fontSize: 10.5, fontFamily: "var(--font-mono)" }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={42}
                      domain={[0, 50]}
                      ticks={[0, 25, 50]}
                      tick={{ fill: "var(--faint)", fontSize: 10.5, fontFamily: "var(--font-mono)" }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: "var(--blue)", strokeOpacity: 0.35, strokeWidth: 1 }}
                    />
                    {/* real timeline events — why the curve bends */}
                    <ReferenceLine
                      x="Q4"
                      stroke="var(--border-strong)"
                      strokeDasharray="2 4"
                      label={<EventFlag text="ChatGPT gets live search" />}
                    />
                    <ReferenceLine
                      x="Q2"
                      stroke="var(--border-strong)"
                      strokeDasharray="2 4"
                      label={<EventFlag text="AI answers go mainstream" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--blue)"
                      strokeWidth={2.25}
                      fill="url(#blueFill)"
                      dot={{ r: 2.5, fill: "var(--blue)", strokeWidth: 0 }}
                      activeDot={{
                        r: 4,
                        fill: "var(--blue)",
                        stroke: "var(--panel)",
                        strokeWidth: 2,
                      }}
                      // scroll drives the reveal now — no competing tween
                      isAnimationActive={false}
                    />
                    <ReferenceDot x="Now" y={45} shape={<PulseDot />} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-end gap-2 opacity-25" aria-hidden>
                  {[10, 16, 24, 34, 46, 60].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[2px] bg-border-strong"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-faint">
              Directional — vendor-reported ranges, shown to illustrate the shift, not a
              guarantee.
            </p>
          </div>
        </div>

        {/* the consequence, drawn — answer box + then/now flow */}
        <div className="mt-8 grid gap-6 border-t border-border pt-7 lg:mt-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <AnswerBox />
          </div>
          <div className="lg:col-span-6">
            <FlowCompare />
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ---------- the answer box — "3 names, then it stops", visualized ---------- */

const riseIn = (reduce: boolean | null, delay: number) => ({
  initial: reduce ? false : { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.45, ease: EASE_REVEAL, delay },
})

function AnswerBox() {
  const reduce = useReducedMotion()
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--r-lg)] border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em]">
        <span className="font-medium text-foreground/85">◳ The answer box</span>
        <span className="text-faint">one question · one shot</span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <motion.div {...riseIn(reduce, 0)}>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            Buyer asks
          </div>
          <div className="mt-1.5 text-[15.5px] font-medium text-foreground">
            “best jeweler in Dallas”
          </div>
        </motion.div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
          {["Competitor A", "Competitor B", "Competitor C"].map((name, i) => (
            <motion.div
              key={name}
              {...riseIn(reduce, 0.12 + i * 0.12)}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-baseline gap-3 text-[13.5px]">
                <span className="font-mono text-[10px] tabular-nums text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-foreground">{name}</span>
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-green">
                named
              </span>
            </motion.div>
          ))}

          <motion.div
            {...riseIn(reduce, 0.55)}
            className="flex items-center justify-between gap-4 border-t border-dashed border-border pt-3"
          >
            <span className="flex items-center gap-3 text-[13.5px]">
              <span className="font-mono text-[10px] tabular-nums text-faint">04</span>
              <span className="font-medium text-coral">There is no position four.</span>
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
              cut off
            </span>
          </motion.div>
        </div>

        <div className="mt-auto border-t border-border pt-3.5 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.08em] text-faint">
          The answer, illustrated — your name appears here, or nowhere
        </div>
      </div>
    </div>
  )
}

/* ---------- then vs now — how buyers choose ---------- */

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "blue" }) {
  return (
    <span
      className={
        "whitespace-nowrap rounded-[3px] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] " +
        (tone === "blue"
          ? "border-blue/35 bg-blue/8 text-blue"
          : "border-border bg-transparent text-muted-foreground")
      }
    >
      {children}
    </span>
  )
}

function FlowCompare() {
  const reduce = useReducedMotion()
  const Arrow = () => <ArrowRight size={11} className="shrink-0 text-faint" aria-hidden />
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--r-lg)] border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em]">
        <span className="font-medium text-foreground/85">◳ How buyers choose</span>
        <span className="text-faint">then vs now</span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <motion.div {...riseIn(reduce, 0)}>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            Then — the search era
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 opacity-75">
            <Chip>Google it</Chip>
            <Arrow />
            <Chip>10 blue links</Chip>
            <Arrow />
            <Chip>page two…</Chip>
            <Arrow />
            <Chip>maybe you</Chip>
          </div>
        </motion.div>

        <motion.div {...riseIn(reduce, 0.18)} className="mt-6 border-t border-border pt-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-blue">
            Now — the answer era
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Chip tone="blue">ask AI</Chip>
            <Arrow />
            <Chip tone="blue">3 names</Chip>
            <Arrow />
            <Chip tone="blue">decision made</Chip>
          </div>
        </motion.div>

        <motion.div
          {...riseIn(reduce, 0.34)}
          className="mt-auto flex items-end gap-4 border-t border-border pt-5"
        >
          <div className="font-display text-[2.1rem] font-[680] leading-none tracking-[-0.02em] tnum">
            <CountNumber value={1.2} decimals={1} prefix="~" suffix="%" />
          </div>
          <p className="max-w-[30ch] text-[13.5px] leading-snug text-muted-foreground">
            of local businesses surface in AI answers today.{" "}
            <span className="font-medium text-foreground">The field is wide open.</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
