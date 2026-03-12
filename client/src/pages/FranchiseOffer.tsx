import { useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useFacilityMode } from "@/hooks/useFacilityMode";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { 
  PremiumAccordion, 
  PremiumAccordionItem, 
  PremiumAccordionTrigger, 
  PremiumAccordionContent 
} from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Crown, 
  Building2, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle2,
  DollarSign,
  MapPin,
  Briefcase,
  Award,
  ArrowRight,
  Star,
  Lock,
  Unlock,
  RefreshCcw,
  Package,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function FranchiseOffer() {
  const [, setLocation] = useLocation();
  const { isBeta, showFranchiseOfferPricing } = useFacilityMode();

  const franchiseTiers = [
    {
      id: "standard",
      name: "Standard Franchise",
      description: "Perfect for single-location operations",
      franchiseFee: "$5,000",
      royalty: "5%",
      royaltyType: "per vehicle processed",
      supportFee: "$500/month",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Full hallmark system ownership",
        "Custom branding & colors",
        "Serial number generation",
        "Basic territory (city-level)",
        "Standard support (48hr response)",
        "Quarterly training updates",
        "NFT badge revenue share (70/30)"
      ],
      limitations: [
        "Single location only",
        "No territory exclusivity",
        "Standard API limits"
      ]
    },
    {
      id: "premium",
      name: "Premium Franchise",
      description: "Ideal for regional operations",
      franchiseFee: "$10,000",
      royalty: "4%",
      royaltyType: "per vehicle processed",
      supportFee: "$750/month",
      color: "from-purple-500 to-pink-500",
      featured: true,
      features: [
        "Everything in Standard, plus:",
        "Multi-location support (up to 5)",
        "Exclusive regional territory",
        "Priority support (24hr response)",
        "Monthly training & updates",
        "Custom feature requests",
        "NFT badge revenue share (80/20)",
        "White-label mobile app option",
        "Dedicated account manager"
      ],
      limitations: [
        "Up to 5 locations",
        "Regional territory only"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Franchise",
      description: "For multi-state or national operations",
      franchiseFee: "$25,000",
      royalty: "3%",
      royaltyType: "per vehicle processed",
      supportFee: "$1,500/month",
      color: "from-amber-500 to-orange-500",
      features: [
        "Everything in Premium, plus:",
        "Unlimited locations",
        "Exclusive state/multi-state territory",
        "24/7 priority support (4hr response)",
        "Custom development hours included",
        "API white-labeling",
        "NFT badge revenue share (90/10)",
        "Full white-label app & branding",
        "Executive quarterly reviews",
        "First access to new features",
        "Sub-franchise rights"
      ],
      limitations: []
    }
  ];

  const comparisonPoints = [
    { label: "Hallmark Ownership", subscriber: "Managed by Lot Ops", franchise: "You Own It" },
    { label: "Serial Numbers", subscriber: "We Control", franchise: "You Control" },
    { label: "Data Ownership", subscriber: "Hosted by Us", franchise: "Fully Yours" },
    { label: "Branding", subscriber: "Limited Customization", franchise: "100% Custom" },
    { label: "Territory", subscriber: "None", franchise: "Exclusive Available" },
    { label: "NFT Badge Revenue", subscriber: "100% to Lot Ops", franchise: "70-90% to You" },
    { label: "Transfer/Sell", subscriber: "Not Allowed", franchise: "Full Rights" },
  ];

  const transferItems = [
    { value: "$2,500", label: "Transfer Fee", color: "text-white" },
    { value: "100%", label: "Data Transferred", color: "text-emerald-400" },
    { value: "Serial #s", label: "Preserved", color: "text-purple-400" },
    { value: "24hr", label: "Transfer Time", color: "text-blue-400" }
  ];

  const incomeStats = [
    { value: "3-5%", label: "Per Vehicle Royalty", desc: "Small percentage on each vehicle processed through your hallmark system" },
    { value: "$500-1.5K", label: "Monthly Support", desc: "Recurring support revenue based on tier level" },
    { value: "10-30%", label: "NFT Badge Share", desc: "Revenue share on all NFT badge sales through their system" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          data-testid="section-hero"
        >
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1">
            <Crown className="w-4 h-4 mr-2" />
            Franchise Opportunity
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Own Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Hallmark System</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Stop renting. Start owning. Transfer your subscriber hallmark to full franchise ownership 
            with exclusive territory rights, custom branding, and ongoing residual income.
          </p>
        </motion.div>

        <BentoGrid columns={2} gap="lg" className="mb-12">
          <BentoTile
            variant="glass"
            size="md"
            icon={<Lock className="w-5 h-5" />}
            title="Monthly Subscriber"
            description="What you have now"
            data-testid="tile-subscriber-comparison"
          >
            <div className="space-y-2 mt-2">
              {comparisonPoints.map((point, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-700/50 text-sm">
                  <span className="text-slate-400">{point.label}</span>
                  <span className="text-slate-500">{point.subscriber}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500 pt-2">
                $15-25/driver/month • No ownership • We control everything
              </p>
            </div>
          </BentoTile>

          <BentoTile
            variant="premium"
            size="md"
            sparkle
            icon={<Unlock className="w-5 h-5" />}
            title="Franchise Owner"
            description="What you could have"
            data-testid="tile-franchise-comparison"
          >
            <div className="space-y-2 mt-2">
              {comparisonPoints.map((point, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-amber-700/30 text-sm">
                  <span className="text-amber-200/80">{point.label}</span>
                  <span className="text-emerald-400 font-medium">{point.franchise}</span>
                </div>
              ))}
              <p className="text-xs text-amber-300/80 pt-2">
                One-time fee + low royalty • Full ownership • You control everything
              </p>
            </div>
          </BentoTile>
        </BentoGrid>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-tier-heading">
            Choose Your Franchise Tier
          </h2>
          
          <BentoGrid columns={3} gap="md">
            {franchiseTiers.map((tier) => (
              <BentoTile
                key={tier.id}
                variant={tier.featured ? "premium" : "glass"}
                size="tall"
                sparkle={tier.featured}
                badge={tier.featured ? "Most Popular" : undefined}
                data-testid={`tile-tier-${tier.id}`}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                    {tier.id === 'standard' && <Building2 className="w-6 h-6 text-white" />}
                    {tier.id === 'premium' && <Crown className="w-6 h-6 text-white" />}
                    {tier.id === 'enterprise' && <Briefcase className="w-6 h-6 text-white" />}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                  <p className={`text-sm mb-4 ${tier.featured ? 'text-amber-200/70' : 'text-slate-400'}`}>
                    {tier.description}
                  </p>

                  {showFranchiseOfferPricing ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Franchise Fee</span>
                        <span className="text-xl font-bold text-white">{tier.franchiseFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Royalty</span>
                        <span className="text-emerald-400 text-sm">{tier.royalty} {tier.royaltyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Support</span>
                        <span className="text-slate-300 text-sm">{tier.supportFee}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-violet-900/30 rounded-lg border border-violet-500/30 text-center mb-4">
                      <span className="text-violet-300 text-sm">Contact sales for pricing</span>
                    </div>
                  )}

                  <PremiumAccordion type="single" collapsible className="mb-4">
                    <PremiumAccordionItem value="features" variant={tier.featured ? "premium" : "glass"}>
                      <PremiumAccordionTrigger 
                        icon={<Sparkles className="w-4 h-4" />}
                        data-testid={`accordion-features-${tier.id}`}
                      >
                        View Features
                      </PremiumAccordionTrigger>
                      <PremiumAccordionContent>
                        <div className="space-y-2">
                          {tier.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span className={tier.featured ? 'text-amber-100' : 'text-slate-300'}>{feature}</span>
                            </div>
                          ))}
                          {tier.limitations.length > 0 && (
                            <div className="pt-2 border-t border-slate-700/50 mt-3">
                              <p className="text-xs text-slate-500 mb-1">Limitations:</p>
                              {tier.limitations.map((limit, i) => (
                                <p key={i} className="text-xs text-slate-500">• {limit}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </PremiumAccordionContent>
                    </PremiumAccordionItem>
                  </PremiumAccordion>

                  <div className="mt-auto">
                    <PremiumButton 
                      variant={tier.featured ? "premium" : "gradient"}
                      className="w-full"
                      onClick={() => setLocation('/pricing')}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      shine={tier.featured}
                      data-testid={`button-franchise-${tier.id}`}
                    >
                      Get Started
                    </PremiumButton>
                  </div>
                </div>
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        {showFranchiseOfferPricing && (
          <BentoGrid columns={1} gap="lg" className="mb-8">
            <BentoTile
              variant="gradient"
              size="lg"
              icon={<RefreshCcw className="w-5 h-5" />}
              title="Subscriber to Franchise Transfer"
              description="Already a subscriber? Transfer your existing hallmark to full franchise ownership"
              data-testid="tile-transfer-section"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {transferItems.map((item, i) => (
                  <div key={i} className="text-center p-3 bg-slate-800/50 rounded-lg" data-testid={`stat-transfer-${i}`}>
                    <div className={`text-2xl md:text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
                    <div className="text-xs text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
              
              <PremiumAccordion type="single" collapsible className="mt-4">
                <PremiumAccordionItem value="transfer-details" variant="glass">
                  <PremiumAccordionTrigger 
                    icon={<Package className="w-4 h-4" />}
                    description="See everything that gets migrated"
                    data-testid="accordion-transfer-details"
                  >
                    What Gets Transferred
                  </PremiumAccordionTrigger>
                  <PremiumAccordionContent>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-purple-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Your custom hallmark branding
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        All serial number systems
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Complete asset history
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Audit trail records
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Driver data & stats
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        NFT badge records
                      </div>
                    </div>
                  </PremiumAccordionContent>
                </PremiumAccordionItem>
              </PremiumAccordion>
            </BentoTile>
          </BentoGrid>
        )}

        {showFranchiseOfferPricing && (
          <BentoTile
            variant="glow"
            size="wide"
            sparkle
            icon={<TrendingUp className="w-5 h-5" />}
            title="Residual Income Potential"
            description="Your franchise generates ongoing revenue for Lot Ops Pro"
            className="mb-8 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-500/50"
            data-testid="tile-income-potential"
          >
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              {incomeStats.map((stat, i) => (
                <div key={i} className="text-center" data-testid={`stat-income-${i}`}>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-emerald-300 font-medium mb-1">{stat.label}</div>
                  <p className="text-sm text-slate-400">{stat.desc}</p>
                </div>
              ))}
            </div>
          </BentoTile>
        )}

        <div className="text-center" data-testid="section-cta">
          <PremiumButton 
            variant="premium"
            size="lg"
            onClick={() => setLocation('/pricing')}
            icon={<Crown className="w-5 h-5" />}
            shine
            pulse
            data-testid="button-start-franchise"
          >
            Start Your Franchise Journey
          </PremiumButton>
          <p className="text-sm text-slate-500 mt-4">
            Questions? Contact our franchise team at franchise@lotopspro.io
          </p>
        </div>
      </div>
    </div>
  );
}
