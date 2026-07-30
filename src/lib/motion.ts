import type { Variants, Transition } from "framer-motion"

/** Signature easing curves — used everywhere for a cohesive feel. */
export const EASE_REVEAL = [0.22, 1, 0.36, 1] as const // expo-out, for entrances
export const EASE_MICRO = [0.4, 0, 0.2, 1] as const // for micro-interactions

export const DUR = {
  micro: 0.18,
  base: 0.32,
  reveal: 0.55,
  slow: 0.7,
} as const

export const revealTransition: Transition = {
  duration: DUR.reveal,
  ease: EASE_REVEAL,
}

/** Section container that staggers its children into view (once). */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

/** A single element rising + fading in. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE_REVEAL },
  },
}

/** Masked line reveal — text clipped, rises with a slight blur burn-off. */
export const maskLine: Variants = {
  hidden: { opacity: 0, y: "110%", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { duration: DUR.slow, ease: EASE_REVEAL },
  },
}

/** Result agent cards revealing in sequence. */
export const agentItem: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DUR.base, ease: EASE_REVEAL },
  },
}

