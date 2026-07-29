import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { EASE_MICRO } from "@/lib/motion"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const reduce = useReducedMotion()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-ring"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={reduce ? false : { opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, rotate: 35, scale: 0.7 }}
          transition={{ duration: 0.2, ease: EASE_MICRO }}
          className="grid place-items-center"
        >
          {isDark ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
