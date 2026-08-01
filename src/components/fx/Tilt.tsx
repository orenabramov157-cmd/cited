import type { ReactNode } from "react"
import { motion, useReducedMotion, useTransform } from "framer-motion"
import { useElementPointer, useHasPointer } from "@/lib/pointer"
import { cn } from "@/lib/utils"

/**
 * Mouse-parallax card. Rotates in 3D toward the cursor and lifts a sheen
 * across its surface. Keeps a real border/background from the caller, so it
 * still reads as an editorial panel rather than a toy.
 */
export function Tilt({
  children,
  className,
  max = 7,
  sheen = true,
  lift = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
  sheen?: boolean
  lift?: number
}) {
  const reduce = useReducedMotion()
  const hasPointer = useHasPointer()
  const { ref, nx, ny, active } = useElementPointer<HTMLDivElement>()

  const rotateY = useTransform(nx, [-1, 1], [-max, max])
  const rotateX = useTransform(ny, [-1, 1], [max, -max])
  const sheenX = useTransform(nx, [-1, 1], ["-30%", "130%"])

  if (reduce || !hasPointer) return <div className={className}>{children}</div>

  return (
    <div style={{ perspective: 1100 }} className="[transform-style:preserve-3d]">
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{ y: active ? -lift : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className={cn("relative", className)}
      >
        {children}
        {sheen ? (
          <motion.span
            aria-hidden
            style={{ left: sheenX, opacity: active ? 1 : 0 }}
            className="pointer-events-none absolute inset-y-0 w-[38%] -translate-x-1/2 bg-[linear-gradient(100deg,transparent,color-mix(in_srgb,var(--blue)_9%,transparent),transparent)] transition-opacity duration-300"
          />
        ) : null}
      </motion.div>
    </div>
  )
}
