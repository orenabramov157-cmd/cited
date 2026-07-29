import { Container, SectionHeading } from "@/components/primitives"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    k: "Baseline",
    color: "var(--ink)",
    d: "We run your real buyer questions across ChatGPT, Perplexity, Gemini & Claude. Do they name you?",
  },
  {
    k: "Diagnose",
    color: "var(--primary-blue)",
    d: "For every query a competitor wins, we trace the exact sources the AI leaned on.",
  },
  {
    k: "Fix",
    color: "var(--primary-blue)",
    d: "Citations, schema, reviews and answer-content — the moves that change who gets named.",
  },
  {
    k: "Re-measure",
    color: "var(--data-green)",
    d: "Re-run the same questions. Absent → named in most, in black and white.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border py-24 md:py-30">
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
              The whole engagement is a before-and-after on your real customer questions —
              so you see the lift, not a vibe.
            </>
          }
        />

        <div className="relative mt-18">
          {/* directional axis: ink → cobalt → green */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[6px] hidden h-[2px] md:block"
            style={{
              background:
                "linear-gradient(90deg, var(--ink) 0%, var(--primary-blue) 55%, var(--data-green) 100%)",
              opacity: 0.55,
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-2 left-[5px] top-2 w-[2px] md:hidden"
            style={{
              background:
                "linear-gradient(180deg, var(--ink) 0%, var(--primary-blue) 55%, var(--data-green) 100%)",
              opacity: 0.55,
            }}
          />

          <ol className="grid gap-y-11 md:grid-cols-4 md:gap-x-6">
            {STEPS.map((s, i) => (
              <li
                key={s.k}
                className={cn(
                  "relative pl-7 md:pl-0 md:pt-8",
                  i === 1 && "md:mt-9",
                  i === 2 && "md:mt-4",
                  i === 3 && "md:mt-14"
                )}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[2px] size-[11px] rounded-[2px] ring-4 ring-background md:top-0"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[11px] tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
                    style={{ color: s.color }}
                  >
                    {s.k}
                  </span>
                </div>
                <p className="mt-3 max-w-[24ch] text-[14.5px] leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
