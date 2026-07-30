import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

/**
 * Cloudflare Turnstile widget (RECOMMENDATIONS.md item 4). No-op until
 * VITE_TURNSTILE_SITE_KEY is set at build time: with no site key this
 * renders nothing and never calls onToken, so the generator behaves exactly
 * as it does today. Once a real site key exists (see the turnstile-spin
 * skill for provisioning it), flipping this on is a config change, not a
 * code change — the backend half lives in functions/api/team.ts.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js"
let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const el = document.createElement("script")
      el.src = SCRIPT_SRC
      el.async = true
      el.defer = true
      el.onload = () => resolve()
      el.onerror = () => reject(new Error("turnstile script failed to load"))
      document.head.appendChild(el)
    })
  }
  return scriptPromise
}

export type TurnstileHandle = { reset: () => void }

/** Renders nothing when VITE_TURNSTILE_SITE_KEY is unset (today's default). */
export const TurnstileWidget = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  function TurnstileWidget({ onToken }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetId = useRef<string | null>(null)

    useImperativeHandle(ref, () => ({
      reset: () => {
        onToken(null)
        if (widgetId.current) window.turnstile?.reset(widgetId.current)
      },
    }))

    useEffect(() => {
      if (!SITE_KEY || !containerRef.current) return
      let cancelled = false
      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (t: string) => onToken(t),
            "expired-callback": () => onToken(null),
            "error-callback": () => onToken(null),
          })
        })
        .catch(() => onToken(null))
      return () => {
        cancelled = true
        if (widgetId.current) window.turnstile?.remove(widgetId.current)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- onToken identity churn shouldn't re-mount the widget
    }, [])

    if (!SITE_KEY) return null
    return <div ref={containerRef} className="mt-1" />
  }
)
