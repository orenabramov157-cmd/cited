# Security

The site is static except for one endpoint, `POST /api/team`, and that endpoint
is the only thing here that costs money when someone uses it. Everything below
is organised around that fact.

## What is already done, in code

| Layer | Where | Effect |
| --- | --- | --- |
| Rate limit, 10 requests per minute per IP | `wrangler.toml` binding + `functions/api/team.ts` | Checked before anything is parsed, so a flood is refused at close to zero cost. Counts per Cloudflare location, not globally. |
| Cheaper model | `functions/api/team.ts` | `claude-haiku-4-5` instead of `claude-opus-5`. Roughly eighteen times less per call for output nobody can tell apart in this context. |
| JSON-only, 4KB body cap | `functions/api/team.ts` | A cross-origin form post cannot reach the paid call. |
| Turnstile check | `functions/api/team.ts`, `src/components/Turnstile.tsx` | Fully implemented. Dormant until the two values below are set, then active with no code change. |
| Untrusted input handling | `functions/api/team.ts` | Business and city are bounded, control characters stripped, and passed as JSON data with an explicit instruction to the model that they are never instructions. |
| Security headers and content policy | `public/_headers` | Framing denied, sniffing off, HSTS, and a policy that permits no third-party origin except the Turnstile widget. |
| Response caching | `public/_headers` | Generator responses are `no-store`; hashed assets are immutable. |

The Anthropic key is read from `env.ANTHROPIC_API_KEY` and never reaches the
browser. `.dev.vars` is gitignored and has never been committed.

## What has to be done in a dashboard, by a human

These cannot live in the repo. Nothing should be deployed publicly until the
first one is done.

1. **Spend cap on the Anthropic key.** console.anthropic.com, Settings,
   Spending, set a monthly limit. This is the backstop behind every other
   layer: whatever else fails, the bill stops here.
2. **Turnstile.** Cloudflare dashboard, Turnstile, create a widget for the
   site. Put the site key in the Pages build environment as
   `VITE_TURNSTILE_SITE_KEY`, and the secret in Pages secrets as
   `TURNSTILE_SECRET`. The code activates itself once both exist.
3. **WAF rate limiting rule** (optional, and only once a custom domain is
   attached). The Workers binding above limits per location; a WAF rule limits
   across the whole zone and so also covers a distributed flood. The free plan
   includes one rule.

## Deliberately not done, and why

- **Turnstile on the demo form.** That form builds a `mailto:` link in the
  browser and posts to nothing. There is no server endpoint to protect, so a
  challenge would add friction and buy nothing.
- **Upgrading `react-router` past the current advisory.** The advisory
  (GHSA-qwww-vcr4-c8h2) applies to React Server Components mode. This is a
  client-rendered SPA with no server components, so the vulnerable path does
  not exist here. Worth doing at leisure, not worth a rushed major upgrade.
- **Hiding the contact email.** It is published in the terms and the privacy
  policy because it has to be. It is a business contact, not a leak. Replacing
  it with an address on a real domain is a branding job, not a security one.

## The thing people usually mean by "can they edit our code"

They cannot. Everything the browser downloads is a copy: a visitor can change
their own copy, in their own browser, and it affects nothing but their own
screen. That is true of every website. What matters is that nothing the browser
sends is trusted on the way back, and it is not: the endpoint re-validates
types, lengths and structure server-side and ignores anything the client claims
about itself.
