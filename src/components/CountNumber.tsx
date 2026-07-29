import { useCountUp } from "@/hooks/useCountUp"

/** Animated number that counts up once when scrolled into view. */
export function CountNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1100,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const [val, ref] = useCountUp(value, duration, decimals)
  return (
    <span ref={ref} className={className}>
      <span className="tnum">
        {prefix}
        {val}
        {suffix}
      </span>
    </span>
  )
}
