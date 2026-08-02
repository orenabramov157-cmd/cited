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
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { nextStop, prevStop, trackIndex, TRACK, type TrackStop } from "@/lib/route-order"

/** How much extra scroll intent past the edge commits to the next page. */
const THRESHOLD = 300
/** Wheel deltas in "lines" need converting to something px-shaped. */
const LINE_HEIGHT = 16
/** Grace period after the last input before the lean starts easing back. */
const IDLE_MS = 300
/** Per-frame decay once the grace period has passed. */
const DECAY = 0.9
/**
 * Input is swallowed for exactly the length of the handoff. This is a hard
 * ceiling, not a negotiation: see the note on GESTURE_GAP_MS for why it is
 * safe to make it fixed.
 */
export const LOCK_MS = 620
/**
 * A gap this long in the input stream ends one gesture and starts the next.
 * After a handoff the gesture that caused it is spent, and no amount of
 * leftover momentum from it may trigger another. Only a genuinely new push
 * counts. This replaces an earlier scheme that held the lock open until input
 * went quiet, which had a nasty failure: every event refreshed the quiet
 * timer, so scrolling continuously kept the page frozen indefinitely.
 *
 * The value is set well above the spacing of a real wheel (10-50ms between
 * events during one continuous scroll) and well below the pause a person
 * leaves before deliberately pushing again.
 */
const GESTURE_GAP_MS = 260
/**
 * ...or the gesture ends the moment it has visibly done some work on the new
 * page. Scrolling this far means the input is being spent on reading, not on
 * leftover momentum, and travelling on from here is a real decision.
 */
const GESTURE_SPEND_PX = 120
/** How long the destination stays named after arrival, so the eye can land. */
const ARRIVAL_HOLD_MS = 420
/** Distance from the edge at which we start warning that travel is coming. */
const NEAR_EDGE = 200

type Handoff = { stop: TrackStop; forward: boolean }

type Ctx = {
  /** Signed lean, -1 (pulling back at the top) to 1 (pulling forward at the bottom). */
  pull: MotionValue<number>
  /** Which edge the gesture is currently working, if any. */
  edge: "top" | "bottom" | null
  /** True while merely near an edge; false once the gesture is actually biting. */
  near: boolean
  /** Where we are travelling to, for as long as the travel lasts. */
  handoff: Handoff | null
  /** 0 to 1 across the whole handoff, for anything that wants to show it. */
  progress: MotionValue<number>
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
  const progress = useMotionValue(0)
  const [edge, setEdge] = useState<"top" | "bottom" | null>(null)
  const [near, setNear] = useState(false)
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  const [committing, setCommitting] = useState(false)

  const acc = useRef(0)
  const lastInput = useRef(0)
  const locked = useRef(false)
  /** True when the current gesture has already been spent on a handoff. */
  const spent = useRef(false)
  /** Where the page sat when the lock lifted, to measure work done since. */
  const yAtUnlock = useRef(0)
  const firstRender = useRef(true)

  const next = nextStop(pathname)
  const prev = prevStop(pathname)

  /**
   * A fresh page starts at rest, and stays locked for exactly the length of
   * the slide. The lock stops leftover momentum scrolling the new page before
   * you have seen the top of it; `spent` stops that same momentum firing a
   * second handoff and skipping a page. Two jobs, two mechanisms, so neither
   * one has to compromise. Crucially the lock is a fixed duration, so no
   * amount of continued scrolling can extend it.
   */
  useEffect(() => {
    acc.current = 0
    pull.set(0)
    setEdge(null)
    setNear(false)
    if (firstRender.current) {
      // a cold load is not a handoff: never swallow the first scroll
      firstRender.current = false
      locked.current = false
      return
    }
    locked.current = true
    const unlock = window.setTimeout(() => {
      locked.current = false
      yAtUnlock.current = window.scrollY
      setCommitting(false)
    }, LOCK_MS)
    // the name of where you have arrived lingers a beat past the arrival
    const clear = window.setTimeout(() => {
      setHandoff(null)
      progress.set(0)
    }, LOCK_MS + ARRIVAL_HOLD_MS)
    return () => {
      window.clearTimeout(unlock)
      window.clearTimeout(clear)
    }
  }, [pathname, pull, progress])

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
    (stop: TrackStop, forward: boolean) => {
      if (locked.current) return
      locked.current = true
      spent.current = true
      setCommitting(true)
      acc.current = 0
      pull.set(0)
      setEdge(null)
      setNear(false)
      /**
       * The sign does not vanish at the moment of commit. It stays, and its
       * rule stops tracking the gesture and starts tracking the journey, so
       * there is never a frame where the screen is changing and nothing is
       * telling you why.
       */
      setHandoff({ stop, forward })
      progress.set(0)
      animate(progress, 1, { duration: LOCK_MS / 1000, ease: "linear" })
      navigate(stop.to)
    },
    [navigate, progress, pull]
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
      // the gesture that paid for the last handoff does not get a second one
      if (spent.current) return false

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
        if (target) commit(target, side === "bottom")
      }
      return true
    }

    /**
     * The lean decays instead of being wiped on a timer. A hard reset punished
     * anyone who scrolls in slow deliberate nudges rather than one long flick:
     * their intent evaporated between events and they could never reach the
     * threshold. Now it bleeds away, so slow pushes still accumulate and
     * letting go eases back to rest.
     */
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // a pause in the input stream ends the old gesture and arms the next one
      if (spent.current && performance.now() - lastInput.current > GESTURE_GAP_MS) {
        spent.current = false
      }
      if (acc.current === 0 || locked.current) return
      if (performance.now() - lastInput.current < IDLE_MS) return
      acc.current *= DECAY
      if (Math.abs(acc.current) < 6) acc.current = 0
      pull.set(acc.current / THRESHOLD)
    }
    raf = requestAnimationFrame(tick)

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch zoom, not travel
      if (locked.current) {
        // Mid-handoff: absorb the tail of the flick instead of acting on it.
        // Recording the timestamp keeps the spent gesture marked as ongoing;
        // it does NOT extend the lock, which is on a fixed timer.
        lastInput.current = performance.now()
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: "auto" })
        return
      }
      const dy = e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT : e.deltaY
      lastInput.current = performance.now()
      if (feed(dy)) e.preventDefault()
    }

    /**
     * The gesture must not be the only way through. Page Down, the arrows and
     * space advance the track from the edges, which also means the site can be
     * driven entirely from the keyboard.
     */
    const onKey = (e: KeyboardEvent) => {
      if (locked.current || e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement as HTMLElement | null
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      if (typing) return

      const forwardKey = e.key === "PageDown" || e.key === "ArrowDown" || e.key === " "
      const backKey = e.key === "PageUp" || e.key === "ArrowUp"
      if (forwardKey && next && atBottom()) {
        e.preventDefault()
        commit(next, true)
      } else if (backKey && prev && atTop()) {
        e.preventDefault()
        commit(prev, false)
      }
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (locked.current) {
        lastInput.current = performance.now()
        e.preventDefault()
        return
      }
      const y = e.touches[0]?.clientY
      if (y == null || touchY == null) return
      const dy = (touchY - y) * 1.5 // finger travel is smaller than wheel travel
      touchY = y
      lastInput.current = performance.now()
      if (feed(dy)) e.preventDefault()
    }
    const onTouchEnd = () => {
      touchY = null
      if (!locked.current) relax()
    }

    /**
     * Warn before the wall, not at it. Arriving at the bottom and only THEN
     * being told that the page is about to change is what makes the handoff
     * feel like an interruption. Two hundred pixels of notice turns it into
     * something you chose.
     */
    const nearBottom = () => {
      const doc = document.documentElement
      return window.innerHeight + window.scrollY >= doc.scrollHeight - NEAR_EDGE
    }

    const onScroll = () => {
      if (locked.current) return
      /**
       * A gesture that has scrolled the new page is no longer the spent tail
       * of the last handoff, it is someone reading. Without this the site
       * would sit at the bottom of a page ignoring a live scroll wheel, which
       * is precisely the dead feeling this whole mechanism exists to avoid.
       */
      if (spent.current && Math.abs(window.scrollY - yAtUnlock.current) > GESTURE_SPEND_PX) {
        spent.current = false
      }
      if (next && nearBottom()) {
        setEdge("bottom")
        setNear(!atBottom())
      } else {
        setNear(false)
        setEdge((e) => (e === "bottom" ? null : e === "top" && !atTop() ? null : e))
      }
    }
    onScroll()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKey)
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [reduce, pathname, next, prev, pull, relax, commit])

  const value = useMemo<Ctx>(
    () => ({ pull, edge, near, handoff, progress, committing }),
    [pull, edge, near, handoff, progress, committing]
  )

  return (
    <ScrollAdvanceContext.Provider value={value}>
      {children}
      {reduce ? null : <EdgeHint />}
    </ScrollAdvanceContext.Provider>
  )
}

/**
 * One sign, two jobs.
 *
 * Before the handoff it is a promise: the name of the next stop and a rule
 * that fills as you lean into it. At the moment of commit it does not
 * disappear — it becomes a report on the journey, the same rule now running on
 * the clock of the transition itself. That continuity is the whole point. The
 * old version destroyed itself nineteen milliseconds after commit, which left
 * roughly half a second where the screen was changing and nothing on it said
 * so. That reads as a stall, not a transition.
 */
function EdgeHint() {
  const ctx = useScrollAdvance()
  const { pathname } = useLocation()
  const next = nextStop(pathname)
  const prev = prevStop(pathname)

  // every hook runs unconditionally, before any early return
  const fallback = useMotionValue(0)
  const smooth = useSpring(ctx?.pull ?? fallback, { stiffness: 420, damping: 34 })
  const gesture = useTransform(smooth, (v) => Math.min(1, Math.abs(v)))
  const travel = ctx?.progress ?? fallback

  const handoff = ctx?.handoff ?? null
  const edge = ctx?.edge ?? null
  const near = ctx?.near ?? false

  // during travel the rule reports the journey; before it, the gesture
  const fill = handoff ? travel : gesture
  const scaleX = useTransform(fill, [0, 1], [0, 1])
  const opacity = useTransform(gesture, [0, 1], [0.62, 1])
  const liftUp = useTransform(gesture, [0, 1], [14, 0])
  const liftDown = useTransform(gesture, [0, 1], [-14, 0])

  const forward = handoff ? handoff.forward : edge === "bottom"
  const stop = handoff ? handoff.stop : forward ? next : prev
  if (!stop) return null
  if (!handoff && !edge) return null

  const idx = trackIndex(stop.to)
  const kicker = handoff
    ? forward
      ? "Going to"
      : "Back to"
    : near
      ? forward
        ? "Next"
        : "Previous"
      : forward
        ? "Keep scrolling"
        : "Scroll up"

  return (
    <motion.div
      aria-hidden
      data-seam="pill"
      // pinned while travelling: it must not move when the page slides
      style={handoff ? undefined : { opacity, y: forward ? liftUp : liftDown }}
      className={
        "pointer-events-none fixed inset-x-0 z-[70] mx-auto hidden w-fit max-w-[92vw] md:block " +
        (forward ? "bottom-7" : "top-20")
      }
    >
      <div className="rounded-full border border-border-strong bg-background/90 px-5 py-2.5 shadow-[0_8px_30px_rgba(19,34,56,.10)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {forward ? null : <ArrowLeft size={14} className="text-blue" />}
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {kicker}
          </span>
          <span className="text-[13px] font-medium">{stop.label}</span>
          <span className="font-mono text-[9px] tabular-nums text-faint">
            {idx >= 0 ? `${String(idx + 1).padStart(2, "0")} / ${TRACK.length}` : ""}
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
