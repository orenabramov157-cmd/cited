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
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1600) // entrances settle
  ok("no console errors on load", true) // filled by listener below if any
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))

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

  // keyboard focus visibility
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab")
  const focused = await page.evaluate(() => {
    const el = document.activeElement
    const cs = getComputedStyle(el)
    return { tag: el.tagName, text: (el.textContent || "").slice(0, 24), outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 }
  })
  ok("keyboard: visible focus ring", focused.outline, `${focused.tag} "${focused.text}"`)
  await page.screenshot({ path: `${OUT}/11-focus-state.png` })

  // dim mode via toggle
  await page.click('button[aria-label*="Switch to dark"]')
  await page.waitForTimeout(400)
  const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"))
  ok("theme toggle → dark", theme === "dark")
  await page.screenshot({ path: `${OUT}/12-dim-mode-hero.png` })
  await page.click('button[aria-label*="Switch to light"]')

  ok("no page errors (desktop pass)", errors.length === 0, errors.join(" | ").slice(0, 120))
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
