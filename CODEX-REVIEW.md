# Debug & code-review brief (for Codex)

You are doing a deep debugging and correctness review of this repo — a small
production-bound marketing site. Read `README.md` first for stack and intent.
Your job is to find and fix real defects, not to redesign.

## Setup & commands

```bash
npm ci
npm run build                              # must stay green (tsc -b + vite)
npm run dev -- --port 4599 --strictPort    # dev server for the harness
npx playwright install chromium
node verify.mjs                            # 12-check harness, must stay 12/12
```

## Review targets, ranked

1. **`functions/api/team.ts` (Cloudflare Pages Function)** — request handling
   and hardening: malformed/oversized bodies, header assumptions, error paths,
   information leaks in responses, prompt-injection surface (user input must
   stay data), abuse potential (no rate limiting exists yet — flag what's
   needed pre-deploy), Anthropic SDK usage correctness on the Workers runtime
   (this file is NOT covered by tsc — check it extra carefully).
2. **`src/components/Generator.tsx` + `src/lib/generator.ts`** — the async
   submit flow: race conditions, stale closures, double-submit, unmount
   during fetch, AbortController correctness, the run-guard logic, state
   machine transitions (idle/generating/success/error), fallback behavior.
3. **Theme system** (`index.html` boot script, `src/hooks/useTheme.ts`,
   `src/index.css` tokens) — FOUC, localStorage exceptions (private mode),
   `data-theme` vs `prefers-color-scheme` precedence, dim-mode contrast of
   every token pair actually used (esp. yellow highlight, faint text, navy
   section fixed hex values).
4. **Accessibility** — labels, aria-live regions on generator states, focus
   order and visibility, WCAG contrast (muted/faint text on panel and canvas;
   ink-on-yellow chips; white/60 on navy), keyboard-only operation of the
   whole page.
5. **Responsive/overflow** — Proof scorecard (`min-w` + `overflow-x-auto`)
   on small screens, hero's `lg:translate-y` audit-card overlap at
   1024–1280px widths, very long business/city input in results and in the
   `mailto:` URL (length limits, encoding).
6. **Motion** — `prefers-reduced-motion` completeness, AnimatePresence keys,
   anything animating layout properties that could be transforms, the
   count-up hook's rAF cleanup.
7. **Dead code & bundle** — suspected unused: `src/components/Reveal.tsx`,
   `src/components/ui/tabs.tsx`, possibly `ui/tooltip.tsx` beyond the
   provider; confirm and remove if truly dead. Check the Recharts chunk stays
   lazy and nothing pulls it into the main bundle.
8. **`verify.mjs`** — flakiness, selector brittleness, and add checks you
   think are missing (cheap ones only).

## Hard constraints

- Do NOT redesign: the visual system (palette, type, layout, copy) is locked.
  Typos are fair game; rewording is not.
- Do NOT deploy anything or add analytics/telemetry.
- Do NOT add dependencies unless a real defect requires one — justify it.
- Never commit secrets; `.dev.vars` stays gitignored. Don't create it.
- Preserve the behavior contract in README (stub fallback, honest Proof
  cells, reduced-motion support).

## Deliverable

1. `FINDINGS.md` at repo root: every issue found, ranked by severity, each
   with file:line, the failure scenario (concrete input/state → wrong
   outcome), and the minimal fix. Include issues you chose not to fix.
2. Apply the safe fixes in small, single-purpose commits with clear messages.
3. After fixes: `npm run build` green and `node verify.mjs` 12/12 (note both
   results in FINDINGS.md).
