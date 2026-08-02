import { Lock, Camera, Repeat2 } from "lucide-react"
import { Container } from "@/components/primitives"
import { Rise } from "@/components/Rise"

/**
 * The proof layer — shows the FORMAT of results with honest live statuses.
 * No fabricated numbers: cells stay "—" until real, dated evidence lands.
 * The method itself is deliberately described at category level only.
 */

/**
 * Before cells reflect the real 2026-08-02 baseline run (first pass, dated
 * screenshots in the evidence vault). "logging" = that query's coverage is
 * still being captured. After cells stay queued until the re-measure.
 */
const ROWS = [
  {
    q: "best jewelers in Dallas",
    engines: "GPT · PPX · GEM · CLD",
    before: { text: "✗ absent · 8/2", tone: "coral" },
  },
  {
    q: "where to buy an engagement ring in Dallas",
    engines: "GPT · PPX · GEM · CLD",
    before: { text: "✗ absent · 8/2", tone: "coral" },
  },
  {
    q: "best custom jeweler in Dallas",
    engines: "GPT · PPX · GEM · CLD",
    before: { text: "· logging", tone: "faint" },
  },
] as const

export function Proof() {
  return (
    <section id="proof" className="relative py-4 md:py-6">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* dominant mass: the live scorecard */}
          <div className="lg:col-span-8">
            <Rise amount={26} className="overflow-x-auto">
              <div className="min-w-[560px] rounded-[var(--r-lg)] border border-border bg-raised">
                {/* head */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Live case · Dallas fine jewelry
                  </span>
                  {/* fixed dark literal, not text-ink: --yellow doesn't change in
                      dark mode but --ink does, which dropped this to ~1.3:1 */}
                  <span className="inline-flex items-center gap-2 rounded-[3px] bg-yellow px-2 py-0.5 font-medium text-[#171717]">
                    Baseline in progress
                  </span>
                </div>

                {/* column labels */}
                <div className="grid grid-cols-[1.6fr_1fr_0.6fr_0.6fr] gap-3 border-b border-hair px-5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
                  <span>Buyer question</span>
                  <span>Engines</span>
                  <span>Before</span>
                  <span>After</span>
                </div>

                {ROWS.map((r) => (
                  <div
                    key={r.q}
                    className="grid grid-cols-[1.6fr_1fr_0.6fr_0.6fr] items-center gap-3 border-b border-hair px-5 py-3.5 last:border-b-0"
                  >
                    <span className="text-[15px] font-medium text-foreground">“{r.q}”</span>
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      {r.engines}
                    </span>
                    <span
                      className={
                        "font-mono text-[12px] " +
                        (r.before.tone === "coral" ? "font-medium text-coral" : "text-faint")
                      }
                    >
                      {r.before.text}
                    </span>
                    <span className="font-mono text-[12px] text-faint">· queued</span>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border px-5 py-3 font-mono text-[10px] text-faint">
                  <span className="inline-flex items-center gap-1.5">
                    <Camera size={11} /> dated screenshots
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Repeat2 size={11} /> a “named” only counts once it repeats across runs
                  </span>
                </div>
              </div>
            </Rise>

            <p className="mt-10 max-w-[64ch] font-mono text-[10.5px] leading-relaxed text-faint">
              Claim format once live: “absent → named in X of Y query-runs, cited with
              link in Z”, engine and date attached. Aggregates only.
            </p>
          </div>

          {/* counterweight rail: the client-side brisk summary */}
          <aside className="mt-12 lg:col-span-4 lg:mt-24">
            <Rise amount={64} className="border-t-2 border-ink pt-6 dark:border-border-strong">
              <h2 className="font-display text-h3 font-[640] tracking-[-0.01em]">
                What you see as a client
              </h2>
              <ol className="mt-5 flex flex-col gap-4">
                {[
                  ["01", "Baseline scorecard: where you stand, engine by engine."],
                  ["02", "Fixes executed for you, reported by category."],
                  ["03", "Scorecard re-run. The lift in black and white."],
                ].map(([n, t]) => (
                  <li key={n} className="grid grid-cols-[auto_1fr] gap-3">
                    <span className="font-mono text-[11px] font-medium text-blue tabular-nums">
                      {n}
                    </span>
                    <span className="text-[15px] leading-relaxed text-muted-foreground">
                      {t}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-7 flex gap-3 rounded-[var(--r-md)] bg-tint px-4 py-3.5">
                <Lock size={15} className="mt-0.5 shrink-0 text-blue" />
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">
                    You get the lift and the evidence. The recipe stays in-house.
                  </span>
                </p>
              </div>
            </Rise>
          </aside>
        </div>
      </Container>
    </section>
  )
}
