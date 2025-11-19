import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const fabVariants = cva(
  "inline-flex items-center justify-center rounded-full text-white transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "size-14",
        sm: "size-12",
        lg: "size-16",
      },
      variant: {
        default: "bg-primary hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/50",
        success: "bg-green-500 hover:bg-green-600 focus-visible:ring-green-300/50",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

function Fab({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="fab"
      className={cn(fabVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Fab, fabVariants }
