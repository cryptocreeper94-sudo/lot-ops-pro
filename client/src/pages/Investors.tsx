import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { 
  PremiumAccordion, 
  PremiumAccordionItem, 
  PremiumAccordionTrigger, 
  PremiumAccordionContent 
} from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { NavigationControl } from "@/components/NavigationControl";
import { Footer } from "@/components/Footer";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2, 
  Target, 
  Zap, 
  Shield, 
  Globe,
  BarChart3,
  Truck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Award,
  Layers
} from "lucide-react";

export default function Investors() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <NavigationControl variant="back" fallbackRoute="/" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-emerald-600 text-white mb-4" data-testid="badge-investment">Investment Opportunity</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-title">
            Lot Ops Pro
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto" data-testid="text-subtitle">
            Autonomous Lot Management System - Revolutionizing Auto Auction Operations
          </p>
          <p className="text-emerald-400 font-semibold mt-4 text-lg" data-testid="text-platform-type">
            White-Label Enterprise SaaS Platform
          </p>
        </div>

        {/* Key Metrics Grid with Bento Layout */}
        <BentoGrid columns={4} gap="md" className="mb-12">
          <BentoTile
            variant="gradient"
            sparkle
            icon={<DollarSign className="h-6 w-6" />}
            title="$2.5M+"
            description="Annual Market per Facility"
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700"
            data-testid="tile-annual-market"
          />
          <BentoTile
            variant="gradient"
            sparkle
            icon={<Building2 className="h-6 w-6" />}
            title="150+"
            description="Target Facilities (US)"
            className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700"
            data-testid="tile-facilities"
          />
          <BentoTile
            variant="gradient"
            sparkle
            icon={<TrendingUp className="h-6 w-6" />}
            title="35%"
            description="Efficiency Improvement"
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700"
            data-testid="tile-efficiency"
          />
          <BentoTile
            variant="gradient"
            sparkle
            icon={<Clock className="h-6 w-6" />}
            title="60%"
            description="Time Savings"
            className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-700"
            data-testid="tile-time-savings"
          />
        </BentoGrid>

        {/* Problem & Solution Accordions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <PremiumAccordion type="single" defaultValue="problem" collapsible>
            <PremiumAccordionItem value="problem" variant="gradient" className="bg-red-950/30 border-red-800/50">
              <PremiumAccordionTrigger 
                icon={<Target className="h-5 w-5 text-red-400" />}
              >
                <span className="text-red-400" data-testid="accordion-problem-title">The Problem</span>
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="space-y-3 text-slate-300" data-testid="accordion-problem-content">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <p>Manual lot operations cost auto auctions <span className="text-white font-semibold">$500K-$1M annually</span> in inefficiencies</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <p>Van drivers operate without GPS guidance, causing <span className="text-white font-semibold">30% wasted drive time</span></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <p>Paper-based tracking leads to <span className="text-white font-semibold">lost vehicles and delays</span></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <p>No real-time performance metrics or driver accountability</p>
                  </div>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>
          </PremiumAccordion>

          <PremiumAccordion type="single" defaultValue="solution" collapsible>
            <PremiumAccordionItem value="solution" variant="gradient" className="bg-emerald-950/30 border-emerald-800/50">
              <PremiumAccordionTrigger 
                icon={<Zap className="h-5 w-5 text-emerald-400" />}
              >
                <span className="text-emerald-400" data-testid="accordion-solution-title">Our Solution</span>
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="space-y-3 text-slate-300" data-testid="accordion-solution-content">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-emerald-400 h-4 w-4 mt-1 flex-shrink-0" />
                    <p><span className="text-white font-semibold">GPS-guided routing</span> optimizes every vehicle move</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-emerald-400 h-4 w-4 mt-1 flex-shrink-0" />
                    <p><span className="text-white font-semibold">Real-time tracking</span> of all drivers and vehicles</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-emerald-400 h-4 w-4 mt-1 flex-shrink-0" />
                    <p><span className="text-white font-semibold">OCR scanning</span> eliminates manual data entry</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-emerald-400 h-4 w-4 mt-1 flex-shrink-0" />
                    <p><span className="text-white font-semibold">Performance analytics</span> with MPH quotas and safety monitoring</p>
                  </div>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>
          </PremiumAccordion>
        </div>

        {/* Revenue Model - Premium Bento Tile */}
        <BentoTile
          size="hero"
          variant="premium"
          className="mb-12"
          interactive={false}
          data-testid="tile-revenue-model"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Revenue Model</h2>
          </div>
          <p className="text-slate-400 mb-6">Multi-stream SaaS revenue with enterprise licensing</p>
          
          <BentoGrid columns={3} gap="md">
            <BentoTile variant="glass" className="bg-slate-800/50 border-slate-700" interactive={false} data-testid="tile-facility-license">
              <h4 className="text-emerald-400 font-bold mb-2">Per-Facility License</h4>
              <p className="text-3xl font-bold text-white">$5,000<span className="text-lg text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">Enterprise tier with full features</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                <li>• Unlimited users</li>
                <li>• Custom branding</li>
                <li>• Priority support</li>
              </ul>
            </BentoTile>
            <BentoTile variant="glass" className="bg-slate-800/50 border-slate-700" interactive={false} data-testid="tile-driver-seat">
              <h4 className="text-blue-400 font-bold mb-2">Per-Driver Seat</h4>
              <p className="text-3xl font-bold text-white">$50<span className="text-lg text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">Avg 40-60 drivers per facility</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                <li>• Mobile app access</li>
                <li>• GPS tracking</li>
                <li>• Performance metrics</li>
              </ul>
            </BentoTile>
            <BentoTile variant="glass" className="bg-slate-800/50 border-slate-700" interactive={false} data-testid="tile-white-label">
              <h4 className="text-purple-400 font-bold mb-2">White-Label OEM</h4>
              <p className="text-3xl font-bold text-white">$25K+<span className="text-lg text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-1">Corporate multi-facility deals</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                <li>• Full platform rebrand</li>
                <li>• API integration</li>
                <li>• Dedicated support</li>
              </ul>
            </BentoTile>
          </BentoGrid>
        </BentoTile>

        {/* Market Opportunity Accordion */}
        <PremiumAccordion type="single" defaultValue="market" collapsible className="mb-12">
          <PremiumAccordionItem value="market" variant="premium" className="bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 border-blue-700/50">
            <PremiumAccordionTrigger 
              icon={<Globe className="h-5 w-5 text-blue-400" />}
              badge="Expanding"
            >
              <span className="text-white" data-testid="accordion-market-title">Market Opportunity</span>
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <div className="grid md:grid-cols-2 gap-8" data-testid="accordion-market-content">
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Total Addressable Market</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Manheim (Cox Automotive)</span>
                      <span className="text-white font-bold">76 locations</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">ADESA (Carvana)</span>
                      <span className="text-white font-bold">56 locations</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Copart/IAAI</span>
                      <span className="text-white font-bold">200+ locations</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Independent Auctions</span>
                      <span className="text-white font-bold">300+ locations</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">Total US Market</span>
                      <span className="text-emerald-400 font-bold text-xl" data-testid="text-total-market">600+ Facilities</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Revenue Potential</h4>
                  <BentoTile variant="glow" className="bg-slate-800/50 border-emerald-600/30" interactive={false} data-testid="tile-revenue-potential">
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Conservative 5-Year Projection</p>
                      <p className="text-4xl font-bold text-emerald-400 my-2" data-testid="text-arr-conservative">$50M+ ARR</p>
                      <p className="text-slate-400 text-sm">100 facilities @ $42K/yr average</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-400 text-sm text-center">Aggressive Projection</p>
                      <p className="text-3xl font-bold text-white text-center my-2" data-testid="text-arr-aggressive">$150M+ ARR</p>
                      <p className="text-slate-400 text-sm text-center">30% market penetration</p>
                    </div>
                  </BentoTile>
                </div>
              </div>
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>

        {/* Competitive Advantages - Bento Grid in Accordion */}
        <PremiumAccordion type="single" defaultValue="advantages" collapsible className="mb-12">
          <PremiumAccordionItem value="advantages" variant="glass">
            <PremiumAccordionTrigger 
              icon={<Award className="h-5 w-5 text-amber-400" />}
            >
              <span className="text-white" data-testid="accordion-advantages-title">Competitive Advantages</span>
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <BentoGrid columns={2} gap="md" data-testid="grid-advantages">
                <BentoTile variant="glass" className="bg-slate-800/50" interactive={false} data-testid="tile-expertise">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold">Industry Expertise</h4>
                      <p className="text-slate-400 text-sm">Built by auto auction insiders with 10+ years experience</p>
                    </div>
                  </div>
                </BentoTile>
                <BentoTile variant="glass" className="bg-slate-800/50" interactive={false} data-testid="tile-full-stack">
                  <div className="flex items-start gap-3">
                    <Layers className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold">Full-Stack Solution</h4>
                      <p className="text-slate-400 text-sm">No fragmented tools - complete lot management platform</p>
                    </div>
                  </div>
                </BentoTile>
                <BentoTile variant="glass" className="bg-slate-800/50" interactive={false} data-testid="tile-mobile-first">
                  <div className="flex items-start gap-3">
                    <Truck className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold">Mobile-First Design</h4>
                      <p className="text-slate-400 text-sm">99% mobile usage - designed for field operations</p>
                    </div>
                  </div>
                </BentoTile>
                <BentoTile variant="glass" className="bg-slate-800/50" interactive={false} data-testid="tile-role-based">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold">Role-Based Access</h4>
                      <p className="text-slate-400 text-sm">Granular permissions from drivers to executives</p>
                    </div>
                  </div>
                </BentoTile>
              </BentoGrid>
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>

        {/* Investment CTA - Premium Tile with Sparkle */}
        <BentoTile
          size="wide"
          variant="premium"
          sparkle
          className="mb-12"
          interactive={false}
          data-testid="tile-investment-cta"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Investment Inquiry</h2>
            </div>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Lot Ops Pro is actively seeking strategic partners and investors to accelerate market expansion. 
              Our proven technology and industry relationships position us for rapid growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton
                variant="premium"
                shine
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
                data-testid="button-pitch-deck"
              >
                Request Pitch Deck
              </PremiumButton>
              <PremiumButton
                variant="glass"
                data-testid="button-schedule-demo"
              >
                Schedule Demo
              </PremiumButton>
            </div>
            <p className="text-slate-500 text-sm mt-6" data-testid="text-contact">
              DarkWave Studios, LLC • Nashville, TN • contact@darkwavestudios.io
            </p>
          </div>
        </BentoTile>

        <Footer />
      </div>
    </div>
  );
}
