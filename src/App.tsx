import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Nav } from "@/components/Nav"
import { Hero } from "@/components/Hero"
import { Solution } from "@/components/Solution"
import { HowItWorks } from "@/components/HowItWorks"
import { Proof } from "@/components/Proof"
import { Generator } from "@/components/Generator"
import { CloseCta } from "@/components/CloseCta"
import { SiteFooter } from "@/components/SiteFooter"
import { LegalPage } from "@/components/LegalPage"

// Recharts is heavy — its own chunk, fetched only as the section nears view.
const VisibilityGap = lazy(() =>
  import("@/components/VisibilityGap").then((m) => ({ default: m.VisibilityGap }))
)

/**
 * Renders children once the placeholder comes within `rootMargin` of the
 * viewport. `id` goes on this wrapper — not on anything inside `children` —
 * so an in-page anchor to it (nav link, scrollspy) always has a target in
 * the DOM, even before the lazy content itself has mounted.
 */
function NearViewport({
  id,
  minHeight,
  children,
}: {
  id?: string
  minHeight: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setShow(true) // no observer support → don't hide content
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: "600px 0px" } // start fetching before it's visible
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div id={id} ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  )
}

export default function App() {
  // Tiny path router — /terms and /privacy render standalone legal pages.
  // Cloudflare Pages' SPA fallback (and vite dev) serve index.html for both.
  const path = window.location.pathname
  if (path === "/terms" || path === "/terms/") return <LegalPage doc="terms" />
  if (path === "/privacy" || path === "/privacy/") return <LegalPage doc="privacy" />

  return (
    <>
      <Nav />
      <main>
        {/* Hero pins; the rest of the page slides up OVER it on first scroll. */}
        <div className="sticky top-0 z-0">
          <Hero />
        </div>
        <div className="relative z-10 bg-background">
          <NearViewport id="problem" minHeight={520}>
            <Suspense fallback={<div className="h-[520px]" aria-hidden />}>
              <VisibilityGap />
            </Suspense>
          </NearViewport>
          <Solution />
          <HowItWorks />
          <Proof />
          <Generator />
          <CloseCta />
        </div>
      </main>
      <div className="relative z-10 bg-background">
        <SiteFooter />
      </div>
    </>
  )
}
