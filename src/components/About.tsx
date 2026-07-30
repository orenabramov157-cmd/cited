import { Container, Eyebrow, Marker } from "@/components/primitives"

const PILLARS = [
  {
    tone: "green" as const,
    k: "Evidence first",
    d: "Every claim ships with dated screenshots and repeat runs. If we can't measure it, we don't say it.",
  },
  {
    tone: "blue" as const,
    k: "Skin in the game",
    d: "Cited started inside our own 35-year family jewelry store in Dallas. Client zero is us — the method gets proven on our money, not yours.",
  },
  {
    tone: "yellow" as const,
    k: "One per market",
    d: "The AI names three. We never work both sides of the same answer — one business per category, per market.",
  },
]

export function About() {
  return (
    <section id="about" className="relative border-t border-border py-10 md:py-14">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow tone="blue">
              <Marker tone="blue" />
              About Cited
            </Eyebrow>
            <h2 className="mt-5 font-display text-h2 tracking-[-0.025em]">
              The best shop in town should be{" "}
              <span className="text-blue">the one the machine names.</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              That's the mission. Buyers moved into AI answers, and the businesses
              getting named aren't always the best ones — they're the ones the
              machines can see. We exist to close that gap for real local
              businesses, measurably, one market at a time.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-6 lg:col-span-6 lg:col-start-7 lg:mt-1">
            {PILLARS.map((p) => (
              <div key={p.k} className="grid grid-cols-[auto_1fr] gap-x-3.5 border-t border-border pt-5 first:border-t-0 first:pt-0">
                <span className="mt-[7px]">
                  <Marker tone={p.tone} />
                </span>
                <div>
                  <div className="font-display text-[1.05rem] font-[640] tracking-[-0.01em]">
                    {p.k}
                  </div>
                  <p className="mt-1 max-w-[52ch] text-[14px] leading-relaxed text-muted-foreground">
                    {p.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
