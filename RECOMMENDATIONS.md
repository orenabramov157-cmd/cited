# What's next — pick your numbers

Prioritized menu. Reply to Claude with the numbers you want (e.g. "do 2, 4, 6").
Effort = your time · my time runs itself. 💰 = costs money → your call first.

## Critical path
1. **Run the baseline** (~60–75 min you, kit ready in
   `~/geo-planning/baseline-run/RUN-KIT.md`). Everything downstream — Before
   report, fix list, real Proof-section numbers, first case study — waits on
   this. Say "done" when the screenshots are in the drop folder.
2. **Drop the API key** (2 min you, `KEY-SETUP.md`) → live generator drafts.
   ~1–2¢ per draft; say "key is in", never paste it.
3. **Codex debug pass** (0 min you): point Codex at this repo, tell it to
   follow `CODEX-REVIEW.md`. Then hand me its `FINDINGS.md` — I'll reconcile,
   reject anything wrong, and land the rest.

## Pre-deploy hardening (before the site goes public)
4. **Rate-limit + bot-protect `/api/team`** — Cloudflare Turnstile on the
   generator form (free; I have the turnstile-spin skill) so strangers can't
   burn your API credits.
5. **Domain + deploy** 💰 — pick a domain (cited.* ~$10–40/yr via Cloudflare)
   or start free on `cited.pages.dev`; then `wrangler pages deploy` + key as
   CF secret. Gated on your explicit go.
6. **Branded contact email** — leads currently mail your personal gmail.
   Cloudflare Email Routing (free) can front it with hello@<domain> once #5
   picks a domain.

## Polish & proof
7. **Share-readiness** — OG image + meta so the link unfurls properly when
   you send it to anyone; proper favicon set.
8. **Privacy-light analytics** — Cloudflare Web Analytics (free, no cookies)
   so we see whether visitors reach the generator and submit.
9. **Light up the Proof section** — after #1 and the fixes cycle: real Before
   cells, dated, then re-measure lift. This is when the site stops being a
   promise and starts being evidence.
10. **First outreach test** — once ONE real lift number exists: short pitch to
    5 Dallas jewelers using the live scorecard as the demo. (Draft is free;
    sending is your call.)

## My take
Tonight/tomorrow: 1 → 2 → 3. Then 4 before any deploy talk. 5–8 same day as
deploy. 9–10 are the actual business.
