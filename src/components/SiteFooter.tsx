import { Link } from "react-router-dom"
import { Phone, Mail } from "lucide-react"
import { Container } from "@/components/primitives"
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/generator"

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink py-9 dark:border-border-strong">
      <Container className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted-foreground">
        <Link to="/" className="flex items-baseline gap-2.5">
          <span className="inline-block size-[8px] rounded-[1px] bg-blue" aria-hidden />
          <span className="font-display text-[17px] font-[640] text-foreground">Cited</span>
        </Link>
        {/* a way to reach a human, on every page, not buried on a contact page */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-blue"
          >
            <Phone size={13} aria-hidden />
            {CONTACT_PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-1.5 transition-colors hover:text-blue"
          >
            <Mail size={13} aria-hidden />
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.1em]">
          <Link to="/demo" className="transition-colors hover:text-blue">
            Book a call
          </Link>
          <Link to="/try" className="transition-colors hover:text-blue">
            Try it
          </Link>
          <Link to="/terms" className="transition-colors hover:text-blue">
            Terms
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-blue">
            Privacy
          </Link>
          <span className="hidden text-faint sm:inline">
            Get recommended by AI · working prototype
          </span>
        </nav>
      </Container>
    </footer>
  )
}
