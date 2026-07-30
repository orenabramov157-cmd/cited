import { Container } from "@/components/primitives"

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink py-9 dark:border-border-strong">
      <Container className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted-foreground">
        <div className="flex items-baseline gap-2.5">
          <span className="inline-block size-[8px] rounded-[1px] bg-blue" aria-hidden />
          <span className="font-display text-[17px] font-[640] text-foreground">Cited</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.1em]">
          <a href="/#about" className="transition-colors hover:text-blue">
            About
          </a>
          <a href="/terms" className="transition-colors hover:text-blue">
            Terms
          </a>
          <a href="/privacy" className="transition-colors hover:text-blue">
            Privacy
          </a>
          <span className="hidden text-faint sm:inline">
            Get recommended by AI · working prototype
          </span>
        </nav>
      </Container>
    </footer>
  )
}
