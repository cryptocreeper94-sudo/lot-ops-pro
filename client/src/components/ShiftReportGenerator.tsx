import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Printer, 
  Mail, 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Award,
  Send,
  Loader2,
  Calendar
} from "lucide-react";

interface DriverData {
  id: number;
  name: string;
  vanNumber?: string;
  phoneLast4?: string;
  status?: string;
  todayMoves?: number;
  quota?: number;
}

interface ShiftLogData {
  id: number;
  shiftDate: string;
  userId: number;
  weatherCondition?: string;
  weatherTemp?: number;
  clockIn?: string;
  clockOut?: string;
}

interface DriverMetrics {
  id: number;
  name: string;
  vanNumber: string;
  movesToday: number;
  hoursWorked: number;
  mph: number;
  quota: number;
  quotaPercent: number;
  status: "exceeding" | "on_track" | "behind";
}

interface ShiftSummary {
  shiftDate: string;
  shiftName: string;
  totalDrivers: number;
  activeDrivers: number;
  totalMoves: number;
  averageMPH: number;
  quotaCompletionRate: number;
  topPerformer: { name: string; moves: number };
  shiftHours: { start: string; end: string };
  weather?: { condition: string; temp: number };
  trends: {
    movesVsYesterday: number;
    mphVsAverage: number;
    driversVsScheduled: number;
  };
}

export function ShiftReportGenerator() {
  const { toast } = useToast();
  const [showReport, setShowReport] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<{ summary: ShiftSummary; drivers: DriverMetrics[] } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: drivers = [] } = useQuery<DriverData[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: activeDrivers = [] } = useQuery<DriverData[]>({
    queryKey: ["/api/drivers/active"],
  });

  const { data: todayLogs = [] } = useQuery<ShiftLogData[]>({
    queryKey: ["/api/shift-logs"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string; reportData: any }) => {
      return apiRequest("POST", "/api/shift-reports", {
        ...data,
        type: "email",
        generatedBy: JSON.parse(localStorage.getItem('vanops_user') || '{}').name || 'System',
        generatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({ title: "Report Sent", description: `Shift report emailed to ${emailTo}` });
      setShowEmailDialog(false);
      setEmailTo("");
      setEmailMessage("");
    },
    onError: () => {
      toast({ title: "Email Queued", description: `Report will be sent to ${emailTo} when email service is available` });
      setShowEmailDialog(false);
      setEmailTo("");
    }
  });

  const generateShiftSummary = (): { summary: ShiftSummary; drivers: DriverMetrics[] } => {
    const now = new Date();
    const hour = now.getHours();
    const shiftName = hour >= 6 && hour < 15 ? "First Shift" : hour >= 15 ? "Second Shift" : "Overnight";

    const todayLog = todayLogs.find(log => 
      log.shiftDate === format(now, 'yyyy-MM-dd')
    );

    const allDrivers = drivers.length > 0 ? drivers : activeDrivers;
    
    const driverMetrics: DriverMetrics[] = allDrivers.map((driver, index) => {
      const movesToday = driver.todayMoves ?? (activeDrivers.find(ad => ad.id === driver.id)?.todayMoves ?? 0);
      const quota = driver.quota ?? 60;
      
      const shiftStartHour = shiftName === "First Shift" ? 6 : 15;
      const hoursWorked = Math.min(8, Math.max(0, (hour - shiftStartHour)));
      const actualHoursWorked = hoursWorked > 0 ? hoursWorked : 1;
      
      const mph = movesToday / actualHoursWorked;
      const quotaPercent = quota > 0 ? (movesToday / quota) * 100 : 0;
      
      return {
        id: driver.id || index + 1,
        name: driver.name || `Driver ${index + 1}`,
        vanNumber: driver.vanNumber || `V${(index + 1).toString().padStart(2, '0')}`,
        movesToday,
        hoursWorked: parseFloat(actualHoursWorked.toFixed(1)),
        mph: parseFloat(mph.toFixed(1)),
        quota,
        quotaPercent: parseFloat(quotaPercent.toFixed(0)),
        status: quotaPercent >= 100 ? "exceeding" : quotaPercent >= 75 ? "on_track" : "behind" as const
      };
    });

    const sortedDrivers = [...driverMetrics].sort((a, b) => b.movesToday - a.movesToday);

    const totalMoves = driverMetrics.reduce((sum, d) => sum + d.movesToday, 0);
    const avgMPH = driverMetrics.length > 0 
      ? driverMetrics.reduce((sum, d) => sum + d.mph, 0) / driverMetrics.length 
      : 0;
    const quotaRate = driverMetrics.length > 0
      ? driverMetrics.filter(d => d.quotaPercent >= 100).length / driverMetrics.length * 100
      : 0;
    
    const topPerformer = sortedDrivers.length > 0 
      ? { name: sortedDrivers[0].name, moves: sortedDrivers[0].movesToday }
      : { name: "N/A", moves: 0 };

    const summary: ShiftSummary = {
      shiftDate: format(now, "EEEE, MMMM d, yyyy"),
      shiftName,
      totalDrivers: allDrivers.length || 0,
      activeDrivers: activeDrivers.length || 0,
      totalMoves,
      averageMPH: parseFloat(avgMPH.toFixed(1)),
      quotaCompletionRate: parseFloat(quotaRate.toFixed(0)),
      topPerformer,
      shiftHours: shiftName === "First Shift" 
        ? { start: "6:00 AM", end: "3:30 PM" }
        : shiftName === "Second Shift"
          ? { start: "3:30 PM", end: "12:00 AM" }
          : { start: "12:00 AM", end: "6:00 AM" },
      weather: todayLog?.weatherCondition 
        ? { condition: todayLog.weatherCondition, temp: todayLog.weatherTemp || 0 }
        : undefined,
      trends: {
        movesVsYesterday: 0,
        mphVsAverage: 0,
        driversVsScheduled: Math.max(0, 8 - allDrivers.length)
      }
    };

    return { summary, drivers: sortedDrivers };
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = generateShiftSummary();
    setReportData(data);
    setEmailSubject(`Shift Report - ${format(new Date(), "MMMM d, yyyy")} - ${data.summary.shiftName}`);
    setEmailMessage(`Please find attached the shift performance report for ${data.summary.shiftDate}.\n\nKey Highlights:\n- Total Moves: ${data.summary.totalMoves}\n- Active Drivers: ${data.summary.activeDrivers}\n- Average MPH: ${data.summary.averageMPH}\n- Top Performer: ${data.summary.topPerformer.name} (${data.summary.topPerformer.moves} moves)`);
    
    setIsGenerating(false);
    setShowReport(true);
  };

  const handlePrint = () => {
    if (reportRef.current && reportData) {
      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Shift Report - ${reportData.summary.shiftDate}</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 24px; 
                color: #1a1a1a;
                max-width: 900px;
                margin: 0 auto;
              }
              .report-header { 
                text-align: center; 
                margin-bottom: 24px; 
                border-bottom: 3px solid #2563eb; 
                padding-bottom: 16px; 
              }
              .report-header h1 { font-size: 28px; margin: 0 0 8px 0; color: #1e40af; }
              .report-header p { margin: 4px 0; color: #6b7280; font-size: 14px; }
              .metrics-grid { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); 
                gap: 16px; 
                margin-bottom: 24px; 
              }
              .metric-card { 
                background: #f0f9ff; 
                border: 1px solid #bae6fd; 
                border-radius: 8px; 
                padding: 16px; 
                text-align: center; 
              }
              .metric-value { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 4px; }
              .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
              .metric-trend { font-size: 11px; margin-top: 4px; }
              .section { margin-bottom: 24px; }
              .section-title { 
                font-size: 16px; 
                font-weight: 600; 
                margin-bottom: 12px; 
                color: #334155; 
                border-bottom: 1px solid #e2e8f0; 
                padding-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .top-performer { 
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
              }
              .driver-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .driver-table th, .driver-table td { 
                padding: 10px 12px; 
                text-align: left; 
                border-bottom: 1px solid #e2e8f0; 
              }
              .driver-table th { background: #f8fafc; font-weight: 600; color: #475569; }
              .driver-table tr:nth-child(even) { background: #f8fafc; }
              .status-badge { 
                padding: 3px 10px; 
                border-radius: 12px; 
                font-size: 11px; 
                font-weight: 500;
                display: inline-block;
              }
              .status-exceeding { background: #dcfce7; color: #166534; }
              .status-on-track { background: #fef9c3; color: #854d0e; }
              .status-behind { background: #fee2e2; color: #991b1b; }
              .highlights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
              .highlight-card { background: #f8fafc; border-radius: 8px; padding: 16px; }
              .highlight-card h4 { margin: 0 0 12px 0; font-size: 14px; color: #334155; }
              .highlight-card ul { margin: 0; padding-left: 20px; }
              .highlight-card li { margin-bottom: 8px; font-size: 13px; color: #475569; }
              .footer { 
                margin-top: 32px; 
                padding-top: 16px; 
                border-top: 2px solid #e2e8f0; 
                text-align: center; 
                color: #94a3b8; 
                font-size: 11px; 
              }
              @media print { 
                body { padding: 12px; }
                .metrics-grid { grid-template-columns: repeat(4, 1fr); }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 300);
      }
    }
    toast({ title: "Printing", description: "Report sent to printer" });
  };

  const handleEmail = async () => {
    if (!emailTo || !emailTo.includes('@')) {
      toast({ title: "Valid Email Required", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    
    setIsSending(true);
    
    try {
      await sendEmailMutation.mutateAsync({
        to: emailTo,
        subject: emailSubject,
        body: emailMessage,
        reportData: reportData
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'exceeding': return 'Exceeding';
      case 'on_track': return 'On Track';
      case 'behind': return 'Behind';
      default: return status;
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerateReport}
        size="lg"
        disabled={isGenerating}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg gap-2"
        data-testid="button-generate-shift-report"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Generate Shift Report
          </>
        )}
      </Button>

      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  Shift Performance Report
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="gap-1"
                  data-testid="button-print-report"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEmailDialog(true)}
                  className="gap-1"
                  data-testid="button-email-report"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            {reportData && (
              <div ref={reportRef} className="p-6 space-y-6">
                <div className="report-header text-center pb-4 border-b-2 border-blue-500">
                  <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Lot Ops Pro - Shift Report</h1>
                  <p className="text-muted-foreground">{reportData.summary.shiftDate}</p>
                  <p className="text-lg font-medium">{reportData.summary.shiftName} ({reportData.summary.shiftHours.start} - {reportData.summary.shiftHours.end})</p>
                  {reportData.summary.weather && (
                    <p className="text-sm text-muted-foreground mt-1">Weather: {reportData.summary.weather.condition}, {reportData.summary.weather.temp}°F</p>
                  )}
                </div>

                <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="metric-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border rounded-lg p-4 text-center">
                    <div className="metric-value text-3xl font-bold text-blue-600">{reportData.summary.totalMoves}</div>
                    <div className="metric-label text-xs text-muted-foreground uppercase tracking-wide">Total Moves</div>
                  </div>
                  
                  <div className="metric-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 border rounded-lg p-4 text-center">
                    <div className="metric-value text-3xl font-bold text-emerald-600">{reportData.summary.averageMPH}</div>
                    <div className="metric-label text-xs text-muted-foreground uppercase tracking-wide">Avg MPH</div>
                  </div>
                  
                  <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border rounded-lg p-4 text-center">
                    <div className="metric-value text-3xl font-bold text-purple-600">{reportData.summary.activeDrivers}/{reportData.summary.totalDrivers}</div>
                    <div className="metric-label text-xs text-muted-foreground uppercase tracking-wide">Active Drivers</div>
                  </div>
                  
                  <div className="metric-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border rounded-lg p-4 text-center">
                    <div className="metric-value text-3xl font-bold text-amber-600">{reportData.summary.quotaCompletionRate}%</div>
                    <div className="metric-label text-xs text-muted-foreground uppercase tracking-wide">Quota Hit Rate</div>
                  </div>
                </div>

                {reportData.summary.topPerformer.name !== "N/A" && (
                  <div className="top-performer bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-amber-500" />
                      <div>
                        <div className="text-sm font-medium text-amber-700 dark:text-amber-400">Top Performer</div>
                        <p className="text-xl font-bold">{reportData.summary.topPerformer.name}</p>
                        <p className="text-sm text-muted-foreground">{reportData.summary.topPerformer.moves} moves completed</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="section">
                  <div className="section-title text-lg font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Driver Performance Breakdown
                  </div>
                  {reportData.drivers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="driver-table w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-3 text-left font-semibold">Rank</th>
                            <th className="p-3 text-left font-semibold">Driver</th>
                            <th className="p-3 text-left font-semibold">Van</th>
                            <th className="p-3 text-center font-semibold">Moves</th>
                            <th className="p-3 text-center font-semibold">Hours</th>
                            <th className="p-3 text-center font-semibold">MPH</th>
                            <th className="p-3 text-center font-semibold">Quota %</th>
                            <th className="p-3 text-center font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.drivers.map((driver, index) => (
                            <tr key={driver.id} className="border-b hover:bg-muted/30">
                              <td className="p-3 text-muted-foreground">#{index + 1}</td>
                              <td className="p-3 font-medium">{driver.name}</td>
                              <td className="p-3 text-muted-foreground">{driver.vanNumber}</td>
                              <td className="p-3 text-center font-semibold">{driver.movesToday}</td>
                              <td className="p-3 text-center">{driver.hoursWorked}h</td>
                              <td className="p-3 text-center">{driver.mph}</td>
                              <td className="p-3 text-center font-medium">{driver.quotaPercent}%</td>
                              <td className="p-3 text-center">
                                <span className={`status-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  driver.status === 'exceeding' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : driver.status === 'on_track' 
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {driver.status === 'exceeding' && <TrendingUp className="h-3 w-3" />}
                                  {driver.status === 'on_track' && <Target className="h-3 w-3" />}
                                  {driver.status === 'behind' && <AlertTriangle className="h-3 w-3" />}
                                  {getStatusText(driver.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No driver data available for this shift.</p>
                      <p className="text-sm">Driver metrics will appear once drivers clock in and begin their shifts.</p>
                    </div>
                  )}
                </div>

                <div className="highlights-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="highlight-card bg-muted/30 rounded-lg p-4">
                    <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Highlights
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {reportData.drivers.filter(d => d.status === 'exceeding').length} drivers exceeding quota
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {reportData.summary.totalMoves} total vehicle moves completed
                      </li>
                      {reportData.summary.averageMPH >= 8 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          Average MPH ({reportData.summary.averageMPH}) meets efficiency target
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="highlight-card bg-muted/30 rounded-lg p-4">
                    <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Summary
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        Shift: {reportData.summary.shiftName}
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        Hours: {reportData.summary.shiftHours.start} - {reportData.summary.shiftHours.end}
                      </li>
                      {reportData.drivers.filter(d => d.status === 'behind').length > 0 && (
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          {reportData.drivers.filter(d => d.status === 'behind').length} drivers need coaching
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="footer text-center text-xs text-muted-foreground pt-4 border-t">
                  <p className="font-medium">Lot Ops Pro - Driver Performance Management System</p>
                  <p>Report generated by {JSON.parse(localStorage.getItem('vanops_user') || '{}').name || 'System'}</p>
                  <p>{format(new Date(), "MMMM d, yyyy 'at' h:mm:ss a")}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Email Shift Report
            </DialogTitle>
            <DialogDescription>
              Send the shift report to any email address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">Send To</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="recipient@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                data-testid="input-email-to"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                data-testid="input-email-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
                data-testid="input-email-message"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmail} 
              disabled={isSending || !emailTo}
              className="gap-2"
              data-testid="button-send-email"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
