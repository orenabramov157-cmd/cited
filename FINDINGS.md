# FINDINGS — debug & correctness pass

Per `CODEX-REVIEW.md`. Run overnight 2026-07-30. Nothing committed; every change
below sits uncommitted in the working tree for review via `git diff`.

**Verification (both re-run and confirmed independently after all fixes landed):**

- `npm run build` — **green** (`✓ built in 198ms`)
- `node verify.mjs` — **21/21 checks passed**

> Note on the count: `CODEX-REVIEW.md` says the harness must stay at "12/12".
> That number was already stale before this pass — the harness had grown to
> 17 real checks across the 8 feature commits since the brief was written. This
> pass added 4 new regression checks (one per fix that needed guarding), giving
> 21. `README.md`'s stale "12 checks" was corrected to 21.

| Severity | Found | Fixed |
|---|---|---|
| High | 3 | 3 |
| Medium | 2 | 2 |
| Low / notes | 5 | 3 (2 are notes, not code) |

---

## HIGH

### H1 — "The Shift" nav link silently did nothing on first click
**Files:** `src/App.tsx`, `src/components/VisibilityGap.tsx:97`

`VisibilityGap` lazy-mounts behind a `NearViewport` wrapper, which only renders
its child once the placeholder nears the viewport. But `id="problem"` lived on
`VisibilityGap`'s own `<section>` — so the anchor target **did not exist in the
DOM** until that intersection fired. Two consequences: `Nav`'s scrollspy
(`document.getElementById`, mount-once) silently dropped the section forever,
and any click on `href="#problem"` found no target at all.

**Failure scenario:** load the page, click "The Shift" in the nav (or the
hero's "The shift ↓" cue) within the first ~50ms. Nothing happens — zero
scroll, no error, no feedback. Probed across 6 viewports with a direct
Playwright script: zero scroll every time.

**Fix:** moved `id="problem"` onto the always-present `NearViewport` wrapper div
(new `id` prop). `VisibilityGap`'s own `sectionRef` — used for its scroll-linked
chart wipe — is untouched. New verify check loads fresh and clicks within
100ms: now scrolls `0 → 1029`.

### H2 — Every anchor jump hid the target heading behind the fixed nav
**File:** `src/index.css:240`

`Nav` is `position: fixed` (~65px tall) and overlays content rather than pushing
it down. No section had `scroll-margin-top` and there was no global
`scroll-padding-top`.

**Failure scenario:** click "The Team" (`#solution`). Measured directly, the
target's `getBoundingClientRect().top` settled at **0.4px** — its heading sat
underneath the header, so the section appeared to start mid-paragraph.

**Fix:** one line — `scroll-padding-top: 5rem` on `html`. Covers every current
and future anchor target globally rather than per-section. Verify check now
measures `top = 80.0px`.

### H3 — Max-length non-ASCII input could produce an unopenable `mailto:`
**File:** `src/lib/generator.ts` (`buildMailto`, was lines 139–155)

Worst case computed rather than estimated: max-length **ASCII** input yields a
3,260-char URL; max-length **emoji** input yields **22,619 chars** — far past
the ~2,000-char ceiling commonly safe across mail clients.

**Failure scenario:** a business name in Chinese, Arabic, or any multi-byte
script (not an adversarial case — a normal customer) percent-encodes to 3–4×
its length, and the "Email me this team" CTA silently fails to open a draft.

**Fix:** tiered degrade — full draft (byte-for-byte unchanged for realistic
input) → drop per-agent move text → shorten business/city **for the email only**
(the on-page result is untouched) → hard cap with dangling-percent-escape
cleanup as a tested-but-unreachable safety net. New verify check drives 200× 💎
through the real UI: `len=1464`, decodable.

---

## MEDIUM

### M1 — "ink-on-yellow" chips failed WCAG AA in dark mode
**Files:** `src/components/Proof.tsx:51`, `src/components/Solution.tsx:328`

`--yellow` is identical in both themes; `--ink` is dark in light mode but
**light** in dark mode. Measured contrast: light mode **11.30:1** (fine), dark
mode **1.34:1** (effectively unreadable). This is exactly the pairing
`CODEX-REVIEW.md` target 4 called out by name.

**Fix:** both chips now use a fixed `text-[#171717]` literal instead of the
theme-relative `text-ink`, with an explanatory comment. New verify check
measures the real rendered colors: **11.30:1** in dark mode.

### M2 — `nodejs_compat` missing for the Anthropic SDK on Workers
**File:** `wrangler.toml`

`@anthropic-ai/sdk`'s credential-chain/OAuth module statically references
`node:fs` / `node:path`; `nodejs_compat` was not set. Confirmed via
`wrangler pages dev` build warnings.

Severity was verified rather than assumed: the SDK only reaches that path when
no explicit `apiKey` is passed, and `functions/api/team.ts` always passes one —
so this was **latent, not live**. A Worker boot was emulated (no `.dev.vars`
touched) confirming the module loads and serves requests without crashing.

**Fix:** added `compatibility_flags = ["nodejs_compat"]`. Free, zero-risk.

---

## LOW / NOTES

### L1 — `verify.mjs`'s anchor checks never exercised a real click *(fixed)*
This is precisely why the harness missed H1 and H2: it did `querySelector` plus
a manual `scrollTo`, never a real `<a href>` click. 4 new checks added (17 → 21):
the two anchor bugs, the mailto length cap, and the dark-mode chip contrast.

### L2 — Three unused asset files removed *(fixed)*
`src/assets/hero.png`, `react.svg`, `vite.svg` — zero references anywhere in the
repo. Same category as the `Reveal.tsx` / `tabs.tsx` / `tooltip.tsx` files
removed in the prior pass.

### L3 — Stale documentation claims *(partly fixed)*
- README's "12 checks" → **21** (fixed).
- `CODEX-REVIEW.md`'s "`functions/api/team.ts` is NOT covered by tsc" is **no
  longer true** — `tsconfig.functions.json` is referenced from the root
  `tsconfig.json`. Verified `output_config` / `json_schema` / `refusal` are real
  typed SDK fields, not `any`-holes.
- README's "navy reserved for the generator instrument" is stale since commit
  `317a1a4` ("kill the navy slab"). `Generator.tsx`'s `NavyField` component name
  is now misleading but harmless. **Not renamed and README design copy not
  rewritten** — not a defect, and the brief forbids rewording.

### L4 — Brief's "white/60 on navy" concerns are moot *(not fixed, flagged)*
The only call sites — `primitives.tsx:34` (`Eyebrow tone="inverse"`) and
`button.tsx:27` (`Button variant="ink"`) — are both **unused today**. Left
as-is; flagging in case they should be pruned along with the other dead code.

### L5 — `GET`/`OPTIONS /api/team` return platform defaults *(not fixed)*
Cloudflare Pages' default routing returns a 200 SPA shell / empty 405 rather
than a clean 404/405. Platform behavior, not app code. Harmless.

### L6 — `HowItWorks.tsx` spotlight hover isn't reduced-motion gated *(not fixed)*
Borderline: it's cursor-driven, not autoplay. A real fix needs a design call on
what the reduced-motion state should look like, so it's noted rather than
patched.

---

## BLOCKER FOR YOUR NEXT LOCAL API TEST *(flagged, not fixed)*

The locally-resolved `wrangler` (4.98.0) **cannot start at all** against this
repo's `compatibility_date = "2026-07-01"` — it reports "newest supported:
2026-06-10". You will hit this the next time you try the local live-key flow in
`KEY-SETUP.md` (`npx wrangler pages dev dist`).

This diagnosis was confirmed by temporarily editing `compatibility_date` and
then **fully reverting it** (verified clean via `git diff`). Not changed
permanently, and no `wrangler` devDependency was added or pinned — both are your
call. Options: bump the local `wrangler`, or lower `compatibility_date`.

---

## RECOMMENDATIONS.md item 4 — Turnstile (code only)

**Backend** (`functions/api/team.ts`): `verifyTurnstile()` returns `true` when
`TURNSTILE_SECRET` is unset — i.e. today's exact behavior is preserved —
otherwise POSTs to Cloudflare's siteverify endpoint *before* the paid Anthropic
call. Failure returns 403, which the client already treats as "fall back to
stub," so the site never breaks.

**Frontend** (new `src/components/Turnstile.tsx`, wired into `Generator.tsx`):
reads `VITE_TURNSTILE_SITE_KEY`. Unset means it renders `null` and never loads
the script — confirmed, all 21 verify checks pass unmodified with no key
present.

**Manual steps deliberately left undone:** provisioning the actual Turnstile
site (the `turnstile-spin` skill does this) and setting
`VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET`. No Cloudflare API was touched
and no infrastructure was created. Flipping this on is now a config change, not
a code change.

## RECOMMENDATIONS.md item 7 — share-readiness

OG/Twitter meta tags were **already complete** in `index.html`; the favicon
already existed. Added `public/apple-touch-icon.png` (180×180, converted from
the existing `favicon.svg` with macOS's built-in `sips` — a plain format
conversion, no image-generation tool, no cost) and wired it into `index.html`.

**Not added:** `og:image` / `twitter:image` — no proper marketing share-card
image exists in the repo and producing one is a real design task. Also skipped
`og:url`, since no domain is chosen yet (RECOMMENDATIONS.md item 5).

---

## REVIEWED AND CONFIRMED CLEAN

Everything below was examined against the brief's targets and found correct — no
change needed.

- **Generator async flow** (target 2) — traced the unmount-during-fetch path
  specifically. Correct.
- **Theme system** (target 3, remainder) — FOUC-safe, private-mode-safe, single
  `useTheme()` call site. Light-as-default is stated intent, not a bug.
- **Accessibility** (target 4, remainder) — live regions present, real
  interactive elements everywhere (every `onClick` grep'd), `--faint` passes AA
  in both themes (4.66:1 light).
- **Motion** (target 6) — no layout-property animations anywhere, all
  `AnimatePresence` keys correct, `useCountUp`'s rAF cleanup correct.
- **Dead code / bundle** (target 7) — `Reveal.tsx` / `tabs.tsx` / `tooltip.tsx`
  already removed in the prior pass (confirmed via `git log`). Recharts chunk
  confirmed still lazy in every build (`VisibilityGap-*.js` ≈ 370KB, separate
  chunk).
- **Proof scorecard overflow** (target 5) — correct as-is.

---

## FILES TOUCHED (all uncommitted)

Modified: `src/App.tsx` · `src/components/VisibilityGap.tsx` · `src/index.css` ·
`src/lib/generator.ts` · `src/components/Proof.tsx` ·
`src/components/Solution.tsx` · `src/components/Generator.tsx` ·
`functions/api/team.ts` · `wrangler.toml` · `index.html` · `README.md` ·
`verify.mjs`

Added: `src/components/Turnstile.tsx` · `public/apple-touch-icon.png` · this file

Deleted: `src/assets/hero.png` · `src/assets/react.svg` · `src/assets/vite.svg`

No dependencies added. No secrets read, printed, or created. No deploy. No
commit, no push — per the standing rule that commits happen only when asked.
