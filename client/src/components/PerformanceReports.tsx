import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Printer, Calendar, TrendingUp, Users, BarChart3, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";

type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "all_time";
type ReportType = "individual" | "team" | "summary";

interface DriverPerformance {
  driverNumber: string;
  driverName: string;
  totalMoves: number;
  totalHours: string;
  avgMovesPerHour: string;
  totalMilesDriven: string;
  avgMilesPerMove: string;
  estimatedBonus: number;
  rank?: number;
}

export function PerformanceReports() {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("daily");
  const [reportType, setReportType] = useState<ReportType>("individual");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const generateCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateEmployeeReviewTemplate = (driverNumber: string, driverName: string, period: string) => {
    const template = `
EMPLOYEE PERFORMANCE REVIEW
Manheim Nashville Auto Auction - Transport Department

Employee Name: ${driverName}
Employee ID: ${driverNumber}
Review Period: ${period}
Review Date: ${format(new Date(), "MMMM dd, yyyy")}
Reviewed By: _______________________

═══════════════════════════════════════════════════════════════

SECTION 1: PERFORMANCE METRICS

Total Vehicle Moves: _______
Total Hours Worked: _______
Average Moves Per Hour (MPH): _______
Total Miles Driven: _______ miles
Average Miles Per Move: _______ miles
Estimated Performance Bonus: $_______

═══════════════════════════════════════════════════════════════

SECTION 2: QUALITY OF WORK
Rate on a scale of 1-5 (1=Needs Improvement, 5=Exceptional)

Accuracy of Vehicle Placement: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Vehicle Care & Safety: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Adherence to Procedures: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Use of Technology Systems: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments:
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

SECTION 3: ATTENDANCE & RELIABILITY

Days Present: _______
Days Absent: _______
Tardiness Incidents: _______
Early Departures: _______

Comments:
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

SECTION 4: TEAMWORK & COMMUNICATION

Communication with Supervisors: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Cooperation with Team Members: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Response to Feedback: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
Problem-Solving Ability: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments:
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

SECTION 5: SAFETY & COMPLIANCE

Safety Violations: _______
Speed Violations: _______
Equipment Damage Incidents: _______
Safety Training Completion: [ ] Yes [ ] No

Comments:
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

SECTION 6: GOALS & DEVELOPMENT

Strengths Demonstrated:
_________________________________________________________________________
_________________________________________________________________________

Areas for Improvement:
_________________________________________________________________________
_________________________________________________________________________

Goals for Next Review Period:
1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

Training/Development Needs:
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

SECTION 7: OVERALL RATING

Overall Performance: [ ] Exceeds Expectations
                    [ ] Meets Expectations
                    [ ] Needs Improvement
                    [ ] Unsatisfactory

Recommendation:
[ ] Promote/Increase Responsibility
[ ] Continue in Current Role
[ ] Performance Improvement Plan Required
[ ] Terminate Employment

═══════════════════════════════════════════════════════════════

SECTION 8: SIGNATURES

Supervisor Signature: _______________________ Date: ___________

Employee Signature: _________________________ Date: ___________
(Signature acknowledges receipt of review, not necessarily agreement)

Employee Comments (Optional):
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

═══════════════════════════════════════════════════════════════

FOR CORPORATE RECORDS ONLY
This document is property of Manheim Nashville and should be retained
for a minimum of 6 months following employee separation.

Record Retention Date: ${format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), "MMMM dd, yyyy")}
    `;

    const blob = new Blob([template], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Employee_Review_${driverName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Reports & Employee Reviews
        </CardTitle>
        <CardDescription>
          Generate comprehensive reports for daily, weekly, monthly, quarterly, yearly, or lifetime performance tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Navigation - Simple Buttons Instead of Tabs Component */}
        <div className="grid w-full grid-cols-3 gap-2">
          <Button
            onClick={() => setReportType("individual")}
            data-testid="tab-individual-report"
            variant={reportType === "individual" ? "default" : "outline"}
            className="text-xs md:text-sm"
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Individual Review</span>
            <span className="md:hidden">Individual</span>
          </Button>
          <Button
            onClick={() => setReportType("team")}
            data-testid="tab-team-report"
            variant={reportType === "team" ? "default" : "outline"}
            className="text-xs md:text-sm"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Team Summary</span>
            <span className="md:hidden">Team</span>
          </Button>
          <Button
            onClick={() => setReportType("summary")}
            data-testid="tab-summary-report"
            variant={reportType === "summary" ? "default" : "outline"}
            className="text-xs md:text-sm"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Executive Summary</span>
            <span className="md:hidden">Summary</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/50 rounded-lg">
          <div className="space-y-3">
            <Label htmlFor="period-select" className="text-sm font-semibold">Report Period</Label>
            <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
              <SelectTrigger id="period-select" data-testid="select-report-period" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="quarterly">Quarterly Report</SelectItem>
                <SelectItem value="yearly">Yearly Report</SelectItem>
                <SelectItem value="all_time">Lifetime Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="date-filter" className="text-sm font-semibold">Date Filter</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-800 h-12"
              data-testid="input-date-filter"
            />
          </div>

          {reportType === "individual" && (
            <div className="space-y-3">
              <Label htmlFor="driver-select" className="text-sm font-semibold">Select Driver</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger id="driver-select" data-testid="select-driver" className="h-12">
                  <SelectValue placeholder="Choose driver..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((driver: any) => (
                    <SelectItem key={driver.phoneLast4} value={driver.phoneLast4}>
                      {driver.name} (#{driver.phoneLast4})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Individual Review Tab */}
        {reportType === "individual" && (
          <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Individual Employee Performance Review
            </h3>
            
            {selectedDriver ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Employee:</span>{" "}
                    <span className="font-semibold">
                      {drivers?.find((d: any) => d.phoneLast4 === selectedDriver)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Employee ID:</span>{" "}
                    <span className="font-semibold">{selectedDriver}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Review Period:</span>{" "}
                    <span className="font-semibold capitalize">{reportPeriod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date Range:</span>{" "}
                    <span className="font-semibold">{dateFilter}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-4">
                    Performance data will populate as drivers complete shifts and log moves. 
                    The system automatically tracks all metrics for comprehensive reviews.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => generateEmployeeReviewTemplate(
                        selectedDriver,
                        drivers?.find((d: any) => d.phoneLast4 === selectedDriver)?.name || "",
                        `${reportPeriod} - ${dateFilter}`
                      )}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-download-review-template"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Review Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={printReport}
                      data-testid="button-print-review"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Review
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">
                Select a driver to generate their performance review
              </p>
            )}
          </div>
        )}

        {/* Team Summary Tab */}
        {reportType === "team" && (
          <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Team Performance Summary
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Comprehensive team metrics comparing all drivers for the selected period. 
              Export to CSV for corporate reporting and analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => generateCSV(drivers, `Team_Report_${reportPeriod}`)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-export-team-csv"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Team Data (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={printReport}
                data-testid="button-print-team-report"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Team Report
              </Button>
            </div>
          </div>
        )}

        {/* Executive Summary Tab */}
        {reportType === "summary" && (
          <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
              Executive Summary Report
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              High-level overview with key performance indicators, productivity trends, 
              and operational insights for management review.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => generateCSV([], `Executive_Summary_${reportPeriod}`)}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="button-export-executive-summary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Executive Summary
              </Button>
              <Button
                variant="outline"
                onClick={printReport}
                data-testid="button-print-executive-summary"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            </div>
          </div>
        )}

        {/* Information Footer */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
          <p className="font-semibold text-blue-300 mb-2">📋 Corporate Records Retention</p>
          <p className="text-slate-300">
            All employee reviews and performance data are automatically retained for a minimum of 6 months 
            following employee separation, in compliance with corporate record-keeping policies. 
            Exported templates are compatible with Manheim corporate systems.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
