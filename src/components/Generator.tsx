import { useEffect, useRef, useState } from "react"
import { motion, animate, AnimatePresence, useReducedMotion } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import {
  fetchTeam,
  buildMailto,
  MAX_BUSINESS,
  MAX_CITY,
  type Agent,
  type TeamResult,
} from "@/lib/generator"
import { EASE_REVEAL, DUR, staggerContainer, agentItem } from "@/lib/motion"

type State = "idle" | "generating" | "success" | "error"

const STATUS: Record<State, { label: string; color: string }> = {
  idle: { label: "Ready", color: "#8fa3c4" },
  generating: { label: "Running audit", color: "#f2c94c" },
  success: { label: "Complete", color: "#3ecf8e" },
  error: { label: "Awaiting input", color: "#ff7a66" },
}

export function Generator() {
  const reduce = useReducedMotion()
  const [biz, setBiz] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState<State>("idle")
  const [team, setTeam] = useState<Agent[]>([])
  const [source, setSource] = useState<TeamResult["source"]>("stub")
  const [mailto, setMailto] = useState("#")
  const [snapshot, setSnapshot] = useState({ biz: "", city: "" })
  // guards against a stale async result landing after a newer submit/unmount
  const runId = useRef(0)
  // synchronous lock — React state can't stop two submits in the same tick
  const inFlight = useRef(false)
  const activeCtrl = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      runId.current++
      activeCtrl.current?.abort() // don't leave work running after unmount
    },
    []
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inFlight.current) return
    const b = biz.trim()
    const c = city.trim()
    if (!b || !c) {
      setState("error")
      return
    }
    inFlight.current = true
    const run = ++runId.current
    const ctrl = new AbortController()
    activeCtrl.current = ctrl
    setState("generating")
    try {
      // hold the audit state briefly so the transition reads as work —
      // but never delay a reduced-motion user
      const minDelay = reduce
        ? Promise.resolve()
        : new Promise((r) => setTimeout(r, 1150))
      const [result] = await Promise.all([fetchTeam(b, c, ctrl.signal), minDelay])
      if (run !== runId.current) return
      setTeam(result.agents)
      setSource(result.source)
      setMailto(buildMailto(b, c, result.agents))
      setSnapshot({ biz: b, city: c })
      setState("success")
    } finally {
      if (activeCtrl.current === ctrl) activeCtrl.current = null
      inFlight.current = false
    }
  }

  const status = STATUS[state]

  return (
    <section id="build" className="relative border-t border-border py-24 md:py-30">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* marginal support — stays on paper */}
          <div className="lg:col-span-4 lg:pt-3">
            <div className="flex items-center gap-3.5">
              <span className="font-mono text-caption tabular-nums text-faint">05</span>
              <Eyebrow tone="blue">
                <Marker tone="blue" />
                Diagnostic — free
              </Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-h2 tracking-[-0.025em]">
              Sketch your team in{" "}
              <span className="hl-yellow">30 seconds.</span>
            </h2>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
              Tell the instrument your business and city. It drafts the exact six-agent
              team that would get you recommended — named for your trade, right now.
            </p>
            <p className="mt-6 max-w-[34ch] border-l-2 border-border-strong pl-4 font-mono text-[11px] leading-relaxed text-faint">
              Instrument v1 · client-side estimate. A live audit runs your real queries
              across four engines.
            </p>
          </div>

          {/* the instrument — the page's one dark contrast mass */}
          <div className="mt-10 lg:col-span-8 lg:mt-0">
            <div className="overflow-hidden rounded-[var(--r-xl)] bg-navy text-white shadow-[var(--shadow-panel)]">
              {/* readout header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
                <span>Cited · Diagnostic instrument</span>
                <span
                  className="inline-flex items-center gap-2 transition-colors duration-300"
                  style={{ color: status.color }}
                >
                  <span
                    className="size-[6px] rounded-full transition-colors duration-300"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </span>
              </div>

              {/* form */}
              <form
                onSubmit={onSubmit}
                className="grid gap-4 px-6 pt-7 pb-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:px-8"
              >
                <NavyField
                  id="biz"
                  label="Business"
                  placeholder="a fine jewelry store"
                  value={biz}
                  onChange={setBiz}
                  maxLength={MAX_BUSINESS}
                  invalid={state === "error" && !biz.trim()}
                />
                <NavyField
                  id="city"
                  label="City"
                  placeholder="Dallas"
                  value={city}
                  onChange={setCity}
                  maxLength={MAX_CITY}
                  invalid={state === "error" && !city.trim()}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={state === "generating"}
                  className="h-12 bg-[#2f7fd8] hover:bg-[#4292e8]"
                >
                  {state === "generating" ? "Running…" : <>Build team <ArrowRight /></>}
                </Button>
              </form>

              <motion.div layout="position" className="px-6 pb-8 sm:px-8">
                <AnimatePresence mode="wait" initial={false}>
                  {state === "idle" && (
                    <motion.div
                      key="idle"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: DUR.base }}
                      className="mt-6 border-t border-white/10 pt-6 font-mono text-[11px] tracking-[0.02em] text-white/65"
                    >
                      Awaiting a business + city. Six agents will be drafted on submit.
                    </motion.div>
                  )}

                  {state === "error" && (
                    <motion.p
                      key="error"
                      role="alert"
                      initial={reduce ? false : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: DUR.micro, ease: EASE_REVEAL }}
                      className="mt-6 inline-flex items-center gap-2 rounded-[var(--r-sm)] bg-[#ff7a66]/15 px-3.5 py-2.5 text-[13.5px] text-[#ffab9d]"
                    >
                      <AlertCircle size={15} />
                      Enter both a business and a city to run the audit.
                    </motion.p>
                  )}

                  {state === "generating" && (
                    <motion.div
                      key="loading"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: DUR.base }}
                      className="mt-6 border-t border-white/10 pt-7"
                      aria-live="polite"
                    >
                      <div className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-yellow">
                        Drafting six agents…
                      </div>
                      <div className="relative grid gap-3 overflow-hidden sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex gap-3 rounded-[var(--r-sm)] border border-white/8 p-4"
                          >
                            <div className="h-3 w-5 rounded-[2px] bg-white/12" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/2 rounded-[2px] bg-white/12" />
                              <div className="h-2.5 w-full rounded-[2px] bg-white/7" />
                              <div className="h-2.5 w-4/5 rounded-[2px] bg-white/7" />
                            </div>
                          </div>
                        ))}
                        {!reduce && (
                          <motion.div
                            aria-hidden
                            initial={{ x: "-60%" }}
                            animate={{ x: "160%" }}
                            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
                            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/6 to-transparent"
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {state === "success" && (
                    <motion.div
                      key="success"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: DUR.base }}
                      className="mt-6 border-t border-white/10 pt-7"
                      aria-live="polite"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3ecf8e]">
                        Team drafted · {snapshot.biz} · {snapshot.city} ·{" "}
                        {source === "live" ? "live draft" : "instant sketch"}
                      </div>
                      <h3 className="mt-3 max-w-[36ch] font-display text-h3 font-[640] leading-snug tracking-[-0.01em] text-white">
                        The crew that gets{" "}
                        <span className="text-[#7db8f0]">{snapshot.biz}</span> recommended
                        by AI in <span className="text-[#7db8f0]">{snapshot.city}</span>.
                      </h3>

                      <motion.ul
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="mt-7 grid gap-x-6 gap-y-0 sm:grid-cols-2"
                      >
                        {team.map((t, i) => (
                          <motion.li
                            key={t.name}
                            variants={agentItem}
                            className="grid grid-cols-[auto_1fr] gap-3.5 border-t border-white/8 py-4"
                          >
                            <span className="pt-0.5 font-mono text-[12px] font-medium tabular-nums text-[#7db8f0]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <div className="font-display text-[1.05rem] font-[640] text-white">
                                {t.name}
                              </div>
                              <div className="mt-1 break-words text-[13.5px] leading-relaxed text-white/70">
                                <TypeLine text={t.move} delay={0.25 + i * 0.24} />
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </motion.ul>

                      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <Button asChild size="lg" className="bg-[#2f7fd8] hover:bg-[#4292e8]">
                          <a href={mailto}>
                            Email me this team <ArrowRight />
                          </a>
                        </Button>
                        <span className="text-[13px] text-white/65">
                          Opens a pre-filled email — edit anything before you send.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Types the line out like a live draft. Space is pre-reserved (no reflow),
 *  screen readers get the full text immediately, reduced motion skips it. */
function TypeLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? text : "")
  const done = shown.length >= text.length

  useEffect(() => {
    if (reduce) {
      setShown(text)
      return
    }
    setShown("")
    const ctrl = animate(0, text.length, {
      duration: Math.min(1.2, 0.3 + text.length * 0.011),
      delay,
      ease: "linear",
      onUpdate: (v) => setShown(text.slice(0, Math.round(v))),
    })
    return () => ctrl.stop()
  }, [text, delay, reduce])

  return (
    <span className="relative inline-block w-full" aria-label={text} role="text">
      {/* invisible copy reserves the final layout so nothing shifts while typing */}
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {shown}
        {!done && !reduce && (
          <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[0.15em] animate-pulse rounded-[1px] bg-[#7db8f0]/80" />
        )}
      </span>
    </span>
  )
}

function NavyField({
  id,
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  invalid,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  invalid?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/65"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={
          "flex h-12 w-full rounded-[var(--r-sm)] border bg-white/[0.06] px-4 text-[15px] text-white " +
          "placeholder:text-white/55 caret-[#7db8f0] " +
          "transition-[border-color,box-shadow,background] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] " +
          "hover:border-white/25 focus-visible:border-[#7db8f0] focus-visible:ring-2 focus-visible:ring-[#7db8f0]/40 " +
          (invalid ? "border-[#ff7a66]/70" : "border-white/15")
        }
      />
    </div>
  )
}
