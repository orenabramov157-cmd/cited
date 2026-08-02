import { useEffect, useRef, type ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import { useLocation } from "react-router-dom"
import { EASE_REVEAL } from "@/lib/motion"
import { slideDirection, trackIndex, TRACK } from "@/lib/route-order"
import { useScrollAdvance } from "@/components/fx/ScrollAdvance"

/**
 * Route transition, sideways.
 *
 * The site reads as one continuous surface that pans, so pages leave and
 * arrive horizontally: the outgoing page slides out and recedes, an ink seam
 * sweeps across the join, and the incoming page arrives from the other side.
 * Direction comes from the running order, so travelling backwards genuinely
 * looks like travelling backwards.
 *
 * While the scroll gesture is being leaned into, the whole page shifts a few
 * pixels against the pull. That resistance is what makes the handoff feel
 * earned rather than accidental.
 */
export function PageTransition({
  children,
}: {
  /**
   * Called with the location this page instance is pinned to. The exiting
   * instance keeps its own, so it renders the page that is actually leaving.
   */
  children: (location: ReturnType<typeof useLocation>) => ReactNode
}) {
  const location = useLocation()
  const reduce = useReducedMotion()
  const advance = useScrollAdvance()

  // remember where we came from to decide which way the world moves
  const prevPath = useRef(location.pathname)
  const dir = slideDirection(prevPath.current, location.pathname)
  useEffect(() => {
    prevPath.current = location.pathname
  }, [location.pathname])

  // Reset scroll only once the outgoing page is gone. Doing it at the start of
  // the exit made the leaving page jump to the top before it left. The
  // .is-handoff overflow lock freezes programmatic scrolling too, so lift it
  // for exactly this one call and put it straight back.
  const onEnter = () => {
    const el = document.documentElement
    const locked = el.classList.contains("is-handoff")
    if (locked) el.classList.remove("is-handoff")
    // "instant", not "auto": the global scroll-behavior:smooth would animate
    // this, and re-applying the overflow lock freezes that animation mid-way
    window.scrollTo({ top: 0, behavior: "instant" })
    if (locked) el.classList.add("is-handoff")
  }

  const fallback = useMotionValue(0)
  const pull = useSpring(advance?.pull ?? fallback, { stiffness: 380, damping: 32 })
  const lean = useTransform(pull, (v) => -v * 34)
  const leanScale = useTransform(pull, (v) => 1 - Math.min(Math.abs(v), 1) * 0.012)

  if (reduce) return <>{children(location)}</>

  return (
    // `custom` is how the direction reaches the *exiting* page: its props are
    // frozen at unmount, so a plain variable would give it a stale direction.
    <AnimatePresence mode="wait" initial={false} custom={dir} onExitComplete={onEnter}>
      <motion.div key={location.pathname} className="relative">
        <motion.div
          custom={dir}
          variants={PAGE}
          initial="enter"
          animate="center"
          exit="leave"
          transition={{ duration: 0.34, ease: EASE_REVEAL }}
        >
          {/* the lean lives on an inner layer so it never fights the slide */}
          <motion.div style={{ x: lean, scale: leanScale }}>{children(location)}</motion.div>
        </motion.div>

        {/*
          The seam. Two bands so the sweep is continuous across the swap: one
          rides in over the outgoing page, the other rides off the incoming
          one, both travelling the same way, each carrying an ink rule on its
          leading edge.
        */}
        <motion.span
          aria-hidden
          custom={dir}
          variants={COVER}
          initial="parked"
          animate="parked"
          exit="cover"
          transition={{ duration: 0.26, ease: EASE_REVEAL }}
          className="pointer-events-none fixed inset-0 z-[55] border-blue bg-canvas"
        />
        {/*
          The arriving band is not blank. It carries the name of the stop you
          are landing on, so the covered moment reads as a title card rather
          than as a page that failed to load.
        */}
        <motion.span
          aria-hidden
          custom={dir}
          variants={UNCOVER}
          initial="covering"
          animate="gone"
          transition={{ duration: 0.3, ease: EASE_REVEAL }}
          className="pointer-events-none fixed inset-0 z-[55] border-blue bg-canvas"
        />
        {/*
          The title does not ride the band. If it did it would leave the
          viewport as soon as the band was half gone, which measured at fifty
          milliseconds of screen time. It sits still and fades on its own clock
          instead, so the covered moment always has something to read.
        */}
        <SeamTitle pathname={location.pathname} />
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * The stop you are arriving at, set on the covering band. Off-track pages have
 * no number, so they get their own quiet treatment rather than a fake one.
 */
function SeamTitle({ pathname }: { pathname: string }) {
  const i = trackIndex(pathname)
  if (i < 0) return null
  const stop = TRACK[i]
  return (
    <motion.span
      aria-hidden
      data-seam="title"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -6] }}
      transition={{ duration: 0.46, times: [0, 0.22, 0.62, 1], ease: EASE_REVEAL }}
      className="pointer-events-none fixed inset-0 z-[56] flex flex-col items-center justify-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        {stop.n} / {String(TRACK.length - 1).padStart(2, "0")}
      </span>
      <span className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-none">{stop.label}</span>
    </motion.span>
  )
}

/** Sideways page travel. `d` is +1 forward along the track, -1 backwards. */
const PAGE: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 90, scale: 0.985 }),
  center: { opacity: 1, x: 0, scale: 1 },
  leave: (d: number) => ({ opacity: 0, x: d * -110, scale: 0.975 }),
}

/** Band that rides in over the outgoing page, ink rule on its leading edge. */
const COVER: Variants = {
  parked: (d: number) => ({
    x: `${d * 100}%`,
    borderLeftWidth: d > 0 ? 2 : 0,
    borderRightWidth: d > 0 ? 0 : 2,
  }),
  cover: (d: number) => ({
    x: "0%",
    borderLeftWidth: d > 0 ? 2 : 0,
    borderRightWidth: d > 0 ? 0 : 2,
  }),
}

/** Band that rides off the incoming page, continuing the same sweep. */
const UNCOVER: Variants = {
  covering: (d: number) => ({
    x: "0%",
    borderLeftWidth: d > 0 ? 0 : 2,
    borderRightWidth: d > 0 ? 2 : 0,
  }),
  gone: (d: number) => ({
    x: `${d * -100}%`,
    borderLeftWidth: d > 0 ? 0 : 2,
    borderRightWidth: d > 0 ? 2 : 0,
  }),
}
