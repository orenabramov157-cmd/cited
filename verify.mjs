// Verification harness for the Cited redesign — screenshots + interaction checks.
// Run: node verify.mjs   (dev server must be on :4599)
import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.env.VERIFY_BASE || "http://localhost:4599"
const OUT = process.env.VERIFY_OUT || "./verify-out"
fs.mkdirSync(OUT, { recursive: true })

const results = []
const ok = (name, pass, note = "") => {
  results.push({ name, pass, note })
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${note ? " · " + note : ""}`)
}

const browser = await chromium.launch()

// ---------- desktop full page ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  // listeners MUST be attached before navigation or load-time errors are missed
  const errors = []
  // /api/team 404s are EXPECTED in `vite dev` (no Pages Function) — that's the
  // designed stub-fallback path, not a defect. Everything else counts.
  // Network failures are caught precisely by the `response` listener below
  // (by URL), so ignore generic resource-load console noise here and let this
  // listener do what it's good at: real JS errors.
  const expected = (t) => /Failed to load resource/.test(t) || /\/api\/team/.test(t)
  page.on("pageerror", (e) => errors.push(String(e)))
  page.on("console", (m) => {
    if (m.type() === "error" && !expected(m.text())) errors.push(m.text())
  })
  const badResponses = []
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/api/team")) {
      badResponses.push(`${r.status()} ${r.url()}`)
    }
  })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1600) // entrances settle
  ok("no console/page errors on load", errors.length === 0, errors.join(" | ").slice(0, 140))

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  ok("desktop: no horizontal overflow", !overflow)

  await page.screenshot({ path: `${OUT}/01-desktop-hero.png` })
  for (const [anchor, name] of [
    ["#problem", "02-desktop-shift"],
    ["#solution", "03-desktop-team"],
    ["#how", "04-desktop-method"],
    ["#proof", "04b-desktop-proof"],
    ["#build", "05-desktop-instrument"],
    ["#start", "06-desktop-close"],
  ]) {
    await page.evaluate((a) => {
      const el = document.querySelector(a)
      const y = el.getBoundingClientRect().top + window.scrollY - 64
      window.scrollTo({ top: y, behavior: "instant" })
    }, anchor)
    await page.waitForTimeout(900) // in-view reveals + chart draw
    await page.screenshot({ path: `${OUT}/${name}.png` })
  }
  await page.screenshot({ path: `${OUT}/07-desktop-full.png`, fullPage: true })

  // generator interaction — real keystrokes
  await page.evaluate(() => {
    const el = document.querySelector("#build")
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "instant" })
  })
  await page.fill("#biz", "a fine jewelry store")
  await page.fill("#city", "Dallas")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/08-generator-loading.png` })
  await page.waitForTimeout(1500)
  const agents = await page.$$eval("#build ul li", (els) => els.length)
  ok("generator: 6 agents render", agents === 6, `got ${agents}`)
  const mailto = await page.$eval('#build a[href^="mailto:"]', (a) => a.getAttribute("href"))
  ok(
    "generator: mailto prefilled",
    mailto.startsWith("mailto:orenabramov157@gmail.com") && mailto.includes("Dallas")
  )
  await page.screenshot({ path: `${OUT}/09-generator-success.png` })

  // error state
  await page.fill("#biz", "")
  await page.fill("#city", "")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(350)
  const alertVisible = await page.isVisible('#build [role="alert"]')
  ok("generator: inline error state", alertVisible)
  await page.screenshot({ path: `${OUT}/10-generator-error.png` })

  // M3 regression: two submits in the same tick must fire at most one request
  {
    let apiCalls = 0
    await page.route("**/api/team", async (route) => {
      apiCalls++
      await route.fulfill({ status: 502, body: '{"error":"api_error"}' })
    })
    await page.fill("#biz", "a med spa")
    await page.fill("#city", "Austin")
    await page.evaluate(() => {
      const f = document.querySelector("#build form")
      f.requestSubmit()
      f.requestSubmit() // same tick — the sync lock must swallow this one
    })
    await page.waitForTimeout(1800)
    ok("generator: double-submit fires one request", apiCalls <= 1, `${apiCalls} call(s)`)
    await page.unroute("**/api/team")
  }

  // M4 regression: native maxLength caps input length
  {
    const long = "x".repeat(400)
    await page.fill("#biz", long)
    const len = await page.$eval("#biz", (el) => el.value.length)
    ok("generator: input length capped", len === 120, `got ${len}`)
    await page.fill("#biz", "")
    await page.fill("#city", "")
  }

  // regression: non-ASCII max-length business/city must not blow the
  // mailto: URL past what mail clients accept (see FINDINGS.md — a
  // maxed-out emoji/CJK name can expand hugely once percent-encoded)
  {
    await page.fill("#biz", "\u{1F48E}".repeat(200))
    await page.fill("#city", "\u{1F48E}".repeat(200))
    await page.click('#build button[type="submit"]')
    await page.waitForTimeout(1800)
    const href = await page.$eval('#build a[href^="mailto:"]', (a) => a.getAttribute("href"))
    const decodable = (() => {
      try {
        decodeURIComponent(href.split("body=")[1] ?? "")
        return true
      } catch {
        return false
      }
    })()
    ok(
      "generator: mailto stays within safe length on heavy non-ASCII input",
      href.length <= 2000 && decodable,
      `len=${href.length} decodable=${decodable}`
    )
    await page.fill("#biz", "")
    await page.fill("#city", "")
  }

  // keyboard focus visibility
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab")
  const focused = await page.evaluate(() => {
    const el = document.activeElement
    const cs = getComputedStyle(el)
    // a focus indicator counts if it's an outline OR a non-transparent ring
    const hasOutline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0
    const hasRing = cs.boxShadow !== "none" && !/^(rgba\(0, 0, 0, 0\)[^,]*,?\s*)+$/.test(cs.boxShadow)
    return {
      tag: el.tagName,
      text: (el.textContent || "").trim().slice(0, 24),
      visible: hasOutline || hasRing,
      how: hasOutline ? "outline" : hasRing ? "ring" : "none",
    }
  })
  ok(
    "keyboard: visible focus indicator",
    focused.visible,
    `${focused.tag} "${focused.text}" via ${focused.how}`
  )
  await page.screenshot({ path: `${OUT}/11-focus-state.png` })

  // M6 regression: --faint must clear WCAG AA (4.5:1) against the canvas
  {
    const contrast = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement)
      const parse = (v) => {
        const m = v.trim().match(/^#?([0-9a-f]{6})$/i)
        if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
        const n = v.match(/\d+/g)
        return n ? n.slice(0, 3).map(Number) : null
      }
      const lum = (c) => {
        const s = c.map((v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
      }
      const fg = parse(cs.getPropertyValue("--faint"))
      const bg = parse(getComputedStyle(document.body).backgroundColor)
      if (!fg || !bg) return null
      const [hi, lo] = lum(fg) > lum(bg) ? [lum(fg), lum(bg)] : [lum(bg), lum(fg)]
      return (hi + 0.05) / (lo + 0.05)
    })
    ok(
      "contrast: --faint ≥ 4.5:1 (light)",
      contrast !== null && contrast >= 4.5,
      contrast ? contrast.toFixed(2) : "unmeasured"
    )
  }

  // dim mode via toggle
  await page.click('button[aria-label*="Switch to dark"]')
  await page.waitForTimeout(400)
  const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"))
  ok("theme toggle → dark", theme === "dark")
  // L4 regression: mobile browser chrome follows the theme
  const themeColor = await page.$eval('meta[name="theme-color"]', (m) => m.content)
  ok("theme-color meta follows theme", themeColor.toLowerCase() === "#10161f", themeColor)
  await page.screenshot({ path: `${OUT}/12-dim-mode-hero.png` })

  // regression: ink-on-yellow chips must stay legible in dark mode too.
  // --yellow doesn't change between themes but --ink used to, which
  // dropped this pairing to ~1.3:1 (see FINDINGS.md).
  {
    const chipContrast = await page.evaluate(() => {
      const chip = document.querySelector("#proof .bg-yellow")
      if (!chip) return null
      const cs = getComputedStyle(chip)
      const parse = (v) => {
        const n = v.match(/\d+/g)
        return n ? n.slice(0, 3).map(Number) : null
      }
      const lum = (c) => {
        const s = c.map((v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
      }
      const fg = parse(cs.color)
      const bg = parse(cs.backgroundColor)
      if (!fg || !bg) return null
      const [hi, lo] = lum(fg) > lum(bg) ? [lum(fg), lum(bg)] : [lum(bg), lum(fg)]
      return (hi + 0.05) / (lo + 0.05)
    })
    ok(
      "contrast: ink-on-yellow chip ≥ 4.5:1 (dark)",
      chipContrast !== null && chipContrast >= 4.5,
      chipContrast ? chipContrast.toFixed(2) : "unmeasured"
    )
  }

  await page.click('button[aria-label*="Switch to light"]')

  ok("no page errors (desktop pass)", errors.length === 0, errors.join(" | ").slice(0, 120))
  ok(
    "no failed asset requests",
    badResponses.length === 0,
    badResponses.join(" | ").slice(0, 120)
  )
  await page.close()
}

// ---------- regression: nav link to lazy-mounted content must work on the
// first click, before the target has necessarily finished lazy-mounting
// (see FINDINGS.md) ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  // deliberately minimal wait — the point is to click before things settle
  await page.waitForTimeout(100)
  const before = await page.evaluate(() => window.scrollY)
  await page.click('nav a[href="#problem"]')
  await page.waitForTimeout(700)
  const after = await page.evaluate(() => window.scrollY)
  ok("nav: 'The Shift' link navigates on first click", after !== before, `${before} -> ${after}`)

  // regression: the fixed header must not cover the section it jumped to
  const top = await page.evaluate(
    () => document.querySelector("#problem")?.getBoundingClientRect().top
  )
  ok(
    "anchor: target not hidden under fixed nav",
    typeof top === "number" && top >= 60,
    `top=${top}`
  )
  await page.close()
}

// ---------- legal pages (/terms, /privacy) ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  for (const [path, title] of [["/terms", "Terms of Service"], ["/privacy", "Privacy Policy"]]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" })
    const h1 = await page.$eval("h1", (el) => el.textContent?.trim() ?? "").catch(() => "")
    const back = await page.isVisible('a[href="/"]')
    ok(`legal: ${path} renders with back link`, h1 === title && back, `h1="${h1}"`)
  }
  await page.close()
}

// ---------- reduced motion ----------
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    reducedMotion: "reduce",
  })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  const heroVisible = await page.evaluate(() => {
    const h1 = document.querySelector("h1")
    return h1 && getComputedStyle(h1).opacity === "1"
  })
  ok("reduced motion: content immediately visible", !!heroVisible)
  // generator skips the fake wait mostly
  await page.fill("#biz", "a med spa")
  await page.fill("#city", "Austin")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(500)
  const agents = await page.$$eval("#build ul li", (els) => els.length)
  ok("reduced motion: generator still works", agents === 6)
  await page.close()
}

// ---------- tablet + mobile ----------
for (const [w, h, label] of [[768, 1024, "tablet"], [375, 812, "mobile"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1400)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  ok(`${label}: no horizontal overflow`, !overflow)
  await page.screenshot({ path: `${OUT}/13-${label}-hero.png` })
  await page.screenshot({ path: `${OUT}/14-${label}-full.png`, fullPage: true })
  await page.close()
}

await browser.close()

const fails = results.filter((r) => !r.pass)
console.log(`\n${results.length - fails.length}/${results.length} checks passed`)
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
