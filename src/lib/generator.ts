/**
 * The team generator. `fetchTeam` tries the live Claude endpoint
 * (/api/team — functions/api/team.ts) and falls back to the client-side
 * stub whenever the API is absent, slow, or errors — so the site works
 * with zero backend and upgrades itself when the key is present.
 */

export const CONTACT_EMAIL = "orenabramov157@gmail.com"

export type Agent = { name: string; move: string }
export type TeamResult = { agents: Agent[]; source: "live" | "stub" }

/** Exactly six agents is the product contract — enforced here and server-side. */
export const TEAM_SIZE = 6

/** Input bounds. Code-point aware; mirrored in functions/api/team.ts. */
export const MAX_BUSINESS = 120
export const MAX_CITY = 80

/** Lose the race to the server's 9s deadline so its error path wins. */
const CLIENT_TIMEOUT_MS = 12_000

/** Trim to `max` code points (never splits a surrogate pair). */
export function clampInput(value: string, max: number): string {
  return [...value.trim()].slice(0, max).join("")
}

/** Six distinct, non-empty agents — or null. Mirrors the server contract. */
function validateTeam(raw: unknown): Agent[] | null {
  if (!raw || typeof raw !== "object") return null
  const list = (raw as { agents?: unknown }).agents
  if (!Array.isArray(list) || list.length !== TEAM_SIZE) return null

  const seen = new Set<string>()
  const agents: Agent[] = []
  for (const item of list) {
    if (!item || typeof item !== "object") return null
    const { name, move } = item as Agent
    if (typeof name !== "string" || typeof move !== "string") return null
    const n = name.trim()
    const m = move.trim()
    if (!n || !m) return null
    const key = n.toLowerCase()
    if (seen.has(key)) return null
    seen.add(key)
    agents.push({ name: n, move: m })
  }
  return agents
}

export async function fetchTeam(
  biz: string,
  city: string,
  signal?: AbortSignal,
  turnstileToken?: string | null
): Promise<TeamResult> {
  const b = clampInput(biz, MAX_BUSINESS)
  const c = clampInput(city, MAX_CITY)

  const ctrl = new AbortController()
  const abortOuter = () => ctrl.abort()
  signal?.addEventListener("abort", abortOuter, { once: true })
  const timer = setTimeout(() => ctrl.abort(), CLIENT_TIMEOUT_MS)

  try {
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        business: b,
        city: c,
        // omitted entirely while Turnstile is unconfigured (token stays null)
        ...(turnstileToken ? { turnstileToken } : {}),
      }),
      signal: ctrl.signal,
    })
    if (res.ok) {
      const agents = validateTeam(await res.json())
      if (agents) return { agents, source: "live" }
    }
  } catch {
    // network error, timeout, or caller cancellation → stub
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener("abort", abortOuter)
  }
  return { agents: buildTeam(b, c), source: "stub" }
}

/** crude singular-ish noun for nicer copy ("a fine jewelry store" -> "jewelry store") */
function strip(s: string): string {
  return (
    s
      .replace(/^\s*(a|an|the)\s+/i, "")
      .replace(/\bstores?\b/i, "store")
      .trim() || s.trim()
  )
}

export function buildTeam(biz: string, city: string): Agent[] {
  const b = clampInput(biz, MAX_BUSINESS)
  const c = clampInput(city, MAX_CITY)
  const a = /^[aeiou]/i.test(b) ? "an" : "a"
  return [
    {
      name: "The Citation Hunter",
      move: `Land ${b} on the “best ${strip(b)} in ${c}” lists and directories ChatGPT & Perplexity pull their answers from.`,
    },
    {
      name: "The Schema Architect",
      move: `Mark up your site so AI can cleanly read that ${b} is ${a} real ${strip(b)} in ${c} — hours, offers, reviews and all.`,
    },
    {
      name: "The Review Engine",
      move: `Push ${b} past the rating bar AI checks (ChatGPT favors ~4.3★+) and keep the reviews fresh, spread and recent.`,
    },
    {
      name: "The Listicle Infiltrator",
      move: `Pitch ${b} into ${c} “best of” roundups and local press, so you land in the AI's answer — not buried in its index.`,
    },
    {
      name: "The Entity Aligner",
      move: `Make ${b}'s name, address and identity identical across every profile, so AI trusts you're one established place in ${c}.`,
    },
    {
      name: "The Answer-Page Writer",
      move: `Write pages answering the exact questions ${c} buyers ask AI about ${strip(b)}s — so you become the source it quotes back.`,
    },
  ]
}

/** Strip lone surrogates so encodeURIComponent can't throw on pasted junk. */
function safeEncode(s: string): string {
  return encodeURIComponent(s.replace(/[\uD800-\uDFFF]/g, (ch, i, str) => {
    const code = ch.charCodeAt(0)
    const isHigh = code <= 0xdbff
    const partner = isHigh ? str.charCodeAt(i + 1) : str.charCodeAt(i - 1)
    const paired = isHigh
      ? partner >= 0xdc00 && partner <= 0xdfff
      : partner >= 0xd800 && partner <= 0xdbff
    return paired ? ch : "�"
  }))
}

/**
 * Mail clients commonly reject or silently truncate mailto: URLs above
 * ~2000 characters. Business/city can be up to MAX_BUSINESS/MAX_CITY code
 * points each and appear several times in the drafted email; non-ASCII
 * characters (emoji, CJK, etc.) can expand to 9-12+ characters once
 * percent-encoded, so a maxed-out non-ASCII name can blow well past that
 * limit even though the on-page input looks perfectly reasonable. Degrade
 * in tiers instead of shipping a link that silently fails to open.
 */
const MAX_MAILTO_URL = 1800
/** Last-resort business/city length for the email only — the on-page
 *  result and the input fields themselves are never touched by this. */
const MAILTO_FALLBACK_LEN = 20

function draftMailto(b: string, c: string, team: Agent[], withMove: boolean): string {
  const subject = safeEncode(`I want this AI visibility team — ${b} (${c})`)
  const head = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=`
  const bodyLines = [
    `Hi — I want to get ${b} recommended by AI in ${c}.`,
    "",
    "Here's the team the site sketched for me:",
    "",
    ...team.map((t, i) => (withMove ? `${i + 1}. ${t.name} — ${t.move}` : `${i + 1}. ${t.name}`)),
    "",
    "Can we talk about what this would look like?",
  ]
  return head + safeEncode(bodyLines.join("\n"))
}

export function buildMailto(biz: string, city: string, team: Agent[]): string {
  const b = clampInput(biz, MAX_BUSINESS)
  const c = clampInput(city, MAX_CITY)

  // Tier 1: full draft (today's behavior). Tier 2: drop the per-agent
  // move text, which is the biggest single contributor to length.
  for (const withMove of [true, false]) {
    const url = draftMailto(b, c, team, withMove)
    if (url.length <= MAX_MAILTO_URL) return url
  }

  // Tier 3: only reachable with extreme non-ASCII business/city names —
  // shorten them for the email itself (on-page result is untouched).
  // Still personalized, and guaranteed small regardless of script.
  const bShort = clampInput(b, MAILTO_FALLBACK_LEN)
  const cShort = clampInput(c, MAILTO_FALLBACK_LEN)
  const shortUrl = draftMailto(bShort, cShort, team, false)
  if (shortUrl.length <= MAX_MAILTO_URL) return shortUrl

  // Belt-and-suspenders: should be unreachable given tier 3's bound, but
  // never ship a link past the limit. Drop any percent-escape left
  // dangling at the cut point so the URL always stays well-formed.
  return shortUrl.slice(0, MAX_MAILTO_URL).replace(/%[0-9A-Fa-f]?$/, "")
}
