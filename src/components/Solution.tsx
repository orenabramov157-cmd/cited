import { useRef, type ReactNode } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Container, SectionHeading } from "@/components/primitives"
import { cn } from "@/lib/utils"
import { EASE_REVEAL } from "@/lib/motion"

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

/* ---------- motion helpers ---------- */

const popIn = (reduce: boolean | null, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 14, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.5, ease: EASE_REVEAL, delay },
})

/** Gentle parallax — each figure drifts at its own speed while you scroll. */
function Drift({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>
  index: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const range = index % 2 === 0 ? [26, -30] : [14, -20]
  const y = useTransform(progress, [0, 1], range)
  return <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
}

/* ---------- mini-diagram shell ---------- */

function FigShell({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full max-w-[300px] overflow-hidden rounded-[var(--r-lg)] border border-border bg-panel",
        className
      )}
    >
      <div className="border-b border-border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
        ◳ {title}
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  )
}

function FigFoot({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 border-t border-hair pt-2.5 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.08em] text-faint">
      {children}
    </div>
  )
}

/* ---------- six instruments, one per lever ---------- */

function CitationsFig({ reduce }: { reduce: boolean | null }) {
  const rows = [
    ["Best-of roundups", "cited", "text-green", "bg-green"],
    ["Local directories", "cited", "text-green", "bg-green"],
    ["Regional press", "pending", "text-foreground/60", "bg-yellow"],
    ["Industry lists", "queued", "text-faint", "bg-border-strong"],
  ] as const
  return (
    <FigShell title="Trusted sources">
      <div className="flex flex-col gap-2.5">
        {rows.map(([label, status, tone, dot], i) => (
          <motion.div
            key={label}
            {...popIn(reduce, 0.1 + i * 0.1)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className={cn("size-[6px] rounded-[1px]", dot)} aria-hidden />
              {label}
            </span>
            <span className={cn("font-mono text-[8.5px] uppercase tracking-[0.08em]", tone)}>
              {status}
            </span>
          </motion.div>
        ))}
      </div>
      <FigFoot>The sources answers are built from</FigFoot>
    </FigShell>
  )
}

function SchemaFig({ reduce }: { reduce: boolean | null }) {
  return (
    <FigShell title="Machine-readable">
      <motion.pre
        {...popIn(reduce, 0.1)}
        className="overflow-x-auto font-mono text-[10.5px] leading-[1.7] text-muted-foreground"
      >
        <span className="text-blue">{"{"}</span>
        {"\n"}  "@type": <span className="text-green">"JewelryStore"</span>,
        {"\n"}  "priceRange": <span className="text-green">"$$"</span>,
        {"\n"}  "openingHours": <span className="text-green">"10–18"</span>
        {"\n"}<span className="text-blue">{"}"}</span>
      </motion.pre>
      <FigFoot>Extracted cleanly — no guesswork</FigFoot>
    </FigShell>
  )
}

function ReviewsFig({ reduce }: { reduce: boolean | null }) {
  return (
    <FigShell title="Rating threshold">
      <div className="pt-4">
        {/* the bar AI checks, and the goal: past it */}
        <div className="relative h-[8px] w-full rounded-[2px] bg-border/60">
          <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: EASE_REVEAL, delay: 0.25 }}
            className="h-full w-[92%] origin-left rounded-[2px] bg-green"
          />
          <div className="absolute -top-[5px] left-[86%] h-[18px] w-[2px] bg-ink dark:bg-foreground" />
          <div className="absolute right-0 top-[18px] whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.06em] text-faint">
            4.3★ — the bar AI checks
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-green">
        <span className="size-[6px] rounded-[1px] bg-green" aria-hidden />
        past the bar · fresh · spread out
      </div>
      <FigFoot>Below it, you're filtered before ranking starts</FigFoot>
    </FigShell>
  )
}

function PressFig({ reduce }: { reduce: boolean | null }) {
  return (
    <FigShell title="“10 best jewelers in Dallas”">
      <div className="flex flex-col gap-2">
        {[
          { i: "01", you: false, w: "w-[72%]" },
          { i: "02", you: false, w: "w-[58%]" },
          { i: "03", you: true, w: "" },
          { i: "04", you: false, w: "w-[64%]" },
        ].map((r, idx) => (
          <motion.div
            key={r.i}
            {...popIn(reduce, 0.1 + idx * 0.1)}
            className="flex items-center gap-2.5"
          >
            <span className="font-mono text-[9px] tabular-nums text-faint">{r.i}</span>
            {r.you ? (
              <span className="rounded-[2px] bg-blue px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-white">
                you, inserted
              </span>
            ) : (
              <span
                aria-label="listing name withheld"
                className={cn("h-[9px] rounded-[1px] bg-foreground/25", r.w)}
              />
            )}
          </motion.div>
        ))}
      </div>
      <FigFoot>In the roundup → in the answer</FigFoot>
    </FigShell>
  )
}

function EntityFig({ reduce }: { reduce: boolean | null }) {
  const offsets = [-16, 12, -8]
  return (
    <FigShell title="One identity, everywhere">
      <div className="flex flex-col gap-2">
        {["Maps listing", "Directory", "Your site"].map((src, i) => (
          <motion.div
            key={src}
            initial={reduce ? false : { opacity: 0, x: offsets[i] }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.55, ease: EASE_REVEAL, delay: 0.15 + i * 0.14 }}
            className="flex items-center justify-between gap-3 rounded-[3px] border border-border px-2.5 py-1.5"
          >
            <span className="font-mono text-[9.5px] text-muted-foreground">
              name · address · phone
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.06em] text-faint">
              {src}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        {...popIn(reduce, 0.62)}
        className="mt-3 flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-green"
      >
        <span className="size-[6px] rounded-[1px] bg-green" aria-hidden />
        identical — aligned
      </motion.div>
      <FigFoot>Mismatch reads as three unknown places</FigFoot>
    </FigShell>
  )
}

function ContentFig({ reduce }: { reduce: boolean | null }) {
  return (
    <FigShell title="The page AI quotes">
      <motion.div {...popIn(reduce, 0.1)}>
        <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          Buyers ask
        </div>
        <div className="mt-1 text-[12.5px] font-medium text-foreground">
          “do you resize rings same-day?”
        </div>
      </motion.div>
      <motion.div {...popIn(reduce, 0.28)} className="mt-3 flex flex-col gap-1.5">
        <span className="h-[8px] w-[92%] rounded-[1px] bg-border" aria-hidden />
        <span className="h-[8px] w-[78%] rounded-[1px] bg-border" aria-hidden />
        <span className="h-[8px] w-[54%] rounded-[1px] bg-border" aria-hidden />
      </motion.div>
      <motion.div
        {...popIn(reduce, 0.46)}
        className="mt-3 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-blue"
      >
        <ArrowRight size={10} aria-hidden />
        becomes the quoted source
      </motion.div>
      <FigFoot>Your answer, in the machine's mouth</FigFoot>
    </FigShell>
  )
}

const FIGS = [CitationsFig, SchemaFig, ReviewsFig, PressFig, EntityFig, ContentFig]

/* ---------- section ---------- */

export function Solution() {
  const [lead, ...rest] = AGENTS
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const drift = useSpring(scrollYProgress, { stiffness: 70, damping: 24 })

  const LeadFig = FIGS[0]

  return (
    <section ref={sectionRef} id="solution" className="relative py-24 md:py-30">
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
        <article className="mt-14 grid gap-8 border-t-2 border-ink pt-9 sm:grid-cols-[auto_1fr] sm:gap-10 lg:grid-cols-[auto_1fr_auto] dark:border-border-strong">
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
          <div className="sm:col-start-2 lg:col-start-3 lg:self-center">
            <Drift progress={drift} index={0}>
              <LeadFig reduce={reduce} />
            </Drift>
          </div>
        </article>

        {/* staggered index — alternating indent + varied rules, instrument per agent */}
        <ol className="mt-2">
          {rest.map((a, i) => {
            const indented = i % 2 === 1
            const Fig = FIGS[i + 1]
            return (
              <li
                key={a.n}
                className={cn(
                  "group grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-6 py-8 sm:gap-x-10 lg:grid-cols-[auto_1fr_auto]",
                  indented
                    ? "border-t border-hair lg:ml-[10%]"
                    : "border-t border-border lg:mr-[7%]"
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
                <div className="col-start-2 lg:col-start-3 lg:self-center">
                  <Drift progress={drift} index={i + 1}>
                    <Fig reduce={reduce} />
                  </Drift>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
