import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:shadow-2xl hover:from-blue-400 hover:to-blue-800 active:scale-95",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg hover:shadow-2xl hover:from-red-400 hover:to-red-800",
        outline:
          "border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:shadow-md hover:border-slate-400 hover:scale-105",
        secondary:
          "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 border border-slate-300 shadow-md hover:shadow-lg hover:from-slate-50 hover:to-slate-100 hover:scale-105",
        ghost: 
          "text-slate-700 hover:bg-slate-100 hover:shadow-sm hover:scale-105",
        link: 
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
      },
      size: {
        default: "min-h-10 px-4 py-2.5",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-12 rounded-lg px-8 py-3 text-base",
        icon: "h-10 w-10",
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
