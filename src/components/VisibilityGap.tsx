import { useRef } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { Container, SectionHeading } from "@/components/primitives"
import { CountNumber } from "@/components/CountNumber"

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
      className="relative border-y border-border bg-panel py-24 md:py-30"
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
        <div className="relative mt-14 lg:mt-20">
          <div className="lg:absolute lg:left-0 lg:top-1/2 lg:z-10 lg:max-w-[34%] lg:-translate-y-[56%]">
            <div className="font-display text-stat font-[680] tracking-[-0.03em] text-ink tnum dark:text-foreground">
              <CountNumber value={45} suffix="%" />
            </div>
            <p className="mt-3 max-w-[24ch] text-[14.5px] leading-relaxed text-muted-foreground">
              of buyers now ask AI to find a local business —{" "}
              <span className="font-medium text-foreground">up from ~6% a year ago.</span>
            </p>
          </div>

          {/* chart — right-weighted */}
          <div className="lg:ml-[34%] lg:pl-8">
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
                  <AreaChart data={DATA} margin={{ top: 10, right: 6, bottom: 0, left: -20 }}>
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
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--blue)"
                      strokeWidth={2.25}
                      fill="url(#blueFill)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "var(--blue)",
                        stroke: "var(--panel)",
                        strokeWidth: 2,
                      }}
                      // scroll drives the reveal now — no competing tween
                      isAnimationActive={false}
                    />
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

        {/* counterweights — asymmetric pair */}
        <div className="mt-14 grid gap-10 border-t border-border pt-9 sm:grid-cols-12 lg:mt-20">
          <div className="sm:col-span-5 sm:col-start-2">
            <div className="font-display text-[2.5rem] font-[680] leading-none tracking-[-0.02em] tnum">
              <CountNumber value={1.2} decimals={1} prefix="~" suffix="%" />
            </div>
            <p className="mt-2.5 max-w-[32ch] text-[14.5px] leading-relaxed text-muted-foreground">
              of local businesses currently surface in AI answers. The field is wide open.
            </p>
          </div>
          <div className="sm:col-span-4 sm:col-start-9">
            <div className="font-display text-[2.5rem] font-[680] leading-none tracking-[-0.02em] text-coral tnum">
              <CountNumber value={3} />
            </div>
            <p className="mt-2.5 max-w-[26ch] text-[14.5px] leading-relaxed text-muted-foreground">
              names, then it stops.{" "}
              <span className="font-medium text-foreground">There is no position four.</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
