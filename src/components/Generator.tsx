import { useEffect, useRef, useState } from "react"
import { motion, animate, AnimatePresence, useReducedMotion } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { Rise } from "@/components/Rise"
import { TurnstileWidget, type TurnstileHandle } from "@/components/Turnstile"
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

const STATUS: Record<State, { label: string; dot: string; text: string }> = {
  idle: { label: "Ready", dot: "bg-border-strong", text: "text-faint" },
  generating: { label: "Running audit", dot: "bg-yellow", text: "text-foreground/70" },
  success: { label: "Complete", dot: "bg-green", text: "text-green" },
  error: { label: "Awaiting input", dot: "bg-coral", text: "text-coral" },
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
  // Turnstile (RECOMMENDATIONS.md item 4) — null/no-op until a site key is
  // configured; see src/components/Turnstile.tsx.
  const turnstileToken = useRef<string | null>(null)
  const turnstileRef = useRef<TurnstileHandle>(null)

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
      const [result] = await Promise.all([
        fetchTeam(b, c, ctrl.signal, turnstileToken.current),
        minDelay,
      ])
      if (run !== runId.current) return
      setTeam(result.agents)
      setSource(result.source)
      setMailto(buildMailto(b, c, result.agents))
      setSnapshot({ biz: b, city: c })
      setState("success")
    } finally {
      if (activeCtrl.current === ctrl) activeCtrl.current = null
      inFlight.current = false
      turnstileRef.current?.reset() // tokens are single-use
    }
  }

  const status = STATUS[state]

  return (
    <section id="build" className="relative border-t border-border py-8 md:py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* marginal support — stays on paper */}
          <Rise amount={30} className="lg:col-span-4 lg:pt-3">
            <div className="flex items-center gap-3.5">
              <span className="font-mono text-caption tabular-nums text-faint">05</span>
              <Eyebrow tone="blue">
                <Marker tone="blue" />
                Diagnostic · free
              </Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-h2 tracking-[-0.025em]">
              Sketch your team in{" "}
              <span className="hl-yellow">30 seconds.</span>
            </h2>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
              Tell the instrument your business and city. It drafts the exact six-agent
              team that would get you recommended, named for your trade, right now.
            </p>
            <p className="mt-6 max-w-[34ch] border-l-2 border-border-strong pl-4 font-mono text-[11px] leading-relaxed text-faint">
              Instrument v1 · client-side estimate. A live audit runs your real queries
              across four engines.
            </p>
          </Rise>

          {/* the instrument — white panel, same language as the rest of the paper */}
          <Rise amount={50} className="mt-10 lg:col-span-8 lg:mt-0">
            <div className="overflow-hidden rounded-[var(--r-xl)] border border-border bg-panel shadow-[var(--shadow-panel)]">
              {/* readout header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <span>Cited · Diagnostic instrument</span>
                <span
                  className={`inline-flex items-center gap-2 transition-colors duration-300 ${status.text}`}
                >
                  <span
                    className={`size-[6px] rounded-full transition-colors duration-300 ${status.dot}`}
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
                  className="h-12"
                >
                  {state === "generating" ? "Running…" : <>Build team <ArrowRight /></>}
                </Button>
                {/* no-op / invisible until VITE_TURNSTILE_SITE_KEY is set */}
                <TurnstileWidget
                  ref={turnstileRef}
                  onToken={(t) => {
                    turnstileToken.current = t
                  }}
                />
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
                      className="mt-6 border-t border-border pt-6 font-mono text-[11px] tracking-[0.02em] text-muted-foreground"
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
                      className="mt-6 inline-flex items-center gap-2 rounded-[var(--r-sm)] bg-coral/10 px-3.5 py-2.5 text-[13.5px] font-medium text-coral"
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
                      className="mt-6 border-t border-border pt-7"
                      aria-live="polite"
                    >
                      <div className="mb-5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/70">
                        <span className="size-[7px] rounded-[1px] bg-yellow" aria-hidden />
                        Drafting six agents…
                      </div>
                      <div className="relative grid gap-3 overflow-hidden sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex gap-3 rounded-[var(--r-sm)] border border-border p-4"
                          >
                            <div className="h-3 w-5 rounded-[2px] bg-border" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/2 rounded-[2px] bg-border" />
                              <div className="h-2.5 w-full rounded-[2px] bg-border/55" />
                              <div className="h-2.5 w-4/5 rounded-[2px] bg-border/55" />
                            </div>
                          </div>
                        ))}
                        {!reduce && (
                          <motion.div
                            aria-hidden
                            initial={{ x: "-60%" }}
                            animate={{ x: "160%" }}
                            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
                            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
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
                      className="mt-6 border-t border-border pt-7"
                      aria-live="polite"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-green">
                        Team drafted · {snapshot.biz} · {snapshot.city} ·{" "}
                        {source === "live" ? "live draft" : "instant sketch"}
                      </div>
                      <h3 className="mt-3 max-w-[36ch] font-display text-h3 font-[640] leading-snug tracking-[-0.01em] text-foreground">
                        The crew that gets{" "}
                        <span className="text-blue">{snapshot.biz}</span> recommended
                        by AI in <span className="text-blue">{snapshot.city}</span>.
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
                            className="grid grid-cols-[auto_1fr] gap-3.5 border-t border-border py-4"
                          >
                            <span className="pt-0.5 font-mono text-[12px] font-medium tabular-nums text-blue">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <div className="font-display text-[1.05rem] font-[640] text-foreground">
                                {t.name}
                              </div>
                              <div className="mt-1 break-words text-[13.5px] leading-relaxed text-muted-foreground">
                                <TypeLine text={t.move} delay={0.25 + i * 0.24} />
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </motion.ul>

                      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <Button asChild size="lg">
                          <a href={mailto}>
                            Email me this team <ArrowRight />
                          </a>
                        </Button>
                        <span className="text-[13px] text-muted-foreground">
                          Opens a pre-filled email. Edit anything before you send.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </Rise>
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
          <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[0.15em] animate-pulse rounded-[1px] bg-blue/70" />
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
        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
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
          "flex h-12 w-full rounded-[var(--r-sm)] border bg-background px-4 text-[15px] text-foreground " +
          "placeholder:text-faint caret-blue " +
          "transition-[border-color,box-shadow,background] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] " +
          "hover:border-border-strong focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/30 " +
          (invalid ? "border-coral/70" : "border-border")
        }
      />
    </div>
  )
}
