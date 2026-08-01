import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Container, Eyebrow, Marker } from "@/components/primitives"
import { Button } from "@/components/ui/button"
import { PageHead, MaskLine, Block } from "@/components/PageShell"
import { Tilt } from "@/components/fx/Tilt"
import { Magnetic } from "@/components/fx/Magnetic"
import { CONTACT_EMAIL, MAX_BUSINESS, MAX_CITY } from "@/lib/generator"
import { EASE_REVEAL, staggerContainer, agentItem } from "@/lib/motion"

/** What the free report actually contains — the diagnosis, not the treatment. */
const DELIVERS = [
  ["01", "The questions", "The exact prompts your buyers ask before they choose."],
  ["02", "The answers", "Who the machines name today, verbatim and dated."],
  ["03", "The gap", "Where you are missing from the lists those answers come from."],
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Demo() {
  const [biz, setBiz] = useState("")
  const [city, setCity] = useState("")
  const [site, setSite] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filled = [biz, city, site, email].filter((v) => v.trim().length > 0).length

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`AI visibility report — ${biz.trim() || "my business"}`)
    const body = encodeURIComponent(
      [
        `Business: ${biz.trim()}`,
        `City: ${city.trim()}`,
        `Website: ${site.trim()}`,
        `Email: ${email.trim()}`,
        "",
        "Please run my AI visibility report.",
      ].join("\n")
    )
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }, [biz, city, site, email])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!biz.trim() || !city.trim()) {
      setError("Business and city, at minimum.")
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("That email does not look right.")
      return
    }
    setError(null)
    setSent(true)
    window.location.href = mailto
  }

  return (
    <>
      <Container>
        <PageHead
          index="06"
          eyebrow="Request your report"
          title={
            <>
              <MaskLine delay={0.08}>See what the machines</MaskLine>
              <MaskLine delay={0.18}>
                say about you <span className="text-blue">right now.</span>
              </MaskLine>
            </>
          }
          lead="Four fields. A real report, read by a human, back within a day."
        />
      </Container>

      <Block>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-12">
            {/* the form */}
            <div>
              <Tilt max={4} className="h-full">
                <form
                  id="report"
                  onSubmit={onSubmit}
                  // type="email" keeps the right mobile keyboard, but the
                  // browser's own validation bubble would preempt ours and
                  // speak in a different voice, so we own the messages
                  noValidate
                  className="flex h-full flex-col border-t-2 border-ink bg-background p-6 dark:border-border-strong sm:p-7"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Eyebrow tone="blue">
                      <Marker tone="blue" />
                      Free report
                    </Eyebrow>
                    <span className="font-mono text-[10px] tabular-nums text-faint">
                      {filled}/4
                    </span>
                  </div>

                  {/* the rule fills as the form does: progress you can feel */}
                  <div className="mt-4 h-[2px] w-full overflow-hidden bg-border">
                    <motion.div
                      animate={{ scaleX: filled / 4 }}
                      initial={{ scaleX: 0 }}
                      transition={{ duration: 0.45, ease: EASE_REVEAL }}
                      style={{ originX: 0 }}
                      className="h-full w-full bg-blue"
                    />
                  </div>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <Field
                      id="biz"
                      label="Business"
                      placeholder="Abramov Fine Jewelry"
                      value={biz}
                      onChange={setBiz}
                      max={MAX_BUSINESS}
                    />
                    <Field
                      id="city"
                      label="City"
                      placeholder="Dallas"
                      value={city}
                      onChange={setCity}
                      max={MAX_CITY}
                    />
                    <Field
                      id="site"
                      label="Website"
                      placeholder="yourshop.com"
                      value={site}
                      onChange={setSite}
                      max={160}
                    />
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="you@yourshop.com"
                      value={email}
                      onChange={setEmail}
                      max={160}
                    />
                  </div>

                  <AnimatePresence>
                    {error ? (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5 flex items-center gap-2 text-[13px] text-coral"
                      >
                        <AlertCircle size={14} /> {error}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Magnetic strength={7}>
                      <Button type="submit" size="lg">
                        {sent ? "Sent" : "Send it to me"} <ArrowRight />
                      </Button>
                    </Magnetic>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                      No call required
                    </span>
                  </div>

                  <p className="mt-6 border-l-2 border-yellow pl-4 text-[13px] leading-relaxed text-muted-foreground">
                    Prefer to talk it through? Reply to the report and we will book
                    fifteen minutes.
                  </p>
                </form>
              </Tilt>
            </div>

            {/* what arrives */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <Eyebrow tone="green">
                <Marker tone="green" />
                What arrives
              </Eyebrow>
              {DELIVERS.map(([n, k, d]) => (
                <motion.div
                  key={k}
                  variants={agentItem}
                  className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-border pt-4"
                >
                  <span className="font-mono text-[10px] tabular-nums text-faint">{n}</span>
                  <div>
                    <p className="font-display text-[1.15rem] font-[640] tracking-[-0.015em]">
                      {k}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                      {d}
                    </p>
                  </div>
                </motion.div>
              ))}
              <p className="border-l-2 border-blue pl-4 text-[14px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">The report is free.</span> The
                fix is not, and we will tell you what it costs before you ask.
              </p>
            </motion.div>
          </div>
        </Container>
      </Block>
    </>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  max,
  type = "text",
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  max: number
  type?: string
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        className="mt-2 w-full border-b border-border-strong bg-transparent pb-2 text-[15px] outline-none transition-colors duration-200 placeholder:text-faint/70 focus:border-blue"
      />
    </label>
  )
}
