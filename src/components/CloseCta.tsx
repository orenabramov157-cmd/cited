import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { Rise } from "@/components/Rise"

export function CloseCta() {
  return (
    <section id="start" className="relative border-t border-border bg-panel py-12 md:py-14">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          <Rise amount={46} className="lg:col-span-9">
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
              Being in the answer is the whole game. It often starts with the few
              lists the machines already trust.
            </p>
            <p className="mt-7 max-w-[52ch] border-l-2 border-yellow pl-4 text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                One business per category, per market.
              </span>{" "}
              Dallas jewelry is taken. Yours may still be open.
            </p>
          </Rise>
          <div className="mt-10 lg:col-span-3 lg:mt-0 lg:justify-self-end">
            <Button asChild size="lg">
              <a href="#build" aria-label="Build your team">
                Build your team <ArrowRight />
              </a>
            </Button>
          </div>
        </div>

        {/* about strip: mission + what we stand on, compact */}
        <Rise amount={30} id="about" className="mt-12 border-t border-border pt-7">
          <div className="flex items-baseline justify-between gap-6">
            <Eyebrow tone="blue">
              <Marker tone="blue" />
              About Cited
            </Eyebrow>
            <p className="hidden max-w-[44ch] text-right text-[14px] leading-relaxed text-muted-foreground md:block">
              The best shop in town should be the one the machine names.
            </p>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {[
              ["green", "Evidence first", "Dated screenshots, repeat runs. No claims without them."],
              ["blue", "Skin in the game", "Born in our 35-year family jewelry store. Client zero is us."],
              ["yellow", "One per market", "The AI names three. We take one side."],
            ].map(([tone, k, d]) => (
              <div key={k} className="grid grid-cols-[auto_1fr] gap-x-3">
                <span className="mt-[6px]">
                  <Marker tone={tone as "green" | "blue" | "yellow"} />
                </span>
                <div>
                  <div className="font-display text-[16px] font-[640]">{k}</div>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Rise>
      </Container>
    </section>
  )
}
