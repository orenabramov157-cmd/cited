/**
 * The team generator. `fetchTeam` tries the live Claude endpoint
 * (/api/team — functions/api/team.ts) and falls back to the client-side
 * stub whenever the API is absent, slow, or errors — so the site works
 * with zero backend and upgrades itself when the key is present.
 */

export const CONTACT_EMAIL = "orenabramov157@gmail.com"

export type Agent = { name: string; move: string }
export type TeamResult = { agents: Agent[]; source: "live" | "stub" }

export async function fetchTeam(biz: string, city: string): Promise<TeamResult> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ business: biz, city }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = (await res.json()) as { agents?: unknown }
      if (
        Array.isArray(data.agents) &&
        data.agents.length >= 4 &&
        data.agents.every(
          (a): a is Agent =>
            !!a &&
            typeof (a as Agent).name === "string" &&
            typeof (a as Agent).move === "string"
        )
      ) {
        return { agents: data.agents.slice(0, 6), source: "live" }
      }
    }
  } catch {
    // fall through to the stub
  }
  return { agents: buildTeam(biz, city), source: "stub" }
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
  const b = biz.trim()
  const c = city.trim()
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

export function buildMailto(biz: string, city: string, team: Agent[]): string {
  const subject = encodeURIComponent(
    `I want this AI visibility team — ${biz} (${city})`
  )
  const bodyLines = [
    `Hi — I want to get ${biz} recommended by AI in ${city}.`,
    "",
    "Here's the team the site sketched for me:",
    "",
    ...team.map((t, i) => `${i + 1}. ${t.name} — ${t.move}`),
    "",
    "Can we talk about what this would look like?",
  ]
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(
    bodyLines.join("\n")
  )}`
}
