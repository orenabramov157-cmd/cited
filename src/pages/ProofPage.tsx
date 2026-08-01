import { Container } from "@/components/primitives"
import { Proof } from "@/components/Proof"
import { PageHead, PageNext, MaskLine } from "@/components/PageShell"

export default function ProofPage() {
  return (
    <>
      <Container>
        <PageHead
          index="04"
          eyebrow="The Proof"
          tone="coral"
          title={
            <>
              <MaskLine delay={0.08}>Results get published.</MaskLine>
              <MaskLine delay={0.18}>
                <span className="text-coral">The recipe doesn't.</span>
              </MaskLine>
            </>
          }
          lead="Client zero is our own Dallas jewelry store. No numbers until they're real."
        />
      </Container>

      <Proof />

      <PageNext to="/pricing" label="What it costs" />
    </>
  )
}
