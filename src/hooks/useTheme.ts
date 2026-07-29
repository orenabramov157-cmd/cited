import { useCallback, useEffect, useState } from "react"

export type Theme = "dark" | "light"
const KEY = "cited-theme-v2"

function getInitial(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme")
    if (attr === "light" || attr === "dark") return attr
  }
  return "light"
}

/** Theme lives on <html data-theme>. Defaults to light; choice persists. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  )

  return { theme, toggle }
}
