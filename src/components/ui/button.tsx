import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "btn-primary dark-button-animate",
        secondary: "btn-secondary dark-button-animate",
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-none",
        outline:
          "border border-border shadow-sm hover:bg-accent hover:text-accent-foreground rounded-none bg-transparent",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[56px] px-6 py-3 text-lg",
        sm: "min-h-[48px] px-4 py-2 text-base",
        lg: "min-h-[64px] px-8 py-4 text-xl",
        xl: "min-h-[72px] px-10 py-5 text-xl",
        icon: "h-12 w-12",
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