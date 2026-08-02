import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type Dot = { x: number; y: number; ox: number; oy: number; vx: number; vy: number }

/**
 * The signature surface: a grid of editorial tick-marks that gets pushed
 * around by the cursor and springs back, with a slow ambient breath so the
 * field is never fully dead. Canvas, one rAF loop, paused when off-screen.
 *
 * Colours are read from the CSS tokens at runtime, so it follows the theme
 * (and stays inside the locked palette) with no hardcoded hexes.
 */
export function PointerField({
  className,
  gap = 34,
  radius = 168,
  push = 26,
  fade = 0.55,
}: {
  className?: string
  /** grid spacing in px */
  gap?: number
  /** cursor influence radius in px */
  radius?: number
  /** max displacement in px */
  push?: number
  /** peak opacity of the layer */
  fade?: number
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dots: Dot[] = []
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999, has: false }

    const styles = () => {
      const cs = getComputedStyle(document.documentElement)
      return {
        base: cs.getPropertyValue("--muted-foreground").trim() || "#5f6368",
        hot: cs.getPropertyValue("--blue").trim() || "#0057b8",
      }
    }
    let color = styles()

    const build = () => {
      const r = wrap.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots = []
      const cols = Math.ceil(w / gap) + 1
      const rows = Math.ceil(h / gap) + 1
      const offX = (w - (cols - 1) * gap) / 2
      const offY = (h - (rows - 1) * gap) / 2
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * gap
          const y = offY + j * gap
          dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 })
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.has = true
    }
    const onLeave = () => {
      pointer.has = false
      pointer.x = -9999
      pointer.y = -9999
    }

    let t = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      // during a page handoff every frame belongs to the transition, not
      // the ambience; the class is set by ScrollAdvance for the duration
      if (document.documentElement.classList.contains("is-handoff")) return
      t += 0.006
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        // ambient breath: a lazy diagonal wave so the grid is alive at rest
        const waveX = Math.sin(t + d.ox * 0.012) * 1.7
        const waveY = Math.cos(t * 0.9 + d.oy * 0.014) * 1.7

        let tx = d.ox + waveX
        let ty = d.oy + waveY
        let heat = 0

        if (pointer.has) {
          const dx = d.ox - pointer.x
          const dy = d.oy - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < radius) {
            const force = (1 - dist / radius) ** 2
            heat = force
            const ang = Math.atan2(dy, dx)
            tx += Math.cos(ang) * force * push
            ty += Math.sin(ang) * force * push
          }
        }

        // critically damped spring toward the target
        d.vx += (tx - d.x) * 0.14
        d.vy += (ty - d.y) * 0.14
        d.vx *= 0.78
        d.vy *= 0.78
        d.x += d.vx
        d.y += d.vy

        const size = 2 + heat * 2.6
        ctx.globalAlpha = (0.2 + heat * 0.8) * fade
        ctx.fillStyle = heat > 0.06 ? color.hot : color.base
        ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }

    build()
    color = styles()

    const ro = new ResizeObserver(build)
    ro.observe(wrap)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { rootMargin: "120px" }
    )
    io.observe(wrap)
    // theme flips swap the tokens: re-read them when data-theme changes
    const mo = new MutationObserver(() => {
      color = styles()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
    }
  }, [reduce, gap, radius, push, fade])

  // Under prefers-reduced-motion the field is not just static, it is absent:
  // an unpainted canvas is dead weight.
  if (reduce) return null

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
