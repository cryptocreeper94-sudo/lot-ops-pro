import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, DollarSign, Layers, CreditCard, Briefcase, BarChart3, Clock } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

export default function SalesDashboard() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }

    const userData = JSON.parse(userStr);
    if (!["developer", "operations_manager", "sales_person"].includes(userData.role)) {
      setLocation("/dashboard");
      return;
    }
    
    if (["supervisor", "driver", "inventory", "safety_advisor"].includes(userData.role)) {
      setLocation("/dashboard");
      return;
    }

    setUser(userData);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealsRes, prospectsRes] = await Promise.all([
        fetch("/api/crm/deals"),
        fetch("/api/crm/prospects"),
      ]);

      if (dealsRes.ok) setDeals(await dealsRes.json());
      if (prospectsRes.ok) setProspects(await prospectsRes.json());
    } catch (error) {
      console.error("Failed to fetch CRM data:", error);
    }
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const closedDeals = deals.filter((d) => d.stage === "closed_won").length;
  const conversionRate = deals.length > 0 ? Math.round((closedDeals / deals.length) * 100) : 0;

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NavigationControl variant="back" fallbackRoute="/dashboard" />
            <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="text-page-title">Sales Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <PremiumButton 
              variant="glass"
              icon={<Clock className="h-4 w-4" />}
              disabled
              data-testid="button-arena-staging"
            >
              Arena (Soon)
            </PremiumButton>
            <PremiumButton 
              onClick={() => setLocation("/business-card")} 
              variant="glass"
              icon={<CreditCard className="h-4 w-4" />}
              data-testid="button-business-card"
            >
              My Card
            </PremiumButton>
            {["developer", "operations_manager"].includes(user?.role) && (
              <PremiumButton 
                onClick={() => setLocation("/sales-force")} 
                variant="primary"
                icon={<Briefcase className="h-4 w-4" />}
                data-testid="button-sales-force"
              >
                Sales Force
              </PremiumButton>
            )}
          </div>
        </div>

        <BentoGrid columns={4} gap="md">
          <BentoTile
            variant="glow"
            sparkle
            icon={<DollarSign className="h-6 w-6" />}
            title="Pipeline Value"
            className="border-blue-500/30"
            data-testid="tile-pipeline-value"
          >
            <p className="text-3xl font-bold text-white" data-testid="text-pipeline-value">
              ${(totalPipelineValue / 1000).toFixed(1)}K
            </p>
          </BentoTile>

          <BentoTile
            variant="gradient"
            sparkle
            icon={<TrendingUp className="h-6 w-6" />}
            title="Closed Deals"
            className="border-green-500/30"
            data-testid="tile-closed-deals"
          >
            <p className="text-3xl font-bold text-white" data-testid="text-closed-deals">
              {closedDeals}
            </p>
          </BentoTile>

          <BentoTile
            variant="glass"
            sparkle
            icon={<Target className="h-6 w-6" />}
            title="Active Prospects"
            className="border-purple-500/30"
            data-testid="tile-active-prospects"
          >
            <p className="text-3xl font-bold text-white" data-testid="text-active-prospects">
              {prospects.length}
            </p>
          </BentoTile>

          <BentoTile
            variant="premium"
            sparkle
            icon={<Users className="h-6 w-6" />}
            title="Conversion Rate"
            data-testid="tile-conversion-rate"
          >
            <p className="text-3xl font-bold text-white" data-testid="text-conversion-rate">
              {conversionRate}%
            </p>
          </BentoTile>
        </BentoGrid>

        <PremiumAccordion type="multiple" defaultValue={["pipeline", "deals"]}>
          <PremiumAccordionItem value="pipeline" variant="gradient">
            <PremiumAccordionTrigger 
              icon={<BarChart3 className="h-5 w-5" />}
              badge={`${deals.length} Total`}
              description="View deals organized by sales stage"
            >
              Active Deals by Stage
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <SwipeCarousel itemWidth="200px" gap={12} showPeek>
                {["prospecting", "qualification", "negotiation", "closed_won"].map((stage) => {
                  const stageDeals = deals.filter((d) => d.stage === stage);
                  const value = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
                  return (
                    <div 
                      key={stage} 
                      className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 h-full"
                      data-testid={`card-stage-${stage}`}
                    >
                      <p className="text-white font-semibold capitalize mb-1">{stage.replace(/_/g, " ")}</p>
                      <p className="text-slate-400 text-sm mb-2">{stageDeals.length} deals</p>
                      <p className="text-2xl font-bold text-primary" data-testid={`text-stage-value-${stage}`}>
                        ${(value / 1000).toFixed(1)}K
                      </p>
                    </div>
                  );
                })}
              </SwipeCarousel>
            </PremiumAccordionContent>
          </PremiumAccordionItem>

          <PremiumAccordionItem value="deals" variant="glass">
            <PremiumAccordionTrigger 
              icon={<Target className="h-5 w-5" />}
              badge={deals.length > 0 ? `${deals.slice(0, 10).length} Shown` : "0"}
              description="Latest deals in your pipeline"
            >
              Recent Deals
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              {deals.length > 0 ? (
                <SwipeCarousel itemWidth="280px" gap={16} showPeek>
                  {deals.slice(0, 10).map((deal) => (
                    <div 
                      key={deal.id} 
                      className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50 h-full"
                      data-testid={`card-deal-${deal.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className="text-white font-semibold truncate" data-testid={`text-deal-name-${deal.id}`}>
                          {deal.dealName}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={
                            deal.stage === "closed_won"
                              ? "bg-green-600/80 text-white shrink-0"
                              : "bg-blue-600/80 text-white shrink-0"
                          }
                          data-testid={`badge-deal-stage-${deal.id}`}
                        >
                          {deal.stage?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Value</span>
                          <span className="text-white font-medium" data-testid={`text-deal-value-${deal.id}`}>
                            ${deal.value || "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Probability</span>
                          <span className="text-slate-300" data-testid={`text-deal-probability-${deal.id}`}>
                            {deal.probability || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </SwipeCarousel>
              ) : (
                <div className="text-center py-8 text-slate-400" data-testid="text-no-deals">
                  No deals available yet. Start prospecting to build your pipeline!
                </div>
              )}
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>

        <BentoGrid columns={2} gap="md">
          <BentoTile
            variant="glass"
            size="lg"
            icon={<Clock className="h-6 w-6" />}
            title="Arena Staging"
            description="Sale day operations coming in a future update"
            action={
              <Badge variant="secondary">Coming Soon</Badge>
            }
            data-testid="tile-arena-staging"
          />
          <BentoTile
            variant="gradient"
            size="lg"
            icon={<Briefcase className="h-6 w-6" />}
            title="Sales Tools"
            description="Access your business card and sales resources"
            action={
              <div className="flex gap-2">
                <PremiumButton 
                  variant="glass" 
                  size="sm"
                  onClick={() => setLocation("/business-card")}
                  data-testid="button-view-card"
                >
                  View Card
                </PremiumButton>
                {["developer", "operations_manager"].includes(user?.role) && (
                  <PremiumButton 
                    variant="primary" 
                    size="sm"
                    onClick={() => setLocation("/sales-force")}
                    data-testid="button-manage-force"
                  >
                    Manage
                  </PremiumButton>
                )}
              </div>
            }
            data-testid="tile-sales-tools"
          />
        </BentoGrid>
      </div>
    </div>
  );
}
