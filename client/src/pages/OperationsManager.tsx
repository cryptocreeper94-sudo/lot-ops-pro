import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { 
  Crown, 
  FileText, 
  Users, 
  Mail, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield, 
  Clock,
  Send,
  Plus,
  Eye,
  LogOut,
  Calendar,
  TrendingUp,
  CheckCircle2,
  User,
  Key,
  Lock,
  HelpCircle,
  Smile,
  ShieldCheck,
  Copy,
  Layers,
  ClipboardList,
  Briefcase,
  Building2,
  Rocket,
  DollarSign,
  AlertTriangle,
  Zap,
  Sparkles,
  Car,
  Activity,
  Map,
  ExternalLink,
  ChevronRight,
  Brain,
  FolderOpen
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent, AccordionSection } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { PerformanceReports } from "@/components/PerformanceReports";
import { ShiftManager } from "@/components/ShiftManager";
import { Version2Button } from "@/components/Version2Roadmap";
import { ManagementWelcome } from "@/components/ManagementWelcome";
import { SupervisorCapabilities } from "@/components/SupervisorCapabilities";
import { QuickStartGuide } from "@/components/QuickStartGuide";
import { BetaTestingChecklist } from "@/components/BetaTestingChecklist";
import { ExoticKeyDashboard } from "@/components/ExoticKeyTracking";
import { LotVisionDashboardWidget } from "@/components/LotVisionLauncher";
import { SandboxModeIndicator } from "@/components/SandboxModeIndicator";
import { SandboxHelpButton } from "@/components/SandboxHelpButton";
import { OperationsManagerOnboarding } from "@/components/OperationsManagerOnboarding";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { EquipmentCheckoutLog } from "@/components/EquipmentCheckoutLog";
import { ShiftWeatherCard } from "@/components/ShiftWeatherCard";
import { AiOptimizationDashboard } from "@/components/AiOptimizationDashboard";
import { SupervisorAssignmentPanel } from "@/components/SupervisorAssignmentPanel";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { PageTutorialButton, pageTutorialContent } from "@/components/PageTutorialButton";
import { PopupGameToggle } from "@/components/TeamAvatarPopupGame";
import { SupervisorLiveWall } from "@/components/SupervisorLiveWall";
import { LotAvailabilityBoard } from "@/components/LotAvailabilityBoard";
import { DashboardControls } from "@/components/DashboardControls";
import { EndOfShiftReport } from "@/components/EndOfShiftReport";
import { ShiftReportGenerator } from "@/components/ShiftReportGenerator";
import { PageHelp } from "@/components/PageHelp";
import { RolePreviewDialogs, RolePreviewButtons } from "@/components/RolePreviewDialogs";
import { Sun, Moon } from "lucide-react";

type ToolCategory = "shifts" | "reports" | "team" | "communication" | "equipment" | "settings" | "ai" | "arena" | null;

export default function OperationsManager() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [funPopupsEnabled, setFunPopupsEnabled] = useState(() => {
    return localStorage.getItem("lotops_easter_eggs_enabled") === "true";
  });
  
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const loginCount = parseInt(localStorage.getItem('onboarding_operations_count') || "0");
    return loginCount < 5;
  });

  const [showOpsManagerTutorial, setShowOpsManagerTutorial] = useState(false);

  useEffect(() => {
    const loginCount = parseInt(localStorage.getItem('ops_manager_onboarding_count') || "0");
    if (loginCount < 1) {
      setTimeout(() => setShowOpsManagerTutorial(true), 800);
      localStorage.setItem('ops_manager_onboarding_count', "1");
    }
  }, []);
  
  const toggleFunPopups = () => {
    const newValue = !funPopupsEnabled;
    setFunPopupsEnabled(newValue);
    localStorage.setItem("lotops_easter_eggs_enabled", newValue.toString());
    toast({
      title: newValue ? "Fun Pop-ups Enabled!" : "Pop-ups Disabled",
      description: newValue 
        ? "You'll now see the occasional sarcastic driver bio pop-up!" 
        : "No more surprise driver bios. You can re-enable anytime.",
    });
  };
  
  const [showInstructionDialog, setShowInstructionDialog] = useState(false);
  const [newInstruction, setNewInstruction] = useState({
    date: new Date().toISOString().split('T')[0],
    priority: "normal",
    title: "",
    content: "",
  });
  
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientType: "company_wide",
    recipients: [] as string[],
    subject: "",
    body: "",
  });
  
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPin, setNewPin] = useState("");
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [safetyAdvisors, setSafetyAdvisors] = useState<any[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  
  const [dailyCode, setDailyCode] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(true);
  
  const [activeToolSheet, setActiveToolSheet] = useState<ToolCategory>(null);
  
  const [supervisorPreviewOpen, setSupervisorPreviewOpen] = useState(false);
  const [driverPreviewOpen, setDriverPreviewOpen] = useState(false);
  
  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 15.5) return 'first';
    return 'second';
  };
  
  const [currentShift] = useState<'first' | 'second'>(getCurrentShift);
  
  useEffect(() => {
    const loadDailyCode = async () => {
      const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
      if (isDemoMode) {
        setDailyCode("DEMO12");
        setLoadingCode(false);
        return;
      }
      
      try {
        const res = await fetch('/api/daily-code');
        if (res.ok) {
          const data = await res.json();
          setDailyCode(data.code);
        }
      } catch (error) {
        console.error("Failed to load daily code:", error);
      } finally {
        setLoadingCode(false);
      }
    };
    
    loadDailyCode();
  }, []);
  
  const copyDailyCode = () => {
    navigator.clipboard.writeText(dailyCode);
    toast({
      title: "Code Copied!",
      description: "Daily access code copied to clipboard",
    });
  };
  
  useEffect(() => {
    const loadUsers = async () => {
      const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
      if (isDemoMode) return;
      
      try {
        const [supervisorRes, safetyRes, driverRes] = await Promise.all([
          fetch('/api/users/role/supervisor'),
          fetch('/api/users/role/safety_advisor'),
          fetch('/api/users/drivers')
        ]);
        
        if (supervisorRes.ok) setSupervisors(await supervisorRes.json());
        if (safetyRes.ok) setSafetyAdvisors(await safetyRes.json());
        if (driverRes.ok) setAllDrivers(await driverRes.json());
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    
    if (activeToolSheet === 'team') {
      loadUsers();
    }
  }, [activeToolSheet]);
  
  const createShiftInstruction = async () => {
    if (!newInstruction.title || !newInstruction.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    
    if (!isDemoMode) {
      try {
        await fetch('/api/shift-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newInstruction,
            createdBy: "operations_manager",
            createdByTitle: "Operations Manager",
          }),
        });
      } catch (error) {
        console.error('Failed to create instruction:', error);
      }
    }

    toast({
      title: "Shift Instruction Created",
      description: "Supervisor will see this on their next login",
    });
    
    setNewInstruction({
      date: new Date().toISOString().split('T')[0],
      priority: "normal",
      title: "",
      content: "",
    });
    setShowInstructionDialog(false);
  };

  const sendEmail = async () => {
    if (!emailData.subject || !emailData.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    
    if (!isDemoMode) {
      try {
        await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...emailData,
            sentBy: "operations_manager",
            sentByRole: "operations_manager",
          }),
        });
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }

    toast({
      title: "Email Sent",
      description: emailData.recipientType === 'company_wide' ? "Sent to all staff" : "Email delivered",
    });
    
    setEmailData({
      recipientType: "company_wide",
      recipients: [],
      subject: "",
      body: "",
    });
    setShowEmailDialog(false);
  };

  const changePIN = async () => {
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    
    if (!isDemoMode) {
      try {
        const res = await fetch(`/api/users/${selectedUser.id}/update-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newPin,
            requestorRole: 'operations_manager',
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }
      } catch (error: any) {
        toast({
          title: "PIN Change Failed",
          description: error.message || "Failed to update PIN",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "PIN Changed",
      description: `PIN updated for ${selectedUser.name}`,
    });
    
    setNewPin("");
    setShowPinDialog(false);
    setSelectedUser(null);
  };

  const openPinDialog = (user: any) => {
    setSelectedUser(user);
    setNewPin("");
    setShowPinDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("vanops_user");
    setLocation("/");
  };

  const toolCategories = [
    {
      id: "shifts" as const,
      title: "Shift Tools",
      description: "Shifts, Instructions, Daily Code",
      icon: <Clock className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      badge: "Active"
    },
    {
      id: "reports" as const,
      title: "Reports",
      description: "Performance & Analytics",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      badge: "Live"
    },
    {
      id: "team" as const,
      title: "Team",
      description: "Personnel, PINs, Delegation",
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "communication" as const,
      title: "Communication",
      description: "Messages & Email",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "equipment" as const,
      title: "Equipment",
      description: "Checkout Log",
      icon: <ClipboardList className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "settings" as const,
      title: "Settings",
      description: "Config & Enterprise",
      icon: <Settings className="w-6 h-6" />,
      color: "from-slate-500 to-gray-600",
    },
    {
      id: "ai" as const,
      title: "AI Tools",
      description: "Smart Optimization",
      icon: <Brain className="w-6 h-6" />,
      color: "from-pink-500 to-rose-600",
      badge: "Beta"
    },
    {
      id: "arena" as const,
      title: "Arena",
      description: "Sale Day Staging",
      icon: <Layers className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <>
      <WelcomeTrigger userName={user?.name} userRole="operations_manager" />
      {user && <ManagementWelcome userName={user.name} role={user.role} />}
      
      <div className="min-h-screen dashboard-premium p-4 scrollbar-premium">
        {localStorage.getItem("vanops_demo_mode") === "true" && (
          <div className="mb-2">
            <SandboxModeIndicator />
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-2">
            <div className="flex items-center gap-3">
              <NavigationControl variant="back" fallbackRoute="/mode-selection" />
              <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 p-3 rounded-xl shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gradient-purple">Lot Operations Manager</h1>
                <p className="text-xs sm:text-sm text-slate-400">Full System Oversight & Control</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {localStorage.getItem("vanops_demo_mode") === "true" && (
                <SandboxHelpButton role="operations_manager" page="operations-manager" size="sm" />
              )}
              {pageTutorialContent["/operations-manager"] && (
                <PageTutorialButton 
                  slides={pageTutorialContent["/operations-manager"].slides}
                  pageTitle={pageTutorialContent["/operations-manager"].title}
                  buttonSize="sm"
                  showLabel={false}
                />
              )}
              <PopupGameToggle showLabel={false} />
              <DashboardControls triggerClassName="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10" />
              <ShiftReportGenerator />
              <EndOfShiftReport 
                driverName={user?.name}
                shiftSummary={{
                  totalMoves: 42,
                  quota: 45,
                  hoursWorked: 8,
                  breaksTaken: 2,
                  incidentsReported: 0
                }}
              />
              <Version2Button />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFunPopups}
                className={funPopupsEnabled ? "text-yellow-600" : "text-slate-400"}
                title={funPopupsEnabled ? "Disable Fun Pop-ups" : "Enable Fun Pop-ups"}
                data-testid="button-toggle-fun-popups"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOnboarding(true)}
                className="text-blue-600"
                title="View Help Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <ShiftWeatherCard 
          userId={user?.id?.toString()}
          userName={user?.name}
          userRole={user?.role}
          compact={true}
          showClockIn={true}
        />

        {/* Car Dashboard Style Metrics */}
        <Card className="my-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              {/* Daily Code - Most Important */}
              <div className="sm:col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-4 text-center" data-testid="metric-daily-code">
                <div className="text-xs text-emerald-100 font-medium mb-1 flex items-center justify-center gap-1">
                  <Key className="w-3 h-3" />
                  Daily Code
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold text-white tracking-wider">
                    {loadingCode ? "..." : dailyCode}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                    onClick={copyDailyCode}
                    data-testid="button-copy-daily-code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-emerald-200 mt-1">Share with drivers</div>
              </div>

              {/* Active Drivers */}
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700" data-testid="metric-active-drivers">
                <div className="text-xs text-slate-400 font-medium mb-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  Active Drivers
                </div>
                <div className="text-3xl font-bold text-white">24</div>
                <div className="text-xs text-emerald-400">Ready to work</div>
              </div>

              {/* Moves Today */}
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700" data-testid="metric-moves-today">
                <div className="text-xs text-slate-400 font-medium mb-1">
                  <Car className="w-3 h-3 inline mr-1" />
                  Moves Today
                </div>
                <div className="text-3xl font-bold text-white">1,247</div>
                <div className="text-xs text-blue-400">94% efficiency</div>
              </div>

              {/* Current Shift */}
              <div className={`rounded-xl p-4 text-center border ${currentShift === 'first' ? 'bg-gradient-to-br from-amber-600/20 to-orange-700/20 border-amber-600/50' : 'bg-gradient-to-br from-indigo-600/20 to-purple-700/20 border-indigo-600/50'}`} data-testid="metric-current-shift">
                <div className="text-xs text-slate-300 font-medium mb-1">
                  {currentShift === 'first' ? <Sun className="w-3 h-3 inline mr-1" /> : <Moon className="w-3 h-3 inline mr-1" />}
                  Current Shift
                </div>
                <div className={`text-2xl font-bold ${currentShift === 'first' ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {currentShift === 'first' ? '1st Shift' : '2nd Shift'}
                </div>
                <div className="text-xs text-slate-400">
                  {currentShift === 'first' ? '6:00 AM - 3:30 PM' : '3:30 PM - 12:00 AM'}
                </div>
              </div>

              {/* Lot Availability Snapshot */}
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700" data-testid="metric-lot-availability">
                <div className="text-xs text-slate-400 font-medium mb-1">
                  <Map className="w-3 h-3 inline mr-1" />
                  Lot Status
                </div>
                <div className="text-2xl font-bold text-emerald-400">78%</div>
                <div className="text-xs text-slate-400">Available capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex flex-wrap items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <PremiumButton
              variant="gradient"
              size="lg"
              icon={<MessageSquare className="w-5 h-5" />}
              onClick={() => setActiveToolSheet("communication")}
              className="h-16 text-base"
              data-testid="button-quick-message"
            >
              Send Message
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="lg"
              icon={<FileText className="w-5 h-5" />}
              onClick={() => setShowInstructionDialog(true)}
              className="h-16 text-base"
              data-testid="button-quick-instruction"
            >
              Send List
            </PremiumButton>
            <PremiumButton
              variant="glow"
              size="lg"
              icon={<Clock className="w-5 h-5" />}
              onClick={() => setActiveToolSheet("shifts")}
              className="h-16 text-base"
              data-testid="button-quick-shift"
            >
              Shift Setup
            </PremiumButton>
            <PremiumButton
              variant="premium"
              size="lg"
              icon={<BarChart3 className="w-5 h-5" />}
              onClick={() => setActiveToolSheet("reports")}
              className="h-16 text-base"
              data-testid="button-quick-reports"
            >
              View Reports
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              size="lg"
              icon={<Map className="w-5 h-5" />}
              onClick={() => setLocation("/weekly-maps")}
              className="h-16 text-base"
              data-testid="button-quick-map"
            >
              View Map
            </PremiumButton>
          </div>
        </div>

        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Live Driver Wall</CardTitle>
              <Badge variant="secondary" className="ml-auto shrink-0">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SupervisorLiveWall />
          </CardContent>
        </Card>

        {/* Lot Availability - Color-coded inventory lot status */}
        <div className="mb-6">
          <LotAvailabilityBoard />
        </div>

        {/* Exotic Key Control - Front and Center */}
        <Card className="mb-6 border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shrink-0">
                  <Key className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">Exotic Key Control</CardTitle>
                  <CardDescription className="truncate sm:whitespace-normal">Track exotic car keys - who has them, work orders, delivery status</CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setActiveToolSheet("equipment")}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shrink-0"
                data-testid="button-exotic-keys"
              >
                <Key className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Open Key Tracking</span>
                <span className="sm:hidden">Keys</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ExoticKeyDashboard />
          </CardContent>
        </Card>

        {/* Lot Vision GPS Integration */}
        <div className="mb-6">
          <LotVisionDashboardWidget />
        </div>

        {/* Role Previews Section */}
        <Card className="mb-6 border-2 border-dashed border-slate-600">
          <CardContent className="py-6">
            <RolePreviewButtons
              onOpenSupervisor={() => setSupervisorPreviewOpen(true)}
              onOpenDriver={() => setDriverPreviewOpen(true)}
            />
          </CardContent>
        </Card>

        <div className="mb-6 max-w-full overflow-hidden">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex flex-wrap items-center gap-2 px-1">
            <Sparkles className="w-4 h-4" />
            Tools
          </h3>
          <div className="max-w-full overflow-hidden px-1">
            <SwipeCarousel itemWidth="200px" gap={12}>
              {toolCategories.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => setActiveToolSheet(tool.id)}
                  className="cursor-pointer group"
                  data-testid={`tool-card-${tool.id}`}
                >
                  <Card className="h-32 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl border-2 border-transparent group-hover:border-primary/30">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <CardContent className="p-4 h-full flex flex-col relative z-10">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} w-fit mb-2`}>
                        <div className="text-white">{tool.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1">
                          <h4 className="font-semibold text-sm">{tool.title}</h4>
                          {tool.badge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </SwipeCarousel>
          </div>
        </div>

        <BentoGrid columns={2} gap="md" className="mb-6">
          <BentoTile
            size="lg"
            variant="premium"
            sparkle
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Daily Access Code"
            description="Required for driver login"
            badge="Active"
            data-testid="tile-daily-code"
            action={
              <PremiumButton
                variant="premium"
                size="sm"
                icon={<Copy className="w-4 h-4" />}
                onClick={copyDailyCode}
                shine
                data-testid="button-copy-code"
              >
                Copy Code
              </PremiumButton>
            }
          >
            {loadingCode ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="text-4xl font-black text-amber-400 tracking-wider font-mono py-2">
                {dailyCode}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <Clock className="w-3 h-3" />
              Valid until midnight
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="gradient"
            icon={<Key className="w-5 h-5" />}
            title="Exotic Key Tracking"
            description="High-value vehicle security"
            badge="Priority"
            data-testid="tile-exotic-keys"
          >
            <ExoticKeyDashboard />
          </BentoTile>
        </BentoGrid>

        <AccordionSection
          title="Driver Assignments"
          description="Send tasks and assignments to drivers"
          icon={<Users className="w-5 h-5" />}
          variant="premium"
          badge="Live"
          defaultOpen
        >
          <SupervisorAssignmentPanel 
            userName={user?.name || 'Operations Manager'}
            userRole="operations_manager"
          />
        </AccordionSection>

        <div className="mt-6">
          <PremiumAccordion>
            <PremiumAccordionItem value="other-dashboards" variant="glass">
              <PremiumAccordionTrigger
                icon={<ExternalLink className="w-5 h-5" />}
                description="Switch to other role views"
              >
                View Other Dashboards
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setLocation("/supervisor-sandbox")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Shield className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Supervisor Dashboard</h4>
                        <p className="text-xs text-muted-foreground">Team oversight mode</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setLocation("/driver-sandbox")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Car className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Van Driver Dashboard</h4>
                        <p className="text-xs text-muted-foreground">Driver experience view</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => setLocation("/service-driver")}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <ClipboardList className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Service Driver Dashboard</h4>
                        <p className="text-xs text-muted-foreground">Inventory driver mode</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-dashed">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-500/10">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Temp Driver Mode</h4>
                        <p className="text-xs text-muted-foreground">Limited access for temps</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>
          </PremiumAccordion>
        </div>

        <Sheet open={activeToolSheet === "shifts"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Shift Tools
              </SheetTitle>
              <SheetDescription>Manage shifts, instructions, and daily codes</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <ShiftManager />
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Shift Instructions</CardTitle>
                      <CardDescription>Create instructions for Supervisor</CardDescription>
                    </div>
                    <Button onClick={() => setShowInstructionDialog(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Instruction
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500 text-center py-8">
                    No shift instructions yet
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "reports"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Reports & Performance
              </SheetTitle>
              <SheetDescription>Analytics and performance metrics</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <PerformanceDashboard />
              <PerformanceReports />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "team"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </SheetTitle>
              <SheetDescription>Personnel, PINs, and delegation</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500 text-white">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Employee Files</h3>
                        <p className="text-xs text-muted-foreground">Search records by name, badge number, date</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setLocation("/employee-files")}
                      className="bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                      data-testid="button-employee-files"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Open Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <SupervisorCapabilities />
              
              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-600" />
                    <div>
                      <CardTitle className="text-base">PIN Management</CardTitle>
                      <CardDescription className="text-xs">Change PINs for staff</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supervisors.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">Supervisor</div>
                      {supervisors.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border mb-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-600" />
                            <div>
                              <div className="text-sm font-semibold">{user.name}</div>
                              <div className="text-xs text-slate-500">PIN: {user.pin}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => openPinDialog(user)} 
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                          >
                            <Key className="w-3 h-3 mr-1" />
                            Change
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {safetyAdvisors.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">Safety Advisor</div>
                      {safetyAdvisors.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border mb-1">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-600" />
                            <div>
                              <div className="text-sm font-semibold">{user.name}</div>
                              <div className="text-xs text-slate-500">PIN: {user.pin}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => openPinDialog(user)} 
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                          >
                            <Key className="w-3 h-3 mr-1" />
                            Change
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {allDrivers.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">Drivers ({allDrivers.length})</div>
                      <ScrollArea className="h-64 border rounded">
                        <div className="p-2 space-y-1">
                          {allDrivers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${user.role === 'driver' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                <div>
                                  <div className="text-sm font-semibold">{user.name}</div>
                                  <div className="text-xs text-slate-500">PIN: {user.pin}</div>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => openPinDialog(user)} 
                                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                              >
                                <Key className="w-3 h-3 mr-1" />
                                Change
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {supervisors.length === 0 && safetyAdvisors.length === 0 && allDrivers.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-6">
                      No users found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "communication"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication
              </SheetTitle>
              <SheetDescription>Messages and email</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Quick Message to Supervisors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500 text-center py-8">
                    No messages yet
                  </div>
                  <PremiumButton
                    variant="gradient"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    className="w-full mt-4"
                  >
                    New Message
                  </PremiumButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PremiumButton
                    variant="premium"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowEmailDialog(true)}
                    className="w-full"
                    shine
                  >
                    Compose Email
                  </PremiumButton>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "equipment"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Equipment Checkout
              </SheetTitle>
              <SheetDescription>Monitor equipment checkouts and returns</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <EquipmentCheckoutLog mode="manager" />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "settings"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings & Enterprise
              </SheetTitle>
              <SheetDescription>Configuration and enterprise features</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-500/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        Enterprise Capabilities
                        <Rocket className="w-5 h-5 text-emerald-400" />
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Platform scalability and ROI analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-3">
                    <AccordionItem value="cost-analysis" className="border border-blue-500/30 rounded-xl bg-blue-900/20 overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-blue-900/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-blue-300">Operational Cost Analysis</p>
                            <p className="text-xs text-slate-400">Traditional vs. Digital Operations ROI</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-sm text-slate-300">Platform designed to adapt to existing operational workflows across multiple locations.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="safety" className="border border-red-500/30 rounded-xl bg-red-900/20 overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-red-900/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-red-300">Safety & Risk Management</p>
                            <p className="text-xs text-slate-400">Incident documentation and response</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                          <li>Camera integration for immediate capture</li>
                          <li>Automatic routing to stakeholders</li>
                          <li>Complete audit trails</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="mt-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-3 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-emerald-300 text-sm">Ready for Evaluation</p>
                        <p className="text-xs text-slate-400">Demo available upon request</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "ai"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Optimization
              </SheetTitle>
              <SheetDescription>Smart suggestions and optimization</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <AiOptimizationDashboard />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeToolSheet === "arena"} onOpenChange={(open) => !open && setActiveToolSheet(null)}>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Arena Staging
              </SheetTitle>
              <SheetDescription>Sale day preparation and staging</SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">Arena Staging features are being developed for a future update.</p>
            </div>
          </SheetContent>
        </Sheet>

        <Dialog open={showInstructionDialog} onOpenChange={setShowInstructionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Shift Instructions</DialogTitle>
              <DialogDescription>
                Instructions will be visible to Supervisor on login
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newInstruction.date}
                    onChange={(e) => setNewInstruction({ ...newInstruction, date: e.target.value })}
                    data-testid="input-instruction-date"
                  />
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newInstruction.priority}
                    onValueChange={(value) => setNewInstruction({ ...newInstruction, priority: value })}
                  >
                    <SelectTrigger data-testid="select-instruction-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Heavy Chute Day - Extra Van Needed"
                  value={newInstruction.title}
                  onChange={(e) => setNewInstruction({ ...newInstruction, title: e.target.value })}
                  data-testid="input-instruction-title"
                />
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  placeholder="Full shift instructions and notes..."
                  rows={8}
                  value={newInstruction.content}
                  onChange={(e) => setNewInstruction({ ...newInstruction, content: e.target.value })}
                  data-testid="textarea-instruction-content"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstructionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createShiftInstruction} data-testid="button-save-instruction">
                <Send className="w-4 h-4 mr-2" />
                Send to Supervisor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                Send company-wide announcements or external emails
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Recipients</Label>
                <Select
                  value={emailData.recipientType}
                  onValueChange={(value) => setEmailData({ ...emailData, recipientType: value })}
                >
                  <SelectTrigger data-testid="select-email-recipients">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_wide">All Staff (Company-Wide)</SelectItem>
                    <SelectItem value="external">External Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {emailData.recipientType === 'external' && (
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    data-testid="input-email-address"
                  />
                </div>
              )}

              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  data-testid="input-email-subject"
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Email content..."
                  rows={8}
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  data-testid="textarea-email-body"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={sendEmail} data-testid="button-send-email-confirm">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change PIN</DialogTitle>
              <DialogDescription>
                Enter a new 4-digit PIN for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>New PIN (4 digits)</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  data-testid="input-new-pin"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPinDialog(false)}>
                Cancel
              </Button>
              <Button onClick={changePIN} data-testid="button-confirm-pin-change">
                <Key className="w-4 h-4 mr-2" />
                Update PIN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <OnboardingTutorial 
          role="operations"
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            const count = parseInt(localStorage.getItem('onboarding_operations_count') || "0");
            localStorage.setItem('onboarding_operations_count', (count + 1).toString());
          }}
        />

        <OperationsManagerOnboarding
          open={showOpsManagerTutorial}
          onClose={() => setShowOpsManagerTutorial(false)}
        />

        <PageHelp
          pageName="Operations Manager Dashboard"
          pageDescription="Central command center for supervisors to manage lot operations, shifts, team, and communications."
          navigationPath={[
            { name: "Home" },
            { name: "Mode Selection" },
            { name: "Operations Manager", current: true }
          ]}
          steps={[
            {
              title: "Review Live Metrics",
              description: "Check the dashboard for real-time stats on active drivers, moves today, shift status, and lot availability."
            },
            {
              title: "Use Quick Actions",
              description: "Access frequently used functions like Send Message, Send List, Shift Setup, and View Reports directly."
            },
            {
              title: "Monitor Driver Activity",
              description: "View the Live Driver Wall to see current driver locations, statuses, and recent moves in real-time."
            },
            {
              title: "Preview Team Views",
              description: "Use Role Previews to see what Supervisors and Drivers see on their dashboards."
            },
            {
              title: "Access Tool Categories",
              description: "Swipe through tool cards for Shifts, Reports, Team, Communication, Equipment, Settings, AI Tools, and Arena."
            }
          ]}
          quickActions={[
            { label: "Send Message", description: "Broadcast messages to drivers, supervisors, or all staff" },
            { label: "Send List", description: "Create and distribute shift instructions with priorities" },
            { label: "Shift Setup", description: "Configure shift assignments and daily code" },
            { label: "View Reports", description: "Access performance analytics and driver reports" },
            { label: "View Map", description: "See weekly lot maps and facility layout" }
          ]}
          tips={[
            "Copy the daily access code to share with drivers who need to clock in",
            "Use Role Previews to understand what your team sees",
            "Use the AI Tools section for smart optimization recommendations",
            "Check the End of Shift Report before logging out to review the day's performance"
          ]}
        />

        {/* Role Preview Dialogs */}
        <RolePreviewDialogs
          supervisorOpen={supervisorPreviewOpen}
          driverOpen={driverPreviewOpen}
          onCloseSupervisor={() => setSupervisorPreviewOpen(false)}
          onCloseDriver={() => setDriverPreviewOpen(false)}
        />
      </div>
    </>
  );
}
