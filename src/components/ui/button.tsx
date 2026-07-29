import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Button — restyled for "Cited" bright editorial intelligence.
 * Cobalt is the single primary voice; pills; flat paper surfaces with one
 * crisp press interaction (~180ms). No gradients, no glow.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
    "transition-[background,border-color,color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] " +
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue text-white shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_1px_2px_rgba(19,34,56,.2)] " +
          "hover:bg-blue-deep hover:-translate-y-px",
        outline:
          "border border-border-strong bg-transparent text-foreground " +
          "hover:border-blue hover:text-blue",
        ink:
          "bg-ink text-white hover:bg-navy hover:-translate-y-px " +
          "shadow-[0_1px_2px_rgba(19,34,56,.25)]",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/70",
        link:
          "p-0 h-auto text-blue underline decoration-blue/30 underline-offset-4 hover:decoration-blue",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-[13.5px] [&_svg]:size-4",
        default: "h-11 rounded-full px-5 text-[15px] [&_svg]:size-4",
        lg: "h-[52px] rounded-full px-7 text-base [&_svg]:size-[18px]",
        icon: "size-10 rounded-full [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
