# Wire the live generator (2 minutes)

The site works fully without this (client-side stub). With a key, the
generator produces genuinely tailored teams via Claude.

## 1. Drop the key (never through chat)
```bash
cp ~/cited/.dev.vars.example ~/cited/.dev.vars
open -t ~/cited/.dev.vars
```
Paste your Anthropic API key after `ANTHROPIC_API_KEY=`, save, close.
**Don't paste the key back in chat — just say "key is in."**

## 2. Test locally (costs ~1–2¢ per draft)
```bash
cd ~/cited && npm run build && npx wrangler pages dev dist
```
Open http://localhost:8788 → Try it → submit. The result line should read
**“live draft”** (API) instead of **“instant sketch”** (stub fallback).

- Model is `claude-opus-5` (best copy). For ~10x cheaper drafts, change
  `MODEL` in `functions/api/team.ts` to `claude-haiku-4-5`.
- Any API problem silently falls back to the stub — the page never breaks.

## 3. Deploy (GATED — ask Claude when ready)
```bash
npx wrangler pages deploy dist
```
Then set the secret in Cloudflare: Pages project → Settings → Variables →
add `ANTHROPIC_API_KEY` (secret). Deploying makes the site public — per the
money/outward-facing gate, this waits for an explicit go.
