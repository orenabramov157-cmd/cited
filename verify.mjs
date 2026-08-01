// Verification harness for the Cited site — screenshots + interaction checks.
// Run: node verify.mjs   (dev server must be on :4599)
//
// The site is a multi-page SPA (react-router): / /shift /team /method /proof
// /try plus /terms /privacy. Checks are grouped per route.
import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.env.VERIFY_BASE || "http://localhost:4599"
const OUT = process.env.VERIFY_OUT || "./verify-out"
fs.mkdirSync(OUT, { recursive: true })

const ROUTES = [
  ["/", "01-home"],
  ["/shift", "02-shift"],
  ["/team", "03-team"],
  ["/method", "04-method"],
  ["/proof", "05-proof"],
  ["/try", "06-try"],
]

/** Contract of the redesign: no page is a scrolling marathon. */
const MAX_PAGE_HEIGHT = 3200

const results = []
const ok = (name, pass, note = "") => {
  results.push({ name, pass, note })
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${note ? " · " + note : ""}`)
}

const browser = await chromium.launch()

// ---------- every route: renders, no errors, no overflow, stays short ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  // listeners MUST be attached before navigation or load-time errors are missed
  const errors = []
  // /api/team 404s are EXPECTED in `vite dev` (no Pages Function) — that's the
  // designed stub-fallback path, not a defect.
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

  for (const [route, name] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" })
    await page.waitForTimeout(1700) // entrances + curtain settle

    const h1 = await page.$eval("h1", (el) => el.textContent?.trim() ?? "").catch(() => "")
    ok(`${route}: headline renders`, h1.length > 0, h1.slice(0, 40))

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    ok(`${route}: no horizontal overflow`, !overflow)

    const height = await page.evaluate(() => document.body.scrollHeight)
    ok(`${route}: page stays short (< ${MAX_PAGE_HEIGHT}px)`, height < MAX_PAGE_HEIGHT, `${height}px`)

    await page.screenshot({ path: `${OUT}/${name}.png` })
    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
  }

  ok("no console/page errors across routes", errors.length === 0, errors.join(" | ").slice(0, 140))
  ok("no failed asset requests", badResponses.length === 0, badResponses.join(" | ").slice(0, 120))
  await page.close()
}

// ---------- router navigation ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(120) // deliberately early: click before things settle
  await page.click('nav a[href="/shift"]')
  await page.waitForTimeout(900)
  const path = await page.evaluate(() => window.location.pathname)
  ok("nav: 'The Shift' navigates on first click", path === "/shift", path)

  // the pager at the end of each page moves you forward without a scroll hunt
  await page.click('a[href="/team"]')
  await page.waitForTimeout(900)
  const path2 = await page.evaluate(() => window.location.pathname)
  const scroll = await page.evaluate(() => window.scrollY)
  ok("pager: advances to the next page", path2 === "/team", path2)
  ok("route change resets scroll to top", scroll < 20, `scrollY=${scroll}`)

  // deep link + reload must work (SPA fallback), not 404
  await page.goto(BASE + "/method", { waitUntil: "networkidle" })
  const methodH1 = await page.$eval("h1", (el) => el.textContent?.trim() ?? "")
  ok("deep link: /method renders on direct load", methodH1.length > 0, methodH1.slice(0, 40))
  await page.close()
}

// ---------- home: cursor-reactive field ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1200)
  const canvas = await page.evaluate(() => {
    const c = document.querySelector("header canvas")
    return c ? { w: c.width, h: c.height } : null
  })
  ok("home: pointer field canvas mounted and sized", !!canvas && canvas.w > 0 && canvas.h > 0)

  // the field must actually repaint as the pointer moves
  const shot = async () => {
    const c = await page.$("header canvas")
    return (await c.screenshot()).toString("base64")
  }
  await page.mouse.move(300, 300)
  await page.waitForTimeout(500)
  const a = await shot()
  await page.mouse.move(900, 600)
  await page.waitForTimeout(500)
  const b = await shot()
  ok("home: field reacts to pointer movement", a !== b)

  // the same ground continues on inner pages, which is what sells the illusion
  await page.goto(BASE + "/method", { waitUntil: "networkidle" })
  await page.waitForTimeout(900)
  const innerField = await page.evaluate(() => {
    const c = document.querySelector("main canvas")
    return c ? c.width > 0 && c.height > 0 : false
  })
  ok("inner pages: pointer field continues onto the page head", innerField)
  await page.close()
}

// ---------- the sideways illusion: scroll past the bottom to travel ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE + "/shift", { waitUntil: "networkidle" })
  await page.waitForTimeout(700)

  // scrolling mid-page must never be hijacked
  await page.mouse.move(640, 430)
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(300)
  const midPath = await page.evaluate(() => window.location.pathname)
  ok("scroll advance: mid-page scrolling does not navigate", midPath === "/shift", midPath)

  // land on the bottom, and the hint should name the next stop
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  await page.mouse.wheel(0, 120)
  await page.waitForTimeout(250)
  const hint = await page.evaluate(() => {
    const el = document.querySelector(".fixed.z-\\[58\\]")
    return el ? el.textContent.replace(/\s+/g, " ").trim() : null
  })
  ok("scroll advance: edge hint names the next stop", !!hint && /The Team/.test(hint), hint)

  // keep pushing and it commits, sideways, to the next page
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 160)
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(1100)
  const fwd = await page.evaluate(() => window.location.pathname)
  ok("scroll advance: commits forward to the next page", fwd === "/team", fwd)
  const top = await page.evaluate(() => window.scrollY)
  ok("scroll advance: arrives at the top of the new page", top < 20, `scrollY=${top}`)

  // and it is reversible: scroll up at the very top to walk back
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, -160)
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(1100)
  const back = await page.evaluate(() => window.location.pathname)
  ok("scroll advance: reverses back up the track", back === "/shift", back)

  // one flick must move exactly one page: the tail of a hard scroll used to
  // arrive after the lock lifted and skip a second page
  await page.goto(BASE + "/shift", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(350)
  await page.mouse.move(640, 500)
  for (let i = 0; i < 16; i++) {
    await page.mouse.wheel(0, 220)
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(1600)
  const oneStep = await page.evaluate(() => window.location.pathname)
  ok("scroll advance: one flick advances exactly one page", oneStep === "/team", oneStep)

  // the last stop must not strand you or fire into nothing
  await page.goto(BASE + "/try", { waitUntil: "networkidle" })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(300)
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(700)
  const last = await page.evaluate(() => window.location.pathname)
  ok("scroll advance: last stop stays put", last === "/try", last)
  await page.close()
}

{
  // under reduced motion the gesture is not installed at all: scrolling past
  // the bottom must leave you exactly where you were
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    reducedMotion: "reduce",
  })
  await page.goto(BASE + "/shift", { waitUntil: "networkidle" })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(250)
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 220)
    await page.waitForTimeout(50)
  }
  await page.waitForTimeout(600)
  const stayed = await page.evaluate(() => window.location.pathname)
  ok("reduced motion: scroll advance disabled", stayed === "/shift", stayed)
  await page.close()
}

// ---------- team: the deck swaps instruments instead of stacking them ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE + "/team", { waitUntil: "networkidle" })
  await page.waitForTimeout(1200)
  const rows = await page.$$eval("ol li button", (els) => els.length)
  ok("team: six levers listed", rows === 6, `got ${rows}`)

  const first = await page.textContent(".lg\\:sticky")
  await page.click("ol li:nth-child(4) button")
  await page.waitForTimeout(700)
  const fourth = await page.textContent(".lg\\:sticky")
  ok("team: selecting a lever swaps the instrument", first !== fourth)
  const pressed = await page.$$eval("ol li button[aria-pressed='true']", (els) => els.length)
  ok("team: exactly one lever is active", pressed === 1, `got ${pressed}`)
  await page.screenshot({ path: `${OUT}/03-team-lever-4.png` })
  await page.close()
}

// ---------- /try: the generator ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.goto(BASE + "/try", { waitUntil: "networkidle" })
  await page.waitForTimeout(900)

  await page.fill("#biz", "a fine jewelry store")
  await page.fill("#city", "Dallas")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/07-generator-loading.png` })
  await page.waitForTimeout(1500)
  const agents = await page.$$eval("#build ul li", (els) => els.length)
  ok("generator: 6 agents render", agents === 6, `got ${agents}`)
  const mailto = await page.$eval('#build a[href^="mailto:"]', (a) => a.getAttribute("href"))
  ok(
    "generator: mailto prefilled",
    mailto.startsWith("mailto:orenabramov157@gmail.com") && mailto.includes("Dallas")
  )
  await page.screenshot({ path: `${OUT}/08-generator-success.png` })

  // error state
  await page.fill("#biz", "")
  await page.fill("#city", "")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(350)
  ok("generator: inline error state", await page.isVisible('#build [role="alert"]'))
  await page.screenshot({ path: `${OUT}/09-generator-error.png` })

  // M3 regression: two submits in the same tick fire at most one request
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
    await page.fill("#biz", "x".repeat(400))
    const len = await page.$eval("#biz", (el) => el.value.length)
    ok("generator: input length capped", len === 120, `got ${len}`)
    await page.fill("#biz", "")
    await page.fill("#city", "")
  }

  // regression: non-ASCII max-length input must not blow up the mailto URL
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
  }

  ok("no page errors (/try pass)", errors.length === 0, errors.join(" | ").slice(0, 120))
  await page.close()
}

// ---------- accessibility + theme ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1200)

  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab")
  const focused = await page.evaluate(() => {
    const el = document.activeElement
    const cs = getComputedStyle(el)
    const hasOutline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0
    const hasRing =
      cs.boxShadow !== "none" && !/^(rgba\(0, 0, 0, 0\)[^,]*,?\s*)+$/.test(cs.boxShadow)
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
  await page.screenshot({ path: `${OUT}/10-focus-state.png` })

  // M6 regression: --faint must clear WCAG AA (4.5:1) against the canvas
  const parseLum = `
    const parse = (v) => {
      const m = v.trim().match(/^#?([0-9a-f]{6})$/i)
      if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
      const n = v.match(/\\d+/g)
      return n ? n.slice(0, 3).map(Number) : null
    }
    const lum = (c) => {
      const s = c.map((v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
    }
  `
  {
    const contrast = await page.evaluate(`(() => {
      ${parseLum}
      const cs = getComputedStyle(document.documentElement)
      const fg = parse(cs.getPropertyValue("--faint"))
      const bg = parse(getComputedStyle(document.body).backgroundColor)
      if (!fg || !bg) return null
      const [hi, lo] = lum(fg) > lum(bg) ? [lum(fg), lum(bg)] : [lum(bg), lum(fg)]
      return (hi + 0.05) / (lo + 0.05)
    })()`)
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
  const themeColor = await page.$eval('meta[name="theme-color"]', (m) => m.content)
  ok("theme-color meta follows theme", themeColor.toLowerCase() === "#10161f", themeColor)
  await page.screenshot({ path: `${OUT}/11-dim-mode-home.png` })

  // ink-on-yellow chips must stay legible in dark mode too (see FINDINGS.md)
  {
    await page.goto(BASE + "/proof", { waitUntil: "networkidle" })
    await page.waitForTimeout(1200)
    const chipContrast = await page.evaluate(`(() => {
      ${parseLum}
      const chip = document.querySelector("#proof .bg-yellow")
      if (!chip) return null
      const cs = getComputedStyle(chip)
      const fg = parse(cs.color)
      const bg = parse(cs.backgroundColor)
      if (!fg || !bg) return null
      const [hi, lo] = lum(fg) > lum(bg) ? [lum(fg), lum(bg)] : [lum(bg), lum(fg)]
      return (hi + 0.05) / (lo + 0.05)
    })()`)
    ok(
      "contrast: ink-on-yellow chip ≥ 4.5:1 (dark)",
      chipContrast !== null && chipContrast >= 4.5,
      chipContrast ? chipContrast.toFixed(2) : "unmeasured"
    )
    await page.screenshot({ path: `${OUT}/12-dim-mode-proof.png` })
  }
  await page.close()
}

// ---------- legal pages ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  for (const [path, title] of [["/terms", "Terms of Service"], ["/privacy", "Privacy Policy"]]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" })
    await page.waitForTimeout(600)
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
  const noCanvas = await page.evaluate(() => !document.querySelector("header canvas"))
  ok("reduced motion: pointer field not mounted", noCanvas)
  const noHint = await page.evaluate(
    () => !document.querySelector(".fixed.z-\\[58\\]")
  )
  ok("reduced motion: scroll-advance hint not mounted", noHint)

  await page.goto(BASE + "/try", { waitUntil: "networkidle" })
  await page.fill("#biz", "a med spa")
  await page.fill("#city", "Austin")
  await page.click('#build button[type="submit"]')
  await page.waitForTimeout(600)
  const agents = await page.$$eval("#build ul li", (els) => els.length)
  ok("reduced motion: generator still works", agents === 6, `got ${agents}`)
  await page.close()
}

// ---------- tablet + mobile ----------
for (const [w, h, label] of [[768, 1024, "tablet"], [375, 812, "mobile"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  for (const [route, name] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" })
    await page.waitForTimeout(1200)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    ok(`${label} ${route}: no horizontal overflow`, !overflow)
    await page.screenshot({ path: `${OUT}/13-${label}-${name}.png`, fullPage: true })
  }
  await page.close()
}

await browser.close()

const fails = results.filter((r) => !r.pass)
console.log(`\n${results.length - fails.length}/${results.length} checks passed`)
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
process.exit(fails.length ? 1 : 0)
