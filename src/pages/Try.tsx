import { Container } from "@/components/primitives"
import { Generator } from "@/components/Generator"
import { CloseCta } from "@/components/CloseCta"
import { PageHead, MaskLine } from "@/components/PageShell"

export default function Try() {
  return (
    <>
      <Container>
        <PageHead
          index="05"
          eyebrow="Try it"
          title={
            <>
              <MaskLine delay={0.08}>Your business,</MaskLine>
              <MaskLine delay={0.18}>
                your city, <span className="text-blue">your team.</span>
              </MaskLine>
            </>
          }
          lead="Two fields. Six agents, drafted for you."
        />
      </Container>

      <Generator />
      <CloseCta />
    </>
  )
}
