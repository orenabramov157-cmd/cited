import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Nav } from "@/components/Nav"
import { SiteFooter } from "@/components/SiteFooter"
import { Cursor } from "@/components/fx/Cursor"
import { PageTransition } from "@/components/fx/PageTransition"
import { LegalPage } from "@/components/LegalPage"
import Home from "@/pages/Home"

// Every inner page is its own chunk: the first paint only pays for the hero.
const Shift = lazy(() => import("@/pages/Shift"))
const Team = lazy(() => import("@/pages/Team"))
const Method = lazy(() => import("@/pages/Method"))
const ProofPage = lazy(() => import("@/pages/ProofPage"))
const Try = lazy(() => import("@/pages/Try"))

function Shell() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <PageTransition>
          <Suspense fallback={<div className="min-h-[70vh]" aria-hidden />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shift" element={<Shift />} />
              <Route path="/team" element={<Team />} />
              <Route path="/method" element={<Method />} />
              <Route path="/proof" element={<ProofPage />} />
              <Route path="/try" element={<Try />} />
              <Route path="/terms" element={<LegalPage doc="terms" />} />
              <Route path="/privacy" element={<LegalPage doc="privacy" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </main>
      <SiteFooter />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
