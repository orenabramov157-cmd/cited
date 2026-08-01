/**
 * The site is one continuous track, not a pile of pages. This is the running
 * order, and it is the single source of truth for "what comes next" — the
 * scroll-advance gesture, the pager, and the direction of every route
 * transition all read it.
 */
export const TRACK = [
  { to: "/", label: "Cited", n: "00" },
  { to: "/shift", label: "The Shift", n: "01" },
  { to: "/team", label: "The Team", n: "02" },
  { to: "/method", label: "Method", n: "03" },
  { to: "/proof", label: "Proof", n: "04" },
  { to: "/try", label: "Try it", n: "05" },
] as const

export type TrackStop = (typeof TRACK)[number]

/** Position on the track, or -1 for pages that sit outside it (legal pages). */
export function trackIndex(pathname: string): number {
  return TRACK.findIndex((s) => s.to === pathname)
}

export function nextStop(pathname: string): TrackStop | null {
  const i = trackIndex(pathname)
  return i >= 0 && i < TRACK.length - 1 ? TRACK[i + 1] : null
}

export function prevStop(pathname: string): TrackStop | null {
  const i = trackIndex(pathname)
  return i > 0 ? TRACK[i - 1] : null
}

/**
 * Which way the world should slide when going from one path to another.
 * Forward (+1) means the outgoing page exits left. Anything involving an
 * off-track page has no meaningful direction, so it falls back to forward.
 */
export function slideDirection(from: string, to: string): 1 | -1 {
  const a = trackIndex(from)
  const b = trackIndex(to)
  if (a < 0 || b < 0) return 1
  return b >= a ? 1 : -1
}
