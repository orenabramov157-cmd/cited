import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow, Marker } from "@/components/primitives"

export function CloseCta() {
  const reduce = useReducedMotion()
  return (
    <section id="start" className="relative border-t border-border bg-panel py-12 md:py-14">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-9"
          >
            <Eyebrow tone="blue">
              <Marker tone="blue" />
              Get started
            </Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,6.4vw,4.6rem)] font-[680] leading-[1.02] tracking-[-0.03em]">
              Be the name
              <br />
              <span className="hl-yellow">their machine says.</span>
            </h2>
            <p className="mt-6 max-w-[50ch] text-lead text-muted-foreground">
              If your customers are asking AI where to go, this is the difference between
              being in the answer and not existing. Let's get you cited. It often starts
              as simply as getting you onto the few lists the machines already trust.
            </p>
            <p className="mt-7 max-w-[52ch] border-l-2 border-yellow pl-4 text-[14px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                One business per category, per market.
              </span>{" "}
              The AI names three, and we don't work both sides of that fight. Dallas
              jewelry is taken (it's our own case study). Your category in your city
              may still be open.
            </p>
          </motion.div>
          <div className="mt-10 lg:col-span-3 lg:mt-0 lg:justify-self-end">
            <Button asChild size="lg">
              <a href="#build">
                Build your team <ArrowRight />
              </a>
            </Button>
          </div>
        </div>

        {/* about strip: mission + what we stand on, compact */}
        <motion.div
          id="about"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 border-t border-border pt-7"
        >
          <div className="flex items-baseline justify-between gap-6">
            <Eyebrow tone="blue">
              <Marker tone="blue" />
              About Cited
            </Eyebrow>
            <p className="hidden max-w-[44ch] text-right text-[13px] leading-relaxed text-muted-foreground md:block">
              The best shop in town should be the one the machine names. We close
              that gap, measurably, one market at a time.
            </p>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {[
              ["green", "Evidence first", "Dated screenshots, repeat runs. If we can't measure it, we don't say it."],
              ["blue", "Skin in the game", "Born inside our own 35-year family jewelry store. Client zero is us."],
              ["yellow", "One per market", "The AI names three. We never work both sides of the same answer."],
            ].map(([tone, k, d]) => (
              <div key={k} className="grid grid-cols-[auto_1fr] gap-x-3">
                <span className="mt-[6px]">
                  <Marker tone={tone as "green" | "blue" | "yellow"} />
                </span>
                <div>
                  <div className="font-display text-[15px] font-[640]">{k}</div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
