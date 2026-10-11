import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[14px] font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-brand-crimson text-white hover:bg-brand-primary-hover shadow-sm",
        destructive:
          "bg-status-danger text-white hover:bg-status-danger/90 shadow-sm",
        outline:
          "border border-border-strong bg-surface-card hover:bg-surface-tint hover:border-brand-crimson/30 hover:text-brand-crimson text-text-strong shadow-sm",
        secondary:
          "bg-surface-tint text-brand-crimson hover:bg-brand-peach/30 border border-brand-peach/50",
        ghost: "hover:bg-surface-tint hover:text-brand-crimson text-text-muted",
        link: "text-brand-crimson underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-[13px]",
        lg: "h-12 rounded-2xl px-8 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
