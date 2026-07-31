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
      </Container>
    </section>
  )
}
