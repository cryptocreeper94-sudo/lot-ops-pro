import { useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Rocket, Building2, Crown } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumButton } from "@/components/ui/premium-button";

export default function Pricing() {
  const [_, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const tiers = [
    {
      name: "Scanner Only",
      icon: Zap,
      price: { monthly: 49, yearly: 470 },
      description: "Perfect for small operations",
      color: "blue",
      variant: "glass" as const,
      features: [
        "OCR Camera Scanning",
        "Work Order Management",
        "Basic Inventory Tracking",
        "Mobile App Access",
        "Email Support"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Lot Ops Lite",
      icon: Rocket,
      price: { monthly: 149, yearly: 1490 },
      description: "Ideal for growing facilities",
      color: "purple",
      variant: "premium" as const,
      popular: true,
      features: [
        "Everything in Scanner Only",
        "GPS Routing & Navigation",
        "Performance Tracking (MPH, Quotas)",
        "Break & Shift Management",
        "Real-time Messaging",
        "Weather Monitoring",
        "Priority Support"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Lot Ops Pro",
      icon: Building2,
      price: { monthly: 299, yearly: 2990 },
      description: "Complete operations platform",
      color: "green",
      variant: "gradient" as const,
      features: [
        "Everything in Lite",
        "AI Assistant with Voice I/O",
        "Safety Incident Reporting",
        "Speed Monitoring & Violations",
        "Document Storage (10MB)",
        "Email Contact Manager",
        "Web Research Tool",
        "Trip Counter & Mileage",
        "100+ Custom Themes",
        "Dedicated Support"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: { monthly: "Custom", yearly: "Custom" },
      description: "White-label for your organization",
      color: "amber",
      variant: "glow" as const,
      features: [
        "Everything in Pro",
        "Multi-Facility Management",
        "White-label Branding",
        "Custom Integrations (Payroll, HR, ERP)",
        "On-site Training & Setup",
        "Dedicated Account Manager",
        "SLA Guarantee",
        "Unlimited Users",
        "API Access"
      ],
      cta: "Contact Sales"
    }
  ];

  const getColorClasses = (color: string, variant: "bg" | "text" | "border") => {
    const colors: Record<string, Record<string, string>> = {
      blue: { bg: "bg-blue-600", text: "text-blue-400", border: "border-blue-500" },
      purple: { bg: "bg-purple-600", text: "text-purple-400", border: "border-purple-500" },
      green: { bg: "bg-green-600", text: "text-green-400", border: "border-green-500" },
      amber: { bg: "bg-amber-600", text: "text-amber-400", border: "border-amber-500" }
    };
    return colors[color]?.[variant] || colors.blue[variant];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-start">
          <NavigationControl variant="back" fallbackRoute="/" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white" data-testid="text-pricing-title">Choose Your Plan</h1>
          <p className="text-xl text-slate-300" data-testid="text-pricing-subtitle">14-day free trial • No credit card required • Cancel anytime</p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <PremiumButton
              variant={billingPeriod === "monthly" ? "primary" : "glass"}
              onClick={() => setBillingPeriod("monthly")}
              data-testid="button-billing-monthly"
            >
              Monthly
            </PremiumButton>
            <PremiumButton
              variant={billingPeriod === "yearly" ? "primary" : "glass"}
              onClick={() => setBillingPeriod("yearly")}
              data-testid="button-billing-yearly"
            >
              Yearly
              <Badge className="ml-2 bg-green-500 text-white">Save 20%</Badge>
            </PremiumButton>
          </div>
        </div>

        <BentoGrid columns={4} gap="lg" className="mt-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const price = tier.price[billingPeriod];
            
            return (
              <BentoTile
                key={tier.name}
                variant={tier.variant}
                sparkle={tier.popular}
                size="tall"
                badge={tier.popular ? "Most Popular" : undefined}
                data-testid={`tile-pricing-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={tier.popular ? "ring-2 ring-amber-500/50 z-10" : ""}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl ${getColorClasses(tier.color, "bg")} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1" data-testid={`text-tier-name-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">{tier.description}</p>
                  
                  <div className="mb-4">
                    {typeof price === "number" ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white" data-testid={`text-price-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}>
                            ${price}
                          </span>
                          <span className="text-slate-400">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                        </div>
                        {billingPeriod === "yearly" && typeof tier.price.monthly === "number" && typeof tier.price.yearly === "number" && (
                          <p className="text-sm text-green-400 mt-1">
                            Save ${(tier.price.monthly * 12 - tier.price.yearly).toFixed(0)}/year
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-white" data-testid={`text-price-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {price}
                      </div>
                    )}
                  </div>
                  
                  <PremiumButton
                    variant={tier.popular ? "premium" : "glass"}
                    className="w-full mb-4"
                    shine={tier.popular}
                    onClick={() => tier.name === "Enterprise" ? setLocation("/about") : setLocation("/checkout/pending")}
                    data-testid={`button-cta-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tier.cta}
                  </PremiumButton>
                  
                  <ul className="space-y-2 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 ${getColorClasses(tier.color, "text")} mt-0.5 flex-shrink-0`} />
                        <span className="text-xs text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BentoTile>
            );
          })}
        </BentoGrid>

        <BentoGrid columns={2} gap="lg" className="mt-12">
          <BentoTile 
            variant="glass" 
            size="md"
            title="Who is Lot Ops Pro for?"
            data-testid="tile-faq-who"
          >
            <div className="space-y-2 text-sm text-slate-300">
              <p>• <strong className="text-white">Auto Auctions:</strong> Manheim, ADESA, IAA, Copart, regional auctions</p>
              <p>• <strong className="text-white">Car Dealerships:</strong> Loading docks, inventory management, lot operations</p>
              <p>• <strong className="text-white">Manufacturing Plants:</strong> Nissan, Toyota, GM, Ford shift operations</p>
              <p>• <strong className="text-white">Equipment Yards:</strong> Construction, farm equipment, heavy machinery</p>
              <p>• <strong className="text-white">Fleet Management:</strong> Truck yards, logistics hubs, distribution centers</p>
            </div>
          </BentoTile>

          <BentoTile 
            variant="gradient" 
            size="md"
            title="Why Choose Lot Ops Pro?"
            data-testid="tile-faq-why"
          >
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Replace 10+ contractor systems with one platform</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> 50-70% reduction in operational overhead</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Real-time GPS guidance and autonomous routing</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Mobile-first design for drivers and managers</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> White-label ready for enterprise deployment</p>
            </div>
          </BentoTile>
        </BentoGrid>
      </div>
    </div>
  );
}
