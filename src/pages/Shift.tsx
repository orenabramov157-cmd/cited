import { Suspense, lazy } from "react"
import { Container } from "@/components/primitives"
import { PageHead, PageNext, MaskLine } from "@/components/PageShell"

const VisibilityGap = lazy(() =>
  import("@/components/VisibilityGap").then((m) => ({ default: m.VisibilityGap }))
)

export default function Shift() {
  return (
    <>
      <Container>
        <PageHead
          index="01"
          eyebrow="The Shift"
          title={
            <>
              <MaskLine delay={0.08}>Search didn't die.</MaskLine>
              <MaskLine delay={0.18}>
                It moved <span className="text-blue">inside the machine.</span>
              </MaskLine>
            </>
          }
          lead="One question in, a few names out."
        />
      </Container>

      <Suspense fallback={<div className="h-[520px]" aria-hidden />}>
        <VisibilityGap />
      </Suspense>

      <PageNext to="/team" label="Meet the team" />
    </>
  )
}
