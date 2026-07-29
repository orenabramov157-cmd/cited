import { lazy, Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Nav } from "@/components/Nav"
import { Hero } from "@/components/Hero"
import { Solution } from "@/components/Solution"
import { HowItWorks } from "@/components/HowItWorks"
import { Proof } from "@/components/Proof"
import { Generator } from "@/components/Generator"
import { CloseCta } from "@/components/CloseCta"
import { SiteFooter } from "@/components/SiteFooter"

// Recharts is heavy — load the chart section only when needed.
const VisibilityGap = lazy(() =>
  import("@/components/VisibilityGap").then((m) => ({ default: m.VisibilityGap }))
)

export default function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <Nav />
      <main>
        <Hero />
        <Suspense fallback={<div className="h-[520px]" aria-hidden />}>
          <VisibilityGap />
        </Suspense>
        <Solution />
        <HowItWorks />
        <Proof />
        <Generator />
        <CloseCta />
      </main>
      <SiteFooter />
    </TooltipProvider>
  )
}
