import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface PremiumButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "primary" | "secondary" | "gradient" | "glow" | "premium" | "glass" | "danger"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  shine?: boolean
  pulse?: boolean
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  type?: "button" | "submit" | "reset"
  "data-testid"?: string
}

export function PremiumButton({
  children,
  className,
  variant = "default",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  shine = false,
  pulse = false,
  onClick,
  type = "button",
  "data-testid": dataTestId
}: PremiumButtonProps) {
  const isDisabled = disabled || loading

  const sizeClasses = {
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
    icon: "h-10 w-10"
  }

  const variantClasses = {
    default: cn(
      "bg-card text-foreground border border-border/50",
      "hover:bg-accent hover:border-border",
      "shadow-md hover:shadow-lg"
    ),
    primary: cn(
      "bg-primary text-primary-foreground",
      "hover:bg-primary/90",
      "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
    ),
    secondary: cn(
      "bg-secondary text-secondary-foreground",
      "hover:bg-secondary/80",
      "shadow-md hover:shadow-lg"
    ),
    gradient: cn(
      "bg-gradient-to-r from-primary via-primary/80 to-secondary text-white",
      "hover:from-primary/90 hover:via-primary/70 hover:to-secondary/90",
      "shadow-lg shadow-primary/30 hover:shadow-xl"
    ),
    glow: cn(
      "bg-primary text-primary-foreground",
      "shadow-[0_0_20px_-5px] shadow-primary/50",
      "hover:shadow-[0_0_30px_-5px] hover:shadow-primary/60"
    ),
    premium: cn(
      "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold",
      "shadow-[0_0_30px_-5px] shadow-amber-500/40",
      "hover:shadow-[0_0_40px_-5px] hover:shadow-amber-500/50",
      "border border-amber-300/50"
    ),
    glass: cn(
      "bg-white/10 text-white backdrop-blur-xl",
      "border border-white/20",
      "hover:bg-white/20",
      "shadow-xl"
    ),
    danger: cn(
      "bg-destructive text-destructive-foreground",
      "hover:bg-destructive/90",
      "shadow-lg shadow-destructive/25"
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      data-testid={dataTestId}
      className={cn(
        "relative inline-flex items-center justify-center",
        "font-medium rounded-xl",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "overflow-hidden",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      {shine && !isDisabled && <ShineEffect />}
      
      {pulse && !isDisabled && <PulseRing />}

      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </span>
    </motion.button>
  )
}

function ShineEffect() {
  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: "100%", opacity: [0, 1, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }}
    >
      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
    </motion.div>
  )
}

function PulseRing() {
  return (
    <motion.span
      className="absolute inset-0 rounded-xl border-2 border-current"
      initial={{ scale: 1, opacity: 0.5 }}
      animate={{ scale: 1.2, opacity: 0 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  )
}

interface IconButtonProps {
  icon: React.ReactNode
  className?: string
  variant?: "default" | "primary" | "glass" | "glow"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
  "data-testid"?: string
}

export function IconButton({
  icon,
  className,
  variant = "default",
  size = "md",
  onClick,
  disabled,
  tooltip,
  "data-testid": dataTestId
}: IconButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  const variantClasses = {
    default: "bg-card border border-border/50 text-foreground hover:bg-accent shadow-md hover:shadow-lg",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20",
    glow: "bg-primary text-primary-foreground shadow-[0_0_15px_-3px] shadow-primary/50 hover:shadow-[0_0_20px_-3px] hover:shadow-primary/60"
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      title={tooltip}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {icon}
    </motion.button>
  )
}

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function ButtonGroup({
  children,
  className,
  orientation = "horizontal"
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl overflow-hidden shadow-lg",
        orientation === "vertical" ? "flex-col" : "flex-row",
        "[&>button]:rounded-none",
        "[&>button:first-child]:rounded-l-xl",
        "[&>button:last-child]:rounded-r-xl",
        orientation === "vertical" && "[&>button:first-child]:rounded-t-xl [&>button:first-child]:rounded-l-none",
        orientation === "vertical" && "[&>button:last-child]:rounded-b-xl [&>button:last-child]:rounded-r-none",
        "[&>button]:border-r-0 [&>button:last-child]:border-r",
        className
      )}
    >
      {children}
    </div>
  )
}
