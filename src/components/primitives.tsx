import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  )
}

export function Eyebrow({
  children,
  className,
  tone = "ink",
}: {
  children: ReactNode
  className?: string
  tone?: "ink" | "blue" | "coral" | "green" | "inverse"
}) {
  const color =
    tone === "blue"
      ? "text-blue"
      : tone === "coral"
        ? "text-coral"
        : tone === "green"
          ? "text-green"
          : tone === "inverse"
            ? "text-white/70"
            : "text-muted-foreground"
  return (
    <span className={cn("eyebrow inline-flex items-center gap-2.5", color, className)}>
      {children}
    </span>
  )
}

/** Small square marker — editorial tick, not a glowing dot. */
export function Marker({
  tone = "blue",
}: {
  tone?: "blue" | "coral" | "green" | "yellow" | "ink"
}) {
  const bg =
    tone === "coral"
      ? "bg-coral"
      : tone === "green"
        ? "bg-green"
        : tone === "yellow"
          ? "bg-yellow"
          : tone === "ink"
            ? "bg-ink"
            : "bg-blue"
  return <span aria-hidden className={cn("size-[7px] rounded-[1px]", bg)} />
}

/** Editorial section heading — numbered, left-aligned, one accent max. */
export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  tone = "blue",
  className,
}: {
  eyebrow: string
  index?: string
  title: ReactNode
  lead?: ReactNode
  tone?: "blue" | "coral" | "green"
  className?: string
}) {
  return (
    <div className={cn("max-w-[62ch]", className)}>
      <div className="flex items-center gap-3.5">
        {index ? (
          <span className="font-mono text-caption tabular-nums text-faint">{index}</span>
        ) : null}
        <Eyebrow tone={tone}>
          <Marker tone={tone} />
          {eyebrow}
        </Eyebrow>
      </div>
      <h2 className="mt-5 font-display text-h2 tracking-[-0.025em]">{title}</h2>
      {lead ? (
        <p className="mt-5 max-w-[56ch] text-lead text-muted-foreground">{lead}</p>
      ) : null}
    </div>
  )
}
