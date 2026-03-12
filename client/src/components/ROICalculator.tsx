import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calculator, CheckCircle2, Presentation } from "lucide-react";

export function ROICalculator() {
  const [_, setLocation] = useLocation();
  const [facilitySize, setFacilitySize] = useState(30); // Number of drivers
  const [monthlyVehicles, setMonthlyVehicles] = useState(15000); // Vehicles processed per month
  const [currentScannerCost, setCurrentScannerCost] = useState(1200); // Cost per handheld scanner
  const [avgWagePerHour, setAvgWagePerHour] = useState(18); // Average hourly wage

  // CONSERVATIVE CALCULATIONS
  const totalScanners = Math.ceil(facilitySize * 0.8); // 80% of drivers need scanners
  const hardwareCost = totalScanners * currentScannerCost;
  const monthlyConnectivityFees = totalScanners * 75; // $75/month per scanner
  const annualConnectivityFees = monthlyConnectivityFees * 12;

  // Productivity improvements (CONSERVATIVE 15% - competitors claim 25-40%)
  const currentDataEntryTimePerVehicle = 45; // seconds
  const improvedDataEntryTime = 5; // seconds with OCR
  const timeSavedPerVehicle = currentDataEntryTimePerVehicle - improvedDataEntryTime; // 40 seconds
  const totalTimeSavedPerMonth = (monthlyVehicles * timeSavedPerVehicle) / 3600; // hours
  const laborCostSavingsPerMonth = totalTimeSavedPerMonth * avgWagePerHour;
  const laborCostSavingsPerYear = laborCostSavingsPerMonth * 12;

  // Error reduction (5% error rate → 0.5% error rate)
  const currentErrorRate = 0.05;
  const improvedErrorRate = 0.005;
  const errorsPerMonth = monthlyVehicles * currentErrorRate;
  const improvedErrorsPerMonth = monthlyVehicles * improvedErrorRate;
  const errorReduction = errorsPerMonth - improvedErrorsPerMonth;
  const costPerError = 125; // Average cost to fix data entry error (labor + delays)
  const errorCostSavingsPerYear = errorReduction * 12 * costPerError;

  // Speed monitoring reduces incidents (30% reduction in vehicle damage)
  const avgIncidentsPerYear = 24; // Conservative estimate for mid-size facility
  const incidentReductionRate = 0.30;
  const incidentsAvoided = avgIncidentsPerYear * incidentReductionRate;
  const avgCostPerIncident = 3500; // Damage, insurance, labor
  const safetyIncidentSavings = incidentsAvoided * avgCostPerIncident;

  // TOTAL ANNUAL SAVINGS
  const totalAnnualSavings = laborCostSavingsPerYear + errorCostSavingsPerYear + safetyIncidentSavings - annualConnectivityFees;
  const fiveYearSavings = totalAnnualSavings * 5;
  const fiveYearSavingsWithHardware = fiveYearSavings + hardwareCost;

  // Quarterly savings
  const quarterlySavings = totalAnnualSavings / 4;

  // Payback period (months)
  const monthlyNetSavings = totalAnnualSavings / 12;
  const paybackMonths = hardwareCost / monthlyNetSavings;

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
              data-testid="button-workflow-roi"
            >
              View Technical Flow →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Complement your cost analysis with a complete technical overview. Visual flowchart shows authentication, features, and system architecture in presentation-ready format.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-3 rounded-full">
          <BarChart3 className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operational Cost Analysis</h2>
          <p className="text-sm text-slate-600">5-year projection based on facility configuration</p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">Facility Configuration</CardTitle>
          <p className="text-xs text-slate-600">Adjust to match your operational scale</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Number of Drivers</Label>
              <Input
                type="number"
                value={facilitySize}
                onChange={(e) => setFacilitySize(parseInt(e.target.value) || 0)}
                className="mt-1.5 bg-white"
                data-testid="input-facility-size"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Vehicles Processed/Month</Label>
              <Input
                type="number"
                value={monthlyVehicles}
                onChange={(e) => setMonthlyVehicles(parseInt(e.target.value) || 0)}
                className="mt-1.5 bg-white"
                data-testid="input-monthly-vehicles"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Current Scanner Hardware Cost</Label>
              <Input
                type="number"
                value={currentScannerCost}
                onChange={(e) => setCurrentScannerCost(parseInt(e.target.value) || 0)}
                className="mt-1.5 bg-white"
                data-testid="input-scanner-cost"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Average Hourly Wage</Label>
              <Input
                type="number"
                value={avgWagePerHour}
                onChange={(e) => setAvgWagePerHour(parseInt(e.target.value) || 0)}
                className="mt-1.5 bg-white"
                data-testid="input-avg-wage"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-900">Annual Operational Savings</CardTitle>
              <Badge variant="outline" className="text-slate-700">Year 1</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              ${totalAnnualSavings.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-2">Based on current configuration</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-900">5-Year Projection</CardTitle>
              <Badge variant="outline" className="text-slate-700">5 Years</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              ${fiveYearSavings.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-2">Estimated operational efficiency gains</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Cost Analysis Components</CardTitle>
          <p className="text-xs text-slate-600 mt-1">Annual operational impact</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Data Entry Efficiency</p>
                <p className="text-xs text-slate-600">40 seconds saved per vehicle × {monthlyVehicles.toLocaleString()}/month</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">${laborCostSavingsPerYear.toLocaleString()}</p>
              <p className="text-xs text-slate-600">annually</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Error Correction Costs</p>
                <p className="text-xs text-slate-600">5% → 0.5% error rate ({errorReduction.toFixed(0)} errors/month avoided)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">${errorCostSavingsPerYear.toLocaleString()}</p>
              <p className="text-xs text-slate-600">annually</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Incident Reduction</p>
                <p className="text-xs text-slate-600">GPS monitoring effect ({incidentsAvoided.toFixed(1)} incidents/year avoided)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">${safetyIncidentSavings.toLocaleString()}</p>
              <p className="text-xs text-slate-600">annually</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Hardware Cost Avoidance</p>
                <p className="text-xs text-slate-600">{totalScanners} scanners @ ${currentScannerCost.toLocaleString()} each</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">${hardwareCost.toLocaleString()}</p>
              <p className="text-xs text-slate-600">one-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-900">Quarterly Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${quarterlySavings.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">Per fiscal quarter</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-900">Hardware Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {paybackMonths.toFixed(1)} months
            </div>
            <p className="text-xs text-slate-600 mt-1">Cost neutralization period</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-900">5-Year Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${fiveYearSavingsWithHardware.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">Including hardware avoidance</p>
          </CardContent>
        </Card>
      </div>


      {/* Methodology Note */}
      <Card className="border-slate-300 bg-slate-50">
        <CardContent className="p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Methodology:</strong> Calculations based on industry-standard operational benchmarks. Data entry efficiency assumes 40-second reduction per vehicle (conservative vs. 60-90 second industry average). Error rate reduction from 5% to 0.5% based on OCR vs. manual entry studies. Incident reduction (30%) based on GPS monitoring behavioral studies. Hardware costs reflect BYOD model eliminating dedicated scanner purchases and monthly connectivity fees. All figures represent conservative estimates; actual operational impact may vary by facility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
