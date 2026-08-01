import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { EASE_REVEAL } from "@/lib/motion"

/**
 * The six levers and their mini-instruments. Extracted so both the team page
 * deck and any future surface can render the same figures.
 */
export const AGENTS = [
  {
    tag: "Citations",
    n: "Citation Hunter",
    d: "Gets you cited by the sources AI already trusts. The biggest lever on who gets named.",
  },
  {
    tag: "Schema",
    n: "Schema Architect",
    d: "Makes your site machine-readable. No guesswork.",
  },
  {
    tag: "Reviews",
    n: "Review Engine",
    d: "Pushes your rating past the bar AI checks.",
  },
  {
    tag: "Press",
    n: "Listicle Infiltrator",
    d: "Gets you into the “best of” lists AI reads.",
  },
  {
    tag: "Entity",
    n: "Entity Aligner",
    d: "One identity everywhere, so AI trusts you're real.",
  },
  {
    tag: "Content",
    n: "Answer-Page Writer",
    d: "Writes the answers AI ends up quoting.",
  },
]

/* ---------- motion helpers ---------- */

// Reveals rise up and scale toward the viewer, and replay on every pass.
const popIn = (reduce: boolean | null, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 26, scale: 0.94 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: false, amount: 0.35 },
  transition: { duration: 0.55, ease: EASE_REVEAL, delay },
})

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
        "w-full max-w-[290px] overflow-hidden rounded-[var(--r-lg)] border border-border bg-panel",
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
      <FigFoot>Extracted cleanly, no guesswork</FigFoot>
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
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 0.9, ease: EASE_REVEAL, delay: 0.25 }}
            className="h-full w-[92%] origin-left rounded-[2px] bg-green"
          />
          <div className="absolute -top-[5px] left-[86%] h-[18px] w-[2px] bg-ink dark:bg-foreground" />
          <div className="absolute right-0 top-[18px] whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.06em] text-faint">
            4.3★, the bar AI checks
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
          { i: "01", you: false, name: "Competitor A" },
          { i: "02", you: false, name: "Competitor B" },
          { i: "03", you: true, name: "" },
          { i: "04", you: false, name: "Competitor C" },
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
              <span className="text-[12px] text-muted-foreground">{r.name}</span>
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
            viewport={{ once: false, amount: 0.6 }}
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
        identical, aligned
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
      <motion.div {...popIn(reduce, 0.28)} className="mt-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          Your page answers
        </div>
        <div className="mt-1 border-l-2 border-blue/40 pl-2.5 text-[12px] leading-relaxed text-muted-foreground">
          “Yes. Most rings are resized same-day, in-house, while you wait.”
        </div>
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

export const FIGS = [CitationsFig, SchemaFig, ReviewsFig, PressFig, EntityFig, ContentFig]

