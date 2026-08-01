import { useEffect, useRef, useState } from "react"
import { useMotionValue, useSpring, type MotionValue } from "framer-motion"

/**
 * Global pointer position in viewport pixels, as springy motion values.
 * One listener for the whole app: every cursor-reactive piece reads these
 * instead of registering its own `mousemove`.
 */
export function usePointer(stiffness = 140, damping = 22) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness, damping, restDelta: 0.01 })
  const y = useSpring(rawY, { stiffness, damping, restDelta: 0.01 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [rawX, rawY])

  return { x, y, rawX, rawY }
}

/**
 * Pointer position relative to an element's center, normalised to -1..1 on
 * both axes. Returns springs, so anything bound to them eases rather than
 * snapping. `active` is false until the pointer is actually over the element,
 * which lets callers park the effect at rest.
 */
export function useElementPointer<T extends HTMLElement>(
  stiffness = 180,
  damping = 20
): {
  ref: React.RefObject<T | null>
  nx: MotionValue<number>
  ny: MotionValue<number>
  active: boolean
} {
  const ref = useRef<T | null>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const nx = useSpring(rawX, { stiffness, damping })
  const ny = useSpring(rawY, { stiffness, damping })
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2)
      rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    }
    const onEnter = () => setActive(true)
    const onLeave = () => {
      setActive(false)
      rawX.set(0)
      rawY.set(0)
    }

    el.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerenter", onEnter)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerenter", onEnter)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [rawX, rawY])

  return { ref, nx, ny, active }
}

/** True on devices with a real hover-capable pointer (skip fx on touch). */
export function useHasPointer() {
  const [has, setHas] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setHas(mq.matches)
    const onChange = () => setHas(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return has
}
