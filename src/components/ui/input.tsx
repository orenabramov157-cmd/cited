import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Input — a clean instrument field: white well on paper (or deep
 * well on navy via className), crisp cobalt focus. Flat, precise, obvious.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-[var(--r-sm)] border border-input bg-panel px-4 text-[15px]",
        "text-foreground placeholder:text-faint caret-blue",
        "transition-[border-color,box-shadow,background] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-ring/60",
        "hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
