import { Link, useLocation } from "react-router-dom"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/primitives"
import { Magnetic } from "@/components/fx/Magnetic"
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/generator"

/**
 * The block that sits above the footer on every page.
 *
 * Ten of the fourteen comparable sites we measured end every page this way,
 * and the reason is unglamorous: a visitor who has read to the bottom has
 * already spent their attention, and asking them to scroll back up to the nav
 * to act is asking them to do work. Three ways out are offered, in ascending
 * order of commitment, because the same page has to serve someone browsing and
 * someone ready to buy.
 *
 * Suppressed on the demo page itself, where it would be asking twice, and on
 * the legal pages, where it would be crass.
 */
const SUPPRESS = ["/demo", "/terms", "/privacy"]

export function ConversionBand() {
  const { pathname } = useLocation()
  if (SUPPRESS.includes(pathname)) return null

  return (
    <section className="border-t border-border bg-panel py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="eyebrow text-faint">Find out where you stand</span>
          <h2 className="mt-2 max-w-[20ch] font-display text-[clamp(1.5rem,3vw,2.1rem)] font-[640] leading-[1.08] tracking-[-0.025em]">
            See what the machines say about you.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex items-center gap-2 text-[14px] font-medium transition-colors hover:text-blue"
          >
            <Phone size={14} aria-hidden />
            {CONTACT_PHONE_DISPLAY}
          </a>
          <Button asChild variant="outline" size="lg">
            <Link to="/try">Try the demo</Link>
          </Button>
          <Magnetic strength={7}>
            <Button asChild size="lg">
              <Link to="/demo">
                Get your report <ArrowRight />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </Container>
    </section>
  )
}

/**
 * The mobile safety net. On a phone the nav collapses and the footer is a long
 * way down, so the single most important action rides along at the bottom of
 * the screen. Hidden on the demo page, where the form itself is the action.
 */
export function MobileActionBar() {
  const { pathname } = useLocation()
  if (SUPPRESS.includes(pathname)) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <a
          href={`tel:${CONTACT_PHONE}`}
          className="flex items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-[14px] font-medium"
        >
          <Phone size={15} aria-hidden />
          Call
        </a>
        <Button asChild className="flex-1">
          <Link to="/demo">Get your report</Link>
        </Button>
      </div>
    </div>
  )
}
