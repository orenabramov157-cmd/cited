# HANDOFF — rules for ANY tool or model editing this site

This repo is production-bound and carries hard constraints. If you are an AI
tool (v0, Bolt, Lovable, Replit, a cheaper Claude chat, anyone): read this
fully before editing. Violating these creates work instead of saving it.

## Structure (since the multi-page redesign)

Six routes via react-router: `/` `/shift` `/team` `/method` `/proof` `/try`.
Page files live in `src/pages/`, the shared masthead/pager in
`src/components/PageShell.tsx`, the motion primitives in
`src/components/fx/`. Do not reintroduce one-page anchor scrolling.

## Non-negotiable constraints

1. **Work on a branch, never main.** Name it `polish/<something>`.
2. **Do not touch:** `functions/` (hardened API), `verify.mjs` (test harness),
   `wrangler.toml`, `KEY-SETUP.md`, `FINDINGS.md`, anything in `.dev.vars`.
3. **Locked palette. Never introduce:** purple/violet/lavender/magenta,
   gold/brown, dark full-bleed sections (the site is a continuous light
   paper system; navy was tried and rejected). Tokens live in
   `src/index.css` — use them, add nothing.
4. **Fonts are fixed:** Bricolage Grotesque (display), Schibsted Grotesk
   (body), IBM Plex Mono (data labels only). No new fonts, no CDNs (fonts
   are self-hosted via Fontsource).
5. **No em dashes anywhere in copy.** Periods, commas, colons.
6. **Honest numbers only.** Never invent statistics, reviews, client counts,
   testimonials, or results. Scorecard cells stay "logging/queued" until real
   evidence exists. Competitor names stay generic ("Competitor A").
7. **The method stays vague on-page.** Categories only (citations, schema,
   reviews, answer content). Never name specific sources, sequences,
   thresholds, or scripts. That is the product's IP.
8. **Motion doctrine (updated 2026-07-31, owner approved "more animation"):**
   the site is motion-forward but palette-quiet. Cursor-reactive first:
   `PointerField` (canvas tick grid displaced by the pointer) on the hero,
   `Tilt` for panels, `Magnetic` for primary buttons and the pager, `MaskLine`
   for headline entrances, `PageTransition` between routes, `Cursor` ring on
   desktop. Scroll-scrubbed counter-drift via `Rise` still carries in-page
   reveals. Everything instant, and the canvas/cursor unmounted entirely,
   under prefers-reduced-motion. Do NOT add motion by adding scroll length:
   pages are capped at ~3200px and the harness fails if one grows past it.
9. **Accessibility holds:** visible focus states, aria labels, contrast at
   WCAG AA in BOTH themes (light default + dim mode via the toggle).

## How your work gets accepted

The owner validates every external change back in Claude Code with:

    npm run build        # must stay clean
    node verify.mjs      # Playwright harness, must stay 59/59 (dev server on :4599)

Anything that breaks either gets reverted without discussion. Small,
reviewable commits survive; repo-wide rewrites don't.

## DONE 2026-07-31 — copy cuts ("mom pass", part 2) — DO NOT REDO

Already applied in-repo. Kept below only as the reference for the site's
copy voice: short, punchy, no em dashes, claims unchanged.

- Hero lead: "Your buyers stopped Googling. They ask ChatGPT, Perplexity and
  Gemini, and the machine names a handful of businesses." →
  "Buyers stopped Googling. They ask AI, and it names a handful of
  businesses." (keep the bold "Cited makes sure you're one of them.")
- Shift lead: "Nobody scrolls ten blue links anymore. They ask one question
  and take the few names the answer gives back. If you're not in it, the
  customer never learns you exist." → "One question in, a few names out.
  If you're not one of them, you don't exist."
- Coral annotation: "Right now, for the queries that matter, the AI is naming
  your competitors." → "Right now, the AI is naming your competitors."
- 45% caption: "of buyers now ask AI to find a local business. And it climbs
  every quarter." → "of buyers ask AI to find local businesses. Climbing
  every quarter."
- ~1.2% caption: "of local businesses surface in AI answers today. The field
  is wide open." → "of local businesses show up in AI answers. Wide open."
- Team header para: "Each owns a lever AI weighs when it decides who to name.
  You don't manage them. We run the playbook and prove the movement on your
  own queries." → "Each owns a lever AI weighs when deciding who to name.
  We run them. You see the lift."
- Citation Hunter: "Gets you cited by the sources AI already trusts: the
  lists, directories and press it pulls its answers from. The single biggest
  lever on who gets named." → "Gets you cited by the sources AI already
  trusts. The biggest lever on who gets named."
- Schema Architect: → "Makes your site machine-readable. No guesswork."
- Review Engine: → "Pushes your rating past the bar AI checks."
- Listicle Infiltrator: → "Gets you into the “best of” lists AI reads."
- Entity Aligner: → "One identity everywhere, so AI trusts you're real."
- Answer-Page Writer: → "Writes the answers AI ends up quoting."
- Method lead: "The whole engagement is a before-and-after on your real
  customer questions, so you see the lift, not a vibe." → "A before-and-after
  on your real customer questions. Lift, not vibes."
- Method steps: Baseline → "Your real buyer questions, four engines, three
  passes. Do they name you?" · Diagnose → "Every loss traced to the sources
  the AI leaned on." · Fix → "The moves that change who gets named, shipped
  in sequence." · Re-measure → "Same questions again. Absent → named, in
  black and white."
- Proof lead: → "Client zero: our own Dallas jewelry store. The scorecard
  fills in as dated evidence lands. No numbers until they're real."
- Proof client rail: 01 → "Baseline scorecard: where you stand, engine by
  engine." · 02 → "Fixes executed for you, reported by category." · 03 →
  "Scorecard re-run. The lift in black and white."
- Proof lock box: keep the bold sentence, delete the sentence after it.
- Generator left para: → "Business and city in. Your six-agent team out,
  named for your trade."
- CloseCta para: → "Being in the answer is the whole game. It often starts
  with the few lists the machines already trust."
- Exclusivity block: → "One business per category, per market. Dallas jewelry
  is taken. Yours may still be open." (keep the bold lead-in)
- About pillars: Evidence first → "Dated screenshots, repeat runs. No claims
  without them." · Skin in the game → "Born in our 35-year family jewelry
  store. Client zero is us." · One per market → "The AI names three. We take
  one side."
- About mission line (md-only): → "The best shop in town should be the one
  the machine names."

Do not shorten: legal pages, chart footnote, mono micro-labels, the
"Instrument v1" note.
