# Cited

**Get recommended by AI.** Marketing site + lead magnet for an AI-visibility
(GEO) service for local businesses: when buyers ask ChatGPT/Perplexity/Gemini
for "the best X in [city]", Cited's job is making sure the client is the name
the machine says.

The hook: a free generator — business + city → a six-agent "AI visibility
team" with concrete first moves → prefilled email to us.

## Stack

- React 19 + Vite 8 + TypeScript, Tailwind v4 (`@tailwindcss/vite`)
- framer-motion (restrained motion system), Recharts (lazy-loaded chart)
- Hand-authored shadcn-style primitives (`src/components/ui/`)
- Cloudflare Pages + Pages Function (`functions/api/team.ts`) calling the
  Anthropic API (`claude-opus-5`, structured JSON output)
- Design: "bright editorial intelligence" — warm paper canvas, cobalt as the
  single primary accent, coral/green/yellow in scoped zones, navy reserved for
  the one dark section (the generator instrument). Fonts: Bricolage Grotesque
  (display) / Schibsted Grotesk (body) / IBM Plex Mono (data). Light default,
  dim mode via `data-theme` (storage key `cited-theme-v2`).

## Run

```bash
npm ci
npm run dev -- --port 4599 --strictPort   # site with stub generator
npm run build                              # type-check + production build
```

Verification harness (Playwright; needs the dev server on :4599):

```bash
npx playwright install chromium
node verify.mjs        # 12 checks + screenshots into ./verify-out
```

Live generator locally (optional — needs a key, see `KEY-SETUP.md`):

```bash
npm run build && npx wrangler pages dev dist   # http://localhost:8788
```

## Behavior contract

- The generator **always works**: the client tries `POST /api/team` (12s
  timeout) and silently falls back to the built-in stub on any failure. The
  result label says which path ran ("live draft" / "instant sketch").
- The Proof section intentionally shows **no fabricated numbers** — cells are
  "— logging / — queued" until real, dated evidence exists.
- `prefers-reduced-motion` gets a complete instant-state experience.

## Structure

```
src/components/        page sections (Hero, VisibilityGap, Solution,
                       HowItWorks, Proof, Generator, CloseCta, Nav, footer)
src/components/ui/     button / input / tooltip / tabs primitives
src/lib/               generator logic (stub + fetchTeam), motion tokens, cn
src/hooks/             useTheme, useCountUp
functions/api/team.ts  the live generator endpoint (Cloudflare Pages Function)
verify.mjs             Playwright verification harness
_legacy/index.html     v1 single-file prototype (reference only, not built)
```

## Gates (do not automate away)

- **No deploy without explicit approval** — deploying makes this public.
- **Secrets never in git or chat** — key lives in `.dev.vars` (gitignored)
  locally, Cloudflare secret in prod.
