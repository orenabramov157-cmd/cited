import { motion, useReducedMotion } from "framer-motion"
import { Container, Eyebrow, Marker } from "@/components/primitives"

const pop = (reduce: boolean | null, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 26, scale: 0.95 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: false, amount: 0.35 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
})

const PILLARS = [
  {
    tone: "green" as const,
    k: "Evidence first",
    d: "Every claim ships with dated screenshots and repeat runs. If we can't measure it, we don't say it.",
  },
  {
    tone: "blue" as const,
    k: "Skin in the game",
    d: "Cited started inside our own 35-year family jewelry store in Dallas. Client zero is us. The method gets proven on our money, not yours.",
  },
  {
    tone: "yellow" as const,
    k: "One per market",
    d: "The AI names three. We never work both sides of the same answer: one business per category, per market.",
  },
]

export function About() {
  const reduce = useReducedMotion()
  return (
    <section id="about" className="relative border-t border-border py-8 md:py-12">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div {...pop(reduce)} className="lg:col-span-5">
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
              getting named aren't always the best ones. They're the ones the
              machines can see. We exist to close that gap for real local
              businesses, measurably, one market at a time.
            </p>
          </motion.div>
          <div className="mt-10 flex flex-col gap-5 lg:col-span-6 lg:col-start-7 lg:mt-1">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.k}
                {...pop(reduce, 0.1 + i * 0.1)}
                className="grid grid-cols-[auto_1fr] gap-x-3.5 border-t border-border pt-4 first:border-t-0 first:pt-0"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
