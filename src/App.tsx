import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Nav } from "@/components/Nav"
import { Hero } from "@/components/Hero"
import { Solution } from "@/components/Solution"
import { HowItWorks } from "@/components/HowItWorks"
import { Proof } from "@/components/Proof"
import { Generator } from "@/components/Generator"
import { CloseCta } from "@/components/CloseCta"
import { SiteFooter } from "@/components/SiteFooter"

// Recharts is heavy — its own chunk, fetched only as the section nears view.
const VisibilityGap = lazy(() =>
  import("@/components/VisibilityGap").then((m) => ({ default: m.VisibilityGap }))
)

/** Renders children once the placeholder comes within `rootMargin` of the viewport. */
function NearViewport({
  minHeight,
  children,
}: {
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
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <NearViewport minHeight={520}>
          <Suspense fallback={<div className="h-[520px]" aria-hidden />}>
            <VisibilityGap />
          </Suspense>
        </NearViewport>
        <Solution />
        <HowItWorks />
        <Proof />
        <Generator />
        <CloseCta />
      </main>
      <SiteFooter />
    </>
  )
}
