import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { nextStop, prevStop, trackIndex, TRACK } from "@/lib/route-order"

/** How much extra scroll intent past the edge commits to the next page. */
const THRESHOLD = 340
/** Wheel deltas in "lines" need converting to something px-shaped. */
const LINE_HEIGHT = 16
/** No wheel/touch for this long and the lean relaxes back to rest. */
const IDLE_MS = 160
/** Input is swallowed for the length of the handoff, plus a beat to settle. */
const LOCK_MS = 700

type Ctx = {
  /** Signed lean, -1 (pulling back at the top) to 1 (pulling forward at the bottom). */
  pull: MotionValue<number>
  /** Which edge the gesture is currently working, if any. */
  edge: "top" | "bottom" | null
  /** Set while the slide to another page is in flight. */
  committing: boolean
}

const ScrollAdvanceContext = createContext<Ctx | null>(null)

export function useScrollAdvance() {
  return useContext(ScrollAdvanceContext)
}

/**
 * The sideways illusion.
 *
 * Scrolling is never interrupted mid-page. But once a page has nothing left
 * underneath it, further downward intent stops being scroll and starts being
 * travel: the page leans, resists, and then hands off sideways to the next
 * stop on the track. Scroll up at the very top and you walk back the same way.
 *
 * Deliberately reversible and never a trap: the pager links, the nav, the
 * keyboard and the back button all still work, and under
 * `prefers-reduced-motion` the gesture is not installed at all.
 */
export function ScrollAdvance({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const pull = useMotionValue(0)
  const [edge, setEdge] = useState<"top" | "bottom" | null>(null)
  const [committing, setCommitting] = useState(false)

  const acc = useRef(0)
  const idle = useRef<number | undefined>(undefined)
  const locked = useRef(false)
  const firstRender = useRef(true)

  const next = nextStop(pathname)
  const prev = prevStop(pathname)

  /**
   * A fresh page starts at rest, and stays locked for the length of the slide.
   * Without that lock, leftover flick momentum would scroll the new page down
   * before you have even seen the top of it, or fire straight through to the
   * page after.
   */
  useEffect(() => {
    acc.current = 0
    pull.set(0)
    setEdge(null)
    if (firstRender.current) {
      // a cold load is not a handoff: never swallow the first scroll
      firstRender.current = false
      locked.current = false
      return
    }
    locked.current = true
    const t = window.setTimeout(() => {
      locked.current = false
      setCommitting(false)
    }, LOCK_MS)
    return () => window.clearTimeout(t)
  }, [pathname, pull])

  /**
   * Release the lean without dismissing the sign. Standing at the bottom of a
   * page is itself information — "there is more, and it is that way" — so the
   * hint stays while you are at the edge and only the pull goes back to rest.
   */
  const relax = useCallback(() => {
    acc.current = 0
    pull.set(0)
  }, [pull])

  const commit = useCallback(
    (to: string) => {
      if (locked.current) return
      locked.current = true
      setCommitting(true)
      acc.current = 0
      pull.set(0)
      setEdge(null)
      navigate(to)
    },
    [navigate, pull]
  )

  useEffect(() => {
    if (reduce) return
    if (trackIndex(pathname) < 0) return

    const atBottom = () => {
      const doc = document.documentElement
      return window.innerHeight + window.scrollY >= doc.scrollHeight - 2
    }
    const atTop = () => window.scrollY <= 1

    /** Feed signed intent (px) into the accumulator; returns true if consumed. */
    const feed = (dy: number): boolean => {
      if (locked.current) return false

      let side: "top" | "bottom" | null = null
      if (dy > 0 && next && atBottom()) side = "bottom"
      else if (dy < 0 && prev && atTop()) side = "top"

      if (!side) {
        if (acc.current !== 0) relax()
        return false
      }

      // reversing direction at an edge cancels rather than fights
      if (acc.current !== 0 && Math.sign(acc.current) !== Math.sign(dy)) acc.current = 0

      acc.current += dy
      const clamped = Math.max(-THRESHOLD * 1.1, Math.min(THRESHOLD * 1.1, acc.current))
      acc.current = clamped
      setEdge(side)
      pull.set(clamped / THRESHOLD)

      if (Math.abs(clamped) >= THRESHOLD) {
        const target = side === "bottom" ? next : prev
        if (target) commit(target.to)
      }
      return true
    }

    const scheduleRelax = () => {
      window.clearTimeout(idle.current)
      idle.current = window.setTimeout(() => {
        if (!locked.current && acc.current !== 0) relax()
      }, IDLE_MS)
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch zoom, not travel
      if (locked.current) {
        // mid-handoff: absorb the tail of the flick instead of acting on it
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: "auto" })
        return
      }
      const dy = e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT : e.deltaY
      if (feed(dy)) e.preventDefault()
      scheduleRelax()
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (locked.current) {
        e.preventDefault()
        return
      }
      const y = e.touches[0]?.clientY
      if (y == null || touchY == null) return
      const dy = (touchY - y) * 1.5 // finger travel is smaller than wheel travel
      touchY = y
      if (feed(dy)) e.preventDefault()
    }
    const onTouchEnd = () => {
      touchY = null
      if (!locked.current) relax()
    }

    const onScroll = () => {
      if (locked.current) return
      if (next && atBottom()) setEdge("bottom")
      else setEdge((e) => (e === "bottom" ? null : e === "top" && !atTop() ? null : e))
    }
    onScroll()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      window.clearTimeout(idle.current)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [reduce, pathname, next, prev, pull, relax, commit])

  const value = useMemo<Ctx>(() => ({ pull, edge, committing }), [pull, edge, committing])

  return (
    <ScrollAdvanceContext.Provider value={value}>
      {children}
      {reduce ? null : <EdgeHint />}
    </ScrollAdvanceContext.Provider>
  )
}

/**
 * The only instruction the gesture needs: a rule that fills as you lean, and
 * the name of where you are about to go. It appears at the edge, when it is
 * relevant, and never before.
 */
function EdgeHint() {
  const ctx = useScrollAdvance()
  const { pathname } = useLocation()
  const next = nextStop(pathname)
  const prev = prevStop(pathname)

  // every hook runs unconditionally, before any early return
  const fallback = useMotionValue(0)
  const smooth = useSpring(ctx?.pull ?? fallback, { stiffness: 420, damping: 34 })
  const mag = useTransform(smooth, (v) => Math.min(1, Math.abs(v)))
  const opacity = useTransform(mag, [0, 1], [0.72, 1])
  const scaleX = useTransform(mag, [0, 1], [0, 1])
  const liftUp = useTransform(mag, [0, 1], [14, 0])
  const liftDown = useTransform(mag, [0, 1], [-14, 0])

  const edge = ctx?.edge ?? null
  if (!edge) return null
  const forward = edge === "bottom"
  const stop = forward ? next : prev
  if (!stop) return null

  const idx = trackIndex(stop.to)

  return (
    <motion.div
      aria-hidden
      style={{ opacity, y: forward ? liftUp : liftDown }}
      className={
        "pointer-events-none fixed inset-x-0 z-[58] mx-auto hidden w-fit max-w-[92vw] md:block " +
        (forward ? "bottom-7" : "top-20")
      }
    >
      <div className="rounded-full border border-border-strong bg-background/90 px-5 py-2.5 shadow-[0_8px_30px_rgba(19,34,56,.10)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {forward ? null : <ArrowLeft size={14} className="text-blue" />}
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {forward ? "Keep scrolling" : "Back"}
          </span>
          <span className="text-[13px] font-medium">{stop.label}</span>
          <span className="font-mono text-[9px] tabular-nums text-faint">
            {idx >= 0 ? `${idx + 1}/${TRACK.length}` : ""}
          </span>
          {forward ? <ArrowRight size={14} className="text-blue" /> : null}
        </div>
        <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-border">
          <motion.div
            style={{ scaleX, originX: forward ? 0 : 1 }}
            className="h-full w-full bg-blue"
          />
        </div>
      </div>
    </motion.div>
  )
}
