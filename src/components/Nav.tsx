import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Container } from "@/components/primitives"
import { Magnetic } from "@/components/fx/Magnetic"
import { EASE_REVEAL } from "@/lib/motion"
import { TRACK } from "@/lib/route-order"

/** The nav shows every stop on the track except home, which is the wordmark. */
export const PAGES = TRACK.filter((s) => s.to !== "/")

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.55, ease: EASE_REVEAL }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={
          "transition-[background,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] " +
          (scrolled
            ? "border-b border-border bg-background/85 shadow-[0_1px_0_rgba(19,34,56,.02)] backdrop-blur-xl"
            : "border-b border-transparent")
        }
      >
        <Container className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2.5" aria-label="Cited — home">
            <span className="inline-block size-[9px] rounded-[1px] bg-blue" aria-hidden />
            <span className="font-display text-[22px] font-[640] tracking-[-0.02em]">
              Cited
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-faint sm:inline">
              AI Visibility
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <div className="mr-3 hidden items-center gap-6 md:flex">
              {PAGES.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    "group flex items-baseline gap-1.5 py-1 text-[14px] font-medium transition-colors duration-200 hover:text-foreground focus-visible:text-foreground " +
                    (isActive ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={
                          "font-mono text-[9px] tabular-nums transition-colors group-hover:text-blue " +
                          (isActive ? "text-blue" : "text-faint")
                        }
                      >
                        {l.n}
                      </span>
                      <span className="relative">
                        {l.label}
                        <span
                          className={
                            "absolute inset-x-0 -bottom-0.5 h-[2px] origin-left bg-yellow transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 " +
                            (isActive ? "scale-x-100" : "scale-x-0")
                          }
                        />
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
            <ThemeToggle />
            <Magnetic strength={5} className="ml-1 hidden sm:inline-block">
              <Button asChild size="sm">
                <Link to="/try">Get recommended</Link>
              </Button>
            </Magnetic>
          </nav>
        </Container>
      </div>
    </motion.header>
  )
}
