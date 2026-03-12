import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PremiumAccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  collapsible?: boolean
}

export function PremiumAccordion({ 
  children, 
  className,
  type = "single",
  defaultValue,
  collapsible = true
}: PremiumAccordionProps) {
  return (
    <AccordionPrimitive.Root
      type={type as any}
      defaultValue={defaultValue as any}
      collapsible={collapsible}
      className={cn("space-y-3", className)}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

interface PremiumAccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "glass" | "gradient" | "premium"
  icon?: React.ReactNode
  badge?: string
}

export function PremiumAccordionItem({ 
  value, 
  children, 
  className,
  variant = "default",
  icon,
  badge
}: PremiumAccordionItemProps) {
  const variantClasses = {
    default: "bg-card border border-border/50 shadow-md hover:shadow-lg",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl",
    gradient: "bg-gradient-to-r from-primary/10 via-card to-secondary/10 border border-primary/20",
    premium: "bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 border border-amber-500/30 shadow-[0_0_20px_-5px] shadow-amber-500/20"
  }

  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-300",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}

interface PremiumAccordionTriggerProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  badge?: string
  description?: string
}

export function PremiumAccordionTrigger({ 
  children, 
  className,
  icon,
  badge,
  description
}: PremiumAccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center gap-3 px-4 py-3 text-left transition-all duration-300",
          "group hover:bg-white/5",
          "[&[data-state=open]]:bg-white/5",
          className
        )}
      >
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {children}
            </span>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 [&[data-state=open]]:rotate-180 group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

interface PremiumAccordionContentProps {
  children: React.ReactNode
  className?: string
}

export function PremiumAccordionContent({ 
  children, 
  className 
}: PremiumAccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      )}
    >
      <div className={cn("px-4 pb-4 pt-2", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

interface AccordionSectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  badge?: string
  variant?: "default" | "glass" | "gradient" | "premium"
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function AccordionSection({
  title,
  description,
  icon,
  badge,
  variant = "default",
  defaultOpen = false,
  children,
  className
}: AccordionSectionProps) {
  return (
    <PremiumAccordion defaultValue={defaultOpen ? "section" : undefined} className={className}>
      <PremiumAccordionItem value="section" variant={variant}>
        <PremiumAccordionTrigger icon={icon} badge={badge} description={description}>
          {title}
        </PremiumAccordionTrigger>
        <PremiumAccordionContent>
          {children}
        </PremiumAccordionContent>
      </PremiumAccordionItem>
    </PremiumAccordion>
  )
}
