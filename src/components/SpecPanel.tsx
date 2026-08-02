import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Marker } from "@/components/primitives"
import { CountNumber } from "@/components/CountNumber"
import { EASE_REVEAL } from "@/lib/motion"

/** The hero's live-audit instrument. Its own module so the hero stays lean. */
export function SpecPanel() {
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
            <li key={t} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
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
