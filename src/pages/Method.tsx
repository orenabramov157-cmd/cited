import { Container } from "@/components/primitives"
import { HowItWorks } from "@/components/HowItWorks"
import { PageHead, PageNext, MaskLine } from "@/components/PageShell"

export default function Method() {
  return (
    <>
      <Container>
        <PageHead
          index="03"
          eyebrow="The Method"
          tone="green"
          title={
            <>
              <MaskLine delay={0.08}>Measure it, move it,</MaskLine>
              <MaskLine delay={0.18}>
                <span className="text-green">measure again.</span>
              </MaskLine>
            </>
          }
          lead="A before-and-after on your real customer questions."
        />
      </Container>

      <HowItWorks />

      <PageNext to="/proof" label="See the proof" />
    </>
  )
}
