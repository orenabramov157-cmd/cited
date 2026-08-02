import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Container } from "@/components/primitives"
import { PageHead, PageNext, MaskLine } from "@/components/PageShell"
import { AGENTS, FIGS } from "@/components/agents"
import { Tilt } from "@/components/fx/Tilt"
import { EASE_REVEAL } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Six agents in one screen instead of six screens. The list is the control,
 * the stage is the payoff: pick a lever, the instrument for it swaps in.
 */
export default function Team() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const agent = AGENTS[active]
  const Fig = FIGS[active]

  return (
    <>
      <Container>
        <PageHead
          index="02"
          eyebrow="The Team"
          title={
            <>
              <MaskLine delay={0.08}>Six agents.</MaskLine>
              <MaskLine delay={0.18}>
                One job: <span className="text-blue">get you named.</span>
              </MaskLine>
            </>
          }
          lead="Each owns a lever AI weighs. Pick one."
        />

        <div className="mt-12 grid gap-10 border-t-2 border-ink pt-8 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-14 dark:border-border-strong">
          {/* the control: one row per lever */}
          <ol className="flex flex-col">
            {AGENTS.map((a, i) => {
              const isActive = i === active
              return (
                <li key={a.n}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onPointerEnter={() => setActive(i)}
                    aria-pressed={isActive}
                    className="group relative w-full border-b border-border py-4 text-left"
                  >
                    {/* active wash slides between rows */}
                    {isActive ? (
                      <motion.span
                        layoutId="agent-wash"
                        aria-hidden
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                        className="absolute inset-x-[-12px] inset-y-0 -z-10 rounded-[var(--r-sm)] bg-blue-soft"
                      />
                    ) : null}

                    <div className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          "font-display text-[1.7rem] font-[680] leading-none tracking-[-0.02em] tnum transition-colors duration-200",
                          isActive ? "text-blue" : "text-faint group-hover:text-blue"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                          Lever: {a.tag}
                        </div>
                        <h2
                          className={cn(
                            "font-display text-[1.3rem] font-[640] tracking-[-0.01em] transition-colors duration-200",
                            isActive ? "text-blue" : "group-hover:text-blue"
                          )}
                        >
                          The {a.n}
                        </h2>

                        {/* the sentence only exists for the open row: less words on screen */}
                        <AnimatePresence initial={false}>
                          {isActive ? (
                            <motion.p
                              initial={reduce ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={reduce ? undefined : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.34, ease: EASE_REVEAL }}
                              className="max-w-[46ch] overflow-hidden text-[14.5px] leading-relaxed text-muted-foreground"
                            >
                              <span className="block pt-1.5">{a.d}</span>
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>

          {/* the stage: the instrument for the selected lever */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
              <span>Instrument</span>
              <span className="tabular-nums">
                {String(active + 1).padStart(2, "0")} / 06
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={agent.n}
                initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 0.32, ease: EASE_REVEAL }}
              >
                <Tilt max={6} className="[&>div]:max-w-none">
                  <Fig reduce={reduce} />
                </Tilt>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>

      <PageNext to="/method" label="How it runs" />
    </>
  )
}
