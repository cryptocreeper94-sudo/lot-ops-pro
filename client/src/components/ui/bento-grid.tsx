import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "sm" | "md" | "lg"
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 3, gap = "md", children, ...props }, ref) => {
    const gapClasses = {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6"
    }
    
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          gapClasses[gap],
          colClasses[columns],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoGrid.displayName = "BentoGrid"

type BentoTileSize = "sm" | "md" | "lg" | "wide" | "tall" | "hero"

interface BentoTileProps {
  className?: string
  size?: BentoTileSize
  variant?: "default" | "glass" | "gradient" | "glow" | "premium"
  interactive?: boolean
  sparkle?: boolean
  icon?: React.ReactNode
  title?: string
  description?: string
  badge?: string
  action?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
  "data-testid"?: string
}

const BentoTile = React.forwardRef<HTMLDivElement, BentoTileProps>(
  ({ 
    className, 
    size = "md", 
    variant = "default",
    interactive = true,
    sparkle = false,
    icon,
    title,
    description,
    badge,
    action,
    children,
    onClick,
    "data-testid": dataTestId,
  }, ref) => {
    const sizeClasses = {
      sm: "col-span-1 row-span-1 min-h-[120px]",
      md: "col-span-1 row-span-1 min-h-[160px]",
      lg: "col-span-1 md:col-span-2 row-span-1 min-h-[180px]",
      wide: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1 min-h-[140px]",
      tall: "col-span-1 row-span-2 min-h-[320px]",
      hero: "col-span-1 md:col-span-2 lg:col-span-3 row-span-2 min-h-[360px]"
    }
    
    const variantClasses = {
      default: "bg-card border border-border/50 shadow-lg",
      glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl",
      gradient: "bg-gradient-to-br from-primary/20 via-card to-secondary/20 border border-primary/20 shadow-xl",
      glow: "bg-card border border-primary/30 shadow-[0_0_30px_-5px] shadow-primary/20",
      premium: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 shadow-[0_0_40px_-10px] shadow-amber-500/30"
    }
    
    const interactiveClasses = interactive ? 
      "cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/50 active:scale-[0.98]" : ""
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative rounded-2xl p-4 overflow-hidden",
          "transform-gpu perspective-1000",
          sizeClasses[size],
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        whileHover={interactive ? { 
          rotateX: 2, 
          rotateY: -2,
          z: 50
        } : undefined}
        style={{ transformStyle: "preserve-3d" }}
        onClick={onClick}
        data-testid={dataTestId}
      >
        {sparkle && <SparkleOverlay />}
        
        {badge && (
          <div className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
            {badge}
          </div>
        )}
        
        <div className="relative z-10 flex flex-col h-full">
          {icon && (
            <div className="mb-3 p-2 w-fit rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          
          {title && (
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
          )}
          
          <div className="flex-1">
            {children}
          </div>
          
          {action && (
            <div className="mt-auto pt-3">
              {action}
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {variant === "premium" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        )}
      </motion.div>
    )
  }
)
BentoTile.displayName = "BentoTile"

function SparkleOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ 
            opacity: 0,
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%"
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

interface BentoRowProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean
}

const BentoRow = React.forwardRef<HTMLDivElement, BentoRowProps>(
  ({ className, scrollable = false, children, ...props }, ref) => {
    if (scrollable) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide",
            "-mx-4 px-4",
            className
          )}
          {...props}
        >
          {React.Children.map(children, (child) => (
            <div className="snap-start shrink-0">
              {child}
            </div>
          ))}
        </div>
      )
    }
    
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-4", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoRow.displayName = "BentoRow"

export { BentoGrid, BentoTile, BentoRow, SparkleOverlay }
