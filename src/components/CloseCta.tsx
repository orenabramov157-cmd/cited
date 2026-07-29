import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow, Marker } from "@/components/primitives"

export function CloseCta() {
  return (
    <section id="start" className="relative border-t border-border bg-panel py-24 md:py-32">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-9">
            <Eyebrow tone="blue">
              <Marker tone="blue" />
              Get started
            </Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,6.4vw,4.6rem)] font-[680] leading-[1.02] tracking-[-0.03em]">
              Be the name
              <br />
              <span className="hl-yellow">the machine says.</span>
            </h2>
            <p className="mt-6 max-w-[50ch] text-lead text-muted-foreground">
              If your customers are asking AI where to go, this is the difference between
              being in the answer and not existing. Let's get you cited.
            </p>
          </div>
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
