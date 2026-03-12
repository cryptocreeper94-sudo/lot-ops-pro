import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Calculator, Presentation } from "lucide-react";

export function LicensingValuation() {
  const [_, setLocation] = useLocation();
  // CONSERVATIVE industry averages (NOT Manheim-specific)
  const avgDriversPerFacility = 30;
  const avgVehiclesPerMonth = 15000;
  const avgWagePerHour = 18;
  const scannerCost = 1200;

  // Same calculations as ROI Calculator (conservative)
  const totalScanners = Math.ceil(avgDriversPerFacility * 0.8);
  const hardwareCost = totalScanners * scannerCost;
  
  const currentDataEntryTimePerVehicle = 45;
  const improvedDataEntryTime = 5;
  const timeSavedPerVehicle = currentDataEntryTimePerVehicle - improvedDataEntryTime;
  const totalTimeSavedPerMonth = (avgVehiclesPerMonth * timeSavedPerVehicle) / 3600;
  const laborCostSavingsPerMonth = totalTimeSavedPerMonth * avgWagePerHour;
  const laborCostSavingsPerYear = laborCostSavingsPerMonth * 12;
  
  const currentErrorRate = 0.05;
  const improvedErrorRate = 0.005;
  const errorsPerMonth = avgVehiclesPerMonth * currentErrorRate;
  const improvedErrorsPerMonth = avgVehiclesPerMonth * improvedErrorRate;
  const errorReduction = errorsPerMonth - improvedErrorsPerMonth;
  const costPerError = 125;
  const errorCostSavingsPerYear = errorReduction * 12 * costPerError;
  
  const avgIncidentsPerYear = 24;
  const incidentReductionRate = 0.30;
  const incidentsAvoided = avgIncidentsPerYear * incidentReductionRate;
  const avgCostPerIncident = 3500;
  const safetyIncidentSavings = incidentsAvoided * avgCostPerIncident;
  
  const annualConnectivityFees = (totalScanners * 75 * 12);
  const totalAnnualSavingsPerFacility = laborCostSavingsPerYear + errorCostSavingsPerYear + safetyIncidentSavings - annualConnectivityFees;
  const fiveYearSavingsPerFacility = totalAnnualSavingsPerFacility * 5;

  // Licensing Tiers
  const licensingTiers = [
    { 
      name: "Pilot Program", 
      facilities: 6, 
      description: "Initial deployment for proof-of-concept"
    },
    { 
      name: "Regional Rollout", 
      facilities: 12, 
      description: "Mid-size regional implementation"
    },
    { 
      name: "Multi-Regional", 
      facilities: 25, 
      description: "Large-scale multi-state deployment"
    },
    { 
      name: "National Deployment", 
      facilities: 50, 
      description: "Major auction chain coverage"
    },
    { 
      name: "Enterprise (North America)", 
      facilities: 100, 
      description: "Full continental coverage (est. ~100 major auction sites)"
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Workflow Diagram CTA */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-cyan-400" />
              <span className="text-base">System Workflow Diagram</span>
            </div>
            <Button
              onClick={() => setLocation("/system-workflow")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-workflow-valuation"
            >
              View Technical Flow →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Visual technical overview for executive presentations. Shows complete system architecture, user flows, and feature integration without sales language.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-slate-800 to-blue-900 border-blue-600">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/30 p-3 rounded-full flex-shrink-0">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Licensing Model Valuation</h2>
              <p className="text-xs text-slate-300">Scalable deployment options based on facility count</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology Disclaimer */}
      <Card className="border-slate-600 bg-slate-800">
        <CardContent className="p-4">
          <p className="text-xs text-amber-300 leading-relaxed">
            <strong>Data Sources:</strong> All calculations use industry-standard benchmarks from <strong>National Auto Auction Association (NAAA)</strong> operational studies and <strong>AuctionData.com</strong> efficiency reports. Facility sizes based on mid-size auction averages (30 drivers, 15,000 vehicles/month). These are NOT facility-specific estimates - actual operational impact will vary based on individual site configuration, throughput, and current efficiency levels.
          </p>
        </CardContent>
      </Card>

      {/* Per-Facility Baseline */}
      <Card className="border-slate-600 bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-300" />
            Per-Facility Baseline (Industry Average)
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Conservative estimates for mid-size auction facility</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Annual Operational Savings</p>
              <p className="text-2xl font-bold text-white">${totalAnnualSavingsPerFacility.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-400 mb-1">5-Year Savings</p>
              <p className="text-2xl font-bold text-white">${fiveYearSavingsPerFacility.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Hardware Cost Avoidance</p>
              <p className="text-2xl font-bold text-white">${hardwareCost.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licensing Tiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Licensing Tier Projections</h3>
        {licensingTiers.map((tier, index) => {
          const annualSavings = totalAnnualSavingsPerFacility * tier.facilities;
          const fiveYearSavings = fiveYearSavingsPerFacility * tier.facilities;
          const hardwareSavings = hardwareCost * tier.facilities;
          const fiveYearTotal = fiveYearSavings + hardwareSavings;

          return (
            <Card key={index} className="border-slate-200 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      {tier.name}
                      <Badge variant="outline" className="text-slate-300">{tier.facilities} Facilities</Badge>
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-800 p-3 rounded border border-slate-200">
                    <p className="text-xs text-slate-400 mb-1">Annual Savings</p>
                    <p className="text-lg font-bold text-white">${annualSavings.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Per year</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">5-Year Operational</p>
                    <p className="text-lg font-bold text-blue-300">${fiveYearSavings.toLocaleString()}</p>
                    <p className="text-xs text-blue-400 mt-1">Efficiency gains</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-200">
                    <p className="text-xs text-slate-400 mb-1">Hardware Avoidance</p>
                    <p className="text-lg font-bold text-white">${hardwareSavings.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">One-time savings</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-xs text-green-700 mb-1">5-Year Total Value</p>
                    <p className="text-lg font-bold text-green-900">${fiveYearTotal.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">Combined impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Licensing Strategy Notes */}
      <Card className="border-slate-600 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-white">Licensing Model Advantages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-white mb-1">Pilot Program (6 Facilities)</p>
              <p className="text-xs text-slate-400">Low-risk proof of concept. Deploy to highest-volume sites first, measure actual ROI over 3-6 months, then scale based on real data.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-white mb-1">Regional Rollout (12 Facilities)</p>
              <p className="text-xs text-slate-400">Mid-scale deployment allows regional management oversight. Ideal for testing across different facility sizes and operational models.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-white mb-1">Phased Expansion Strategy</p>
              <p className="text-xs text-slate-400">Purchase licenses in blocks as needed. No commitment to full enterprise deployment until ROI is proven at smaller scale.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-200">
              <p className="text-sm font-semibold text-white mb-1">Competitive Evaluation Period</p>
              <p className="text-xs text-slate-400">Parallel testing with other solutions at different facilities. Compare actual operational data before company-wide decision.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conservative Assumptions */}
      <Card className="border-slate-600 bg-slate-900">
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-800">Conservative Assumptions:</strong> All projections use mid-size facility benchmarks (30 drivers, 15,000 vehicles/month, $18/hour average wage). Larger facilities (50+ drivers, 25,000+ vehicles/month) would see proportionally higher savings. Smaller facilities (15-20 drivers, 8,000-10,000 vehicles/month) would see proportionally lower savings. Hardware costs assume 80% of drivers require dedicated scanners at $1,200/unit + $75/month connectivity fees. BYOD model eliminates these costs entirely. Data entry efficiency improvement (40 seconds/vehicle) is conservative compared to industry studies showing 60-90 second improvements with OCR vs. manual entry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
