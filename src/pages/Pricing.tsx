import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { Button } from "@/components/ui/button"
import { PageHead, PageNext, MaskLine, Block } from "@/components/PageShell"
import { Tilt } from "@/components/fx/Tilt"
import { Magnetic } from "@/components/fx/Magnetic"
import { EASE_REVEAL } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * The sales page, without a menu. Every engagement is priced to the business:
 * market, category, how contested the answer is. So the tiers describe the
 * SHAPE of the work, and the number arrives with the free report. All four
 * engines are watched on every tier; that is the method, not an upsell.
 */
type Plan = {
  id: string
  name: string
  who: string
  featured?: boolean
  lines: readonly string[]
}

const PLANS: readonly Plan[] = [
  {
    id: "visibility",
    name: "Visibility",
    who: "One location, room to win.",
    lines: [
      "Trusted listings, built and kept current",
      "Schema so the machines can read you",
      "Answer pages published monthly",
      "All four engines watched, monthly report",
    ],
  },
  {
    id: "dominance",
    name: "Dominance",
    who: "A category someone else is winning.",
    featured: true,
    lines: [
      "Everything in Visibility",
      "Competitor tracking in your category",
      "Review velocity worked, not hoped for",
      "Prompt research every two weeks",
    ],
  },
  {
    id: "authority",
    name: "Authority",
    who: "Several locations, or a fight.",
    lines: [
      "Everything in Dominance",
      "Digital PR into the lists AI trusts",
      "Multi-location coverage",
      "Quarterly strategy with the owner",
    ],
  },
] as const satisfies readonly Plan[]

export default function Pricing() {
  const [open, setOpen] = useState<string>("dominance")

  return (
    <>
      <Container>
        <PageHead
          index="05"
          eyebrow="Pricing"
          title={
            <>
              <MaskLine delay={0.08}>Being named is worth</MaskLine>
              <MaskLine delay={0.18}>
                more than <span className="text-blue">being found.</span>
              </MaskLine>
            </>
          }
          lead="Setup once, then a monthly retainer. The number depends on your market, your category, and how contested the answer is. It arrives with your free report."
        />
      </Container>

      <Block>
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_REVEAL, delay: 0.1 + i * 0.09 }}
                onMouseEnter={() => setOpen(plan.id)}
                onFocus={() => setOpen(plan.id)}
              >
                <Tilt className="h-full" max={5}>
                  <div
                    className={cn(
                      "flex h-full flex-col border-t-2 bg-background p-6 transition-colors duration-300",
                      open === plan.id ? "border-blue" : "border-border-strong"
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <Eyebrow tone={plan.featured ? "blue" : "ink"}>
                        <Marker tone={plan.featured ? "blue" : "green"} />
                        {plan.name}
                      </Eyebrow>
                      {plan.featured ? (
                        <span className="bg-yellow px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink">
                          Recommended
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-display text-[2.1rem] font-[680] leading-none tracking-[-0.03em]">
                        Priced to you
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                      Setup + monthly retainer · quoted with your report
                    </p>

                    <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
                      {plan.who}
                    </p>

                    <ul className="mt-6 space-y-2.5">
                      {plan.lines.map((line, j) => (
                        <motion.li
                          key={line}
                          initial={false}
                          animate={{
                            opacity: open === plan.id ? 1 : 0.42,
                            x: open === plan.id ? 0 : -4,
                          }}
                          transition={{ duration: 0.3, ease: EASE_REVEAL, delay: j * 0.03 }}
                          className="grid grid-cols-[auto_1fr] gap-x-2.5 text-[14px] leading-relaxed"
                        >
                          <Check
                            size={14}
                            className={cn(
                              "mt-[5px]",
                              open === plan.id ? "text-blue" : "text-faint"
                            )}
                          />
                          <span>{line}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="mt-7 pt-1">
                      <Magnetic strength={6}>
                        <Button
                          asChild
                          variant={plan.featured ? "default" : "outline"}
                          className="w-full"
                        >
                          <Link to="/demo">
                            Get your number <ArrowRight />
                          </Link>
                        </Button>
                      </Magnetic>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 border-l-2 border-yellow pl-4 text-[15px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Pay for the year, keep 15%.</span> One
            business per category, per market, on every tier.
          </p>
        </Container>
      </Block>

      <Block className="border-t border-border bg-panel">
        <Container>
          <Eyebrow tone="blue">
            <Marker tone="blue" />
            Why no menu, and no free trial
          </Eyebrow>
          <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
            <p className="max-w-[46ch] font-display text-[clamp(1.5rem,3vw,2.1rem)] font-[640] leading-[1.15] tracking-[-0.02em]">
              An AI citation is not a trophy. It is a{" "}
              <span className="hl-yellow">perishable good.</span>
            </p>
            <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Answers move constantly. Ask the same question twice and the names change.
                A month is not long enough to earn a place in them, and a place earned is
                not a place kept.
              </p>
              <p>
                And no two fights cost the same. Winning a quiet suburb is not winning
                downtown Dallas, so a flat menu would overcharge one owner and starve the
                other. Your report tells us which fight you are in. The quote follows it,
                in writing, before you commit to anything.
              </p>
            </div>
          </div>
        </Container>
      </Block>

      <PageNext to="/demo" label="Get your report" kicker="Start" />
    </>
  )
}
