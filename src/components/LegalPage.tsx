import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Container } from "@/components/primitives"

const EFFECTIVE = "July 30, 2026"
const CONTACT = "orenabramov157@gmail.com"

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-[1.35rem] font-[640] tracking-[-0.01em]">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{children}</p>
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="mt-2 flex gap-2.5 text-[14.5px] leading-relaxed text-muted-foreground">
      <span aria-hidden className="mt-[9px] size-[5px] shrink-0 rounded-[1px] bg-blue" />
      <span>{children}</span>
    </li>
  )
}

function Terms() {
  return (
    <>
      <h1 className="font-display text-h2 tracking-[-0.02em]">Terms of Service</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
        Effective {EFFECTIVE}
      </p>

      <H2>1. Who we are</H2>
      <P>
        Cited ("Cited," "we," "us") is an AI-visibility service operated by Oren Abramov.
        This website describes the service and offers a free, illustrative team-sketch
        tool. Questions: {CONTACT}.
      </P>

      <H2>2. The sketch tool</H2>
      <P>
        The generator on this site drafts an illustrative "visibility team" from two
        inputs: a business type and a city. It is a sketch, produced automatically,
        for exploration only. It is not professional advice, not an audit, not a
        contractual offer, and you should not rely on it as any of those. Please don't
        submit confidential information, trade secrets, or personal data about anyone.
        The tool doesn't need it and isn't designed for it. We may rate-limit, apply
        bot checks, or decline requests to keep the tool available.
      </P>

      <H2>3. Engagements</H2>
      <P>
        Actual visibility work is provided under a separate written agreement, not
        through this site. Nothing here constitutes an offer to serve any particular
        business. Our one-business-per-category-per-market policy is a service
        principle applied at our discretion and subject to availability. It is not a
        reservation system and confers no rights until an agreement is signed.
      </P>

      <H2>4. No outcome guarantees</H2>
      <P>
        The AI systems we work around (ChatGPT, Perplexity, Gemini, Claude, and
        others) are operated by third parties, change constantly, and produce
        probabilistic answers. We commit to honest measurement: dated evidence,
        repeated runs, and before/after comparisons. We do not and cannot guarantee
        that any system will name, rank, or recommend any business, or that any
        result will persist. Figures on this site labeled directional are exactly
        that.
      </P>

      <H2>5. Intellectual property</H2>
      <P>
        The content of this site belongs to us. More importantly: our methodology,
        including source maps, fix sequences, thresholds, scripts, playbooks, and
        internal processes, remains our sole property. Viewing this site or engaging
        us does not transfer or license any of it. Deliverables and reports we
        prepare for a client under a written agreement belong to that client;
        the method used to produce them does not.
      </P>

      <H2>6. Acceptable use</H2>
      <ul>
        <LI>Don't scrape, bulk-query, or automate against the sketch tool.</LI>
        <LI>Don't attempt to reverse-engineer the service or probe our systems.</LI>
        <LI>Don't use the site for anything unlawful or to harvest competitive data.</LI>
      </ul>

      <H2>7. Disclaimers and limitation of liability</H2>
      <P>
        The site and sketch tool are provided "as is" and "as available," without
        warranties of any kind, express or implied, to the maximum extent permitted
        by law. To the same extent, our total liability arising out of the site or
        sketch tool is capped at one hundred US dollars (US $100), and we are not
        liable for indirect, incidental, consequential, or punitive damages, or lost
        profits or revenue.
      </P>

      <H2>8. Governing law</H2>
      <P>
        These terms are governed by the laws of the State of California, and disputes
        belong to the state or federal courts located in Los Angeles County,
        California.
      </P>

      <H2>9. Changes</H2>
      <P>
        We may update these terms; the effective date above changes when we do.
        Using the site after a change means you accept the updated terms.
      </P>
    </>
  )
}

function Privacy() {
  return (
    <>
      <h1 className="font-display text-h2 tracking-[-0.02em]">Privacy Policy</h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
        Effective {EFFECTIVE}
      </p>

      <P>
        Short version: no accounts, no ad trackers, no analytics scripts, and we
        don't sell data. The sketch tool sends only what you type into it: a
        business type and a city.
      </P>

      <H2>1. What we process</H2>
      <ul>
        <LI>
          <strong className="text-foreground">Sketch inputs.</strong> When live
          drafting is enabled, the business type and city you enter are sent to our
          server function and forwarded to Anthropic (Claude) to draft your team. We
          process them transiently and do not store them; there is no database
          behind this site. When live drafting is unavailable, the sketch is
          generated entirely in your browser and your inputs never leave it.
        </LI>
        <LI>
          <strong className="text-foreground">Email.</strong> "Email me this team"
          opens a pre-filled draft in your own mail app. Nothing is sent to us
          unless you choose to send it. Emails you send become ordinary
          correspondence we retain like any business would.
        </LI>
        <LI>
          <strong className="text-foreground">Infrastructure logs.</strong> Our
          host (Cloudflare) may log requests and IP addresses for security and
          operations, per its own policies.
        </LI>
        <LI>
          <strong className="text-foreground">Bot protection.</strong> If Cloudflare
          Turnstile is active, Cloudflare processes limited device and interaction
          signals to distinguish humans from bots; we receive only a pass/fail
          token.
        </LI>
        <LI>
          <strong className="text-foreground">Theme preference.</strong> Your
          light/dark choice is stored in your browser's localStorage and is never
          transmitted to us.
        </LI>
      </ul>

      <H2>2. Third parties</H2>
      <P>
        Cloudflare provides hosting and security. Anthropic processes sketch inputs
        via its commercial API; under Anthropic's commercial terms, API inputs are
        not used to train models. We use no advertising or analytics third parties.
      </P>

      <H2>3. Retention</H2>
      <P>
        Sketch inputs: not retained by us. Correspondence: kept as long as ordinarily
        needed. Provider logs: per Cloudflare's and Anthropic's own retention
        policies.
      </P>

      <H2>4. Your rights</H2>
      <P>
        California residents have rights under the CCPA, including to know, delete,
        and not be discriminated against for exercising them. We don't sell or share
        personal information for advertising. To exercise any right, email {CONTACT}.
      </P>

      <H2>5. Children</H2>
      <P>This site is not directed to children under 16.</P>

      <H2>6. Changes</H2>
      <P>
        We may update this policy; the effective date above changes when we do.
        Questions: {CONTACT}.
      </P>
    </>
  )
}

export function LegalPage({ doc }: { doc: "terms" | "privacy" }) {
  useEffect(() => {
    document.title =
      doc === "terms" ? "Terms of Service · Cited" : "Privacy Policy · Cited"
    window.scrollTo(0, 0)
  }, [doc])

  // The shell already supplies Nav, <main> and the footer. Rendering our own
  // here nested a <main> inside a <main> and shipped two headers and two
  // footers, which is invalid HTML and breaks landmark navigation.
  return (
    <div className="pt-24 pb-14 md:pt-28 md:pb-18">
      <Container className="max-w-[760px]">
        <Link
          to="/"
          className="mb-9 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-blue"
        >
          <ArrowLeft size={15} aria-hidden /> Back to site
        </Link>
        {doc === "terms" ? <Terms /> : <Privacy />}
      </Container>
    </div>
  )
}
