import { Container, SectionHeading } from "@/components/primitives"
import { cn } from "@/lib/utils"

const AGENTS = [
  {
    tag: "Citations",
    n: "Citation Hunter",
    d: "Gets you cited by the sources AI already trusts — the lists, directories and press it pulls its answers from. The single biggest lever on who gets named.",
  },
  {
    tag: "Schema",
    n: "Schema Architect",
    d: "Marks up your site so AI can cleanly extract your offers, hours and reviews — machine-readable, not guesswork.",
  },
  {
    tag: "Reviews",
    n: "Review Engine",
    d: "Pushes your rating past the thresholds AI checks, and keeps reviews fresh, spread and recent.",
  },
  {
    tag: "Press",
    n: "Listicle Infiltrator",
    d: "Gets you into the “best of” roundups and local press — in the answer, not just the index.",
  },
  {
    tag: "Entity",
    n: "Entity Aligner",
    d: "Makes your name, address and identity identical everywhere, so AI trusts you're one established place.",
  },
  {
    tag: "Content",
    n: "Answer-Page Writer",
    d: "Writes pages that answer the exact questions buyers ask — so you become the source it quotes.",
  },
]

export function Solution() {
  const [lead, ...rest] = AGENTS
  return (
    <section id="solution" className="relative py-24 md:py-30">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="The Team"
            index="02"
            title={
              <>
                Six agents. One job:{" "}
                <span className="text-blue">get you recommended.</span>
              </>
            }
          />
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground lg:pb-1.5 lg:text-right">
            Each owns a lever AI weighs when it decides who to name. You don't manage
            them — we run the playbook and prove the movement on your own queries.
          </p>
        </div>

        {/* featured lead agent — dominant entry */}
        <article className="mt-14 grid gap-6 border-t-2 border-ink pt-9 sm:grid-cols-[auto_1fr] sm:gap-10 dark:border-border-strong">
          <div className="font-display text-[clamp(3rem,8vw,5.6rem)] font-[680] leading-[0.82] tracking-[-0.03em] text-blue tnum">
            01
          </div>
          <div className="max-w-[54ch]">
            <span className="inline-block rounded-[3px] bg-yellow px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink">
              Lever — {lead.tag}
            </span>
            <h3 className="mt-3 font-display text-h2 font-[640] tracking-[-0.02em]">
              The {lead.n}
            </h3>
            <p className="mt-3.5 max-w-[48ch] text-lead text-muted-foreground">{lead.d}</p>
          </div>
        </article>

        {/* staggered index — alternating indent + varied rules */}
        <ol className="mt-2">
          {rest.map((a, i) => {
            const indented = i % 2 === 1
            return (
              <li
                key={a.n}
                className={cn(
                  "group grid grid-cols-[auto_1fr] items-start gap-x-6 py-7 sm:gap-x-10",
                  indented
                    ? "border-t border-hair lg:ml-[14%]"
                    : "border-t border-border lg:mr-[10%]"
                )}
              >
                <span className="font-display text-[clamp(1.7rem,4vw,2.7rem)] font-[680] leading-none tracking-[-0.02em] text-faint tnum transition-colors duration-200 group-hover:text-blue">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div className="max-w-[48ch]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.tag}
                  </div>
                  <h3 className="mt-1 font-display text-h3 font-[640] tracking-[-0.01em] transition-colors duration-200 group-hover:text-blue">
                    The {a.n}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">
                    {a.d}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
