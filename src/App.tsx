import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { SiteFooter } from "@/components/SiteFooter"
import { ConversionBand, MobileActionBar } from "@/components/ConversionBand"
import { PageTransition } from "@/components/fx/PageTransition"
import { ScrollAdvance } from "@/components/fx/ScrollAdvance"
import { LegalPage } from "@/components/LegalPage"
import Home from "@/pages/Home"

// Every inner page is its own chunk: the first paint only pays for the hero.
const Shift = lazy(() => import("@/pages/Shift"))
const Team = lazy(() => import("@/pages/Team"))
const Method = lazy(() => import("@/pages/Method"))
const ProofPage = lazy(() => import("@/pages/ProofPage"))
const Pricing = lazy(() => import("@/pages/Pricing"))
const Demo = lazy(() => import("@/pages/Demo"))
const Try = lazy(() => import("@/pages/Try"))

function Shell() {
  return (
    <ScrollAdvance>
      <Nav />
      <main>
        {/*
          `location` is passed explicitly rather than read from context. Without
          it the exiting subtree re-renders with the *new* location, so the
          incoming page slides out and then slides back in.
        */}
        <PageTransition>
          {(location) => (
            <Suspense fallback={<div className="min-h-[70vh]" aria-hidden />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/shift" element={<Shift />} />
                <Route path="/team" element={<Team />} />
                <Route path="/method" element={<Method />} />
                <Route path="/proof" element={<ProofPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/try" element={<Try />} />
                <Route path="/terms" element={<LegalPage doc="terms" />} />
                <Route path="/privacy" element={<LegalPage doc="privacy" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          )}
        </PageTransition>
      </main>
      <ConversionBand />
      <SiteFooter />
      <MobileActionBar />
    </ScrollAdvance>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
