import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Flame,
  Minimize2,
  Play,
  Pause,
  AlertTriangle,
  Layers,
  Zap,
  QrCode,
  Camera,
  Flashlight,
  Hash,
  ArrowRight,
  MessageSquareWarning,
  ThumbsDown,
  ThumbsUp,
  Gauge,
  BatteryWarning,
  XCircle,
  Timer,
  Ban,
  Truck,
  History,
  Hammer,
  Satellite,
  Compass,
  LocateFixed,
  Fuel,
  Lock,
  Unlock,
  ListTodo,
  ExternalLink,
  Hand,
  ShieldAlert,
  FileWarning,
  Briefcase,
  ClipboardList,
  Car,
  Coffee,
  Utensils,
  BellRing,
  LogOut,
  HelpCircle,
  NotebookPen,
  Save,
  Plug,
  PlugZap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { WelcomeTrigger } from "./WelcomeTrigger";

// --- DEALER / GROUP CODE MAPPING ---
const GROUP_CODE_MAP: Record<string, { zone: string, desc: string }> = {
  // --- CORE ZONES ---
  "CHUTE": { zone: "The Chute (101)", desc: "Main Intake / Start Point" },
  
  // --- DEALER CODES ---
  "DSC": { zone: "Lane 257", desc: "Dealer Svcs Corp" },
  "REG": { zone: "Lane 227", desc: "Regional Accept" },
  "CR":  { zone: "Lot 255", desc: "Condition Report (Certification)" },
  "ARS": { zone: "Lane 210", desc: "Auto Remarketing" },
  "FOR": { zone: "Section 516", desc: "Ford Motor Credit" }, 
  "S/O": { zone: "Sign Off (200s)", desc: "Sign Off" },
  "SOLD":{ zone: "Sold Lot 801", desc: "Sold Unit" },
  
  // --- SPECIALTY ZONES ---
  "DTL": { zone: "Detail Shop (301-302)", desc: "Detailing" },
  "DTL-STG": { zone: "Lots 360/361/371-375", desc: "Detail Staging" },
  "BODY": { zone: "Body Shop (330)", desc: "Body Shop" },
  "BODY-STG": { zone: "Lots 340/350", desc: "Body Shop Staging" },
  "MECH-STG": { zone: "Lot 310", desc: "Mechanic Staging" },
  "WET-SAND": { zone: "Lot 307", desc: "Wet Sand" },
  "DECAL": { zone: "Lot 372", desc: "Decal Removal" },
  "RECYCLE": { zone: "Lot 365", desc: "Recycling" },
  
  // --- CLEANSIDE / POST-SALE ---
  "CLEAN": { zone: "Lots 400/410/411", desc: "Clean Side / Imaging" },
  "PSI": { zone: "800 Section", desc: "Post Sale Inspection / Recall" },
  "REPO": { zone: "Lot 860", desc: "Repo / Redemption" },

  // --- INVENTORY LOTS ---
  "INV-GEN": { zone: "513-515, 517-518", desc: "General Inventory" },
  "INV-CAGE": { zone: "591-599", desc: "The Cage (Inventory)" },
  "INV-NIS": { zone: "501-502", desc: "Nissan Inventory (Pref)" },
  "INV-STD": { zone: "503-505", desc: "Standard Inventory" },
  "INV-702": { zone: "Lot 702", desc: "Overflow Inventory" },

  // --- DLR RULES ---
  "DLR": { zone: "Check Windshield...", desc: "Dealer Generic" },
  "DLR-ARS": { zone: "Lane 215/225", desc: "DLR (ARS Found)" },
  "DLR-STD": { zone: "Lot 520", desc: "DLR (Standard)" },
  
  // --- COMMON CODES ---
  "GMAC": { zone: "Lane 227", desc: "Ally Financial" },
  "HDFS": { zone: "Lane 210", desc: "Harley Davidson" },
  "TMC":  { zone: "Lane 235", desc: "Toyota Motor Credit" },
  "WFS":  { zone: "Lane 227", desc: "Wells Fargo" }
};

import { useGPSTracking } from "@/hooks/useGPSTracking";
import { FacilityMapNavigator } from "@/components/FacilityMapNavigator";
import { BreakManager } from "@/components/BreakManager";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { EasterEggPopup } from "@/components/EasterEggPopup";
import { LotSpotReporter } from "@/components/LotSpotReporter";
import { Footer } from "@/components/Footer";
import { ShiftWeatherCard } from "@/components/ShiftWeatherCard";
import { DriverAssignmentView } from "@/components/DriverAssignmentView";

export default function VanRouting() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get user info for break management and ShiftWeatherCard
  const [userRole, setUserRole] = useState<'driver' | 'inventory'>('driver');
  const [user, setUser] = useState<{ id?: number; name?: string; role?: string } | null>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('vanops_user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setUserRole(parsedUser.role === 'inventory' ? 'inventory' : 'driver');
      } catch (e) {
        setUserRole('driver');
        setUser(null);
      }
    }
  }, []);
  
  // Onboarding Tutorial - Auto-show for first 5 logins
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const loginCount = parseInt(localStorage.getItem('onboarding_driver_count') || "0");
    return loginCount < 5;
  });
  
  // --- SHIFT STATE ---
  const [shiftRole, setShiftRole] = useState<string | null>(null); 
  const [driverNumber, setDriverNumber] = useState<string>(""); // Dynamic Daily Number
  const [badgeId, setBadgeId] = useState<string>(""); // Employee ID
  const [employeeName, setEmployeeName] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [shiftStarted, setShiftStarted] = useState(false);

  // GPS Tracking (auto-updates every 1 minute when shift started)
  useGPSTracking({
    driverNumber: driverNumber,
    enabled: shiftStarted && !!driverNumber,
    interval: 60000, // 1 minute
  });

  // Mode Logic
  const [mode, setMode] = useState<"bulk" | "crunch" | "ev">("bulk");
  
  // Break State
  const [breakStatus, setBreakStatus] = useState<"active" | "break_15" | "break_30">("active");
  const [breakTimer, setBreakTimer] = useState(0); // Seconds remaining
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [breakOver, setBreakOver] = useState(false);
  
  // Break History
  const [breaksTaken, setBreaksTaken] = useState<{ 15: number; 30: number }>({ 15: 0, 30: 0 });

  // Crunch Mode
  const [crunchTimer, setCrunchTimer] = useState(0);
  const [isCrunching, setIsCrunching] = useState(false);
  const [crunchLane, setCrunchLane] = useState("");
  const [crunchTask, setCrunchTask] = useState("");
  const [showCrunchDialog, setShowCrunchDialog] = useState(false);
  
  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{vin: string, workOrder: string, groupCode: string} | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Performance Metric State
  const TARGET_MPH = 4.5;
  const [currentMPH, setCurrentMPH] = useState(4.8); 
  const [movesCompleted, setMovesCompleted] = useState(14);
  
  // Alert / Issue Reporting
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [issueReason, setIssueReason] = useState("");
  const [issueNotes, setIssueNotes] = useState("");

  // Jump Start Timer State
  const [isJumping, setIsJumping] = useState(false);
  const [jumpTimer, setJumpTimer] = useState(0);

  // Retroactive Crunch State
  const [showRetroactiveDialog, setShowRetroactiveDialog] = useState(false);
  const [retroactiveMinutes, setRetroactiveMinutes] = useState(15);

  // DLR Prompt State
  const [showDlrDialog, setShowDlrDialog] = useState(false);

  // Manual Entry State
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [manualLookupResult, setManualLookupResult] = useState<{code: string, zone: string, desc: string} | null>(null);

  // Pickup Request State
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [isPickupRequested, setIsPickupRequested] = useState(false);
  const [estimatedPickupTime, setEstimatedPickupTime] = useState<number | null>(null);

  // GPS State
  const [gpsStatus, setGpsStatus] = useState<"searching" | "locked" | "denied">("searching");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [distanceToTarget, setDistanceToTarget] = useState(850); // ft

  // Gas Code State
  const [gasCode, setGasCode] = useState("");
  const [isGasCodeSaved, setIsGasCodeSaved] = useState(false);
  const [showGasCodeDialog, setShowGasCodeDialog] = useState(false);

  // Blockage Reporting State
  const [showBlockageDialog, setShowBlockageDialog] = useState(false);
  const [blockingVin, setBlockingVin] = useState("");
  const [blockingCarInfo, setBlockingCarInfo] = useState<{desc: string, belongsIn: string} | null>(null);

  // Notepad State
  const [showNotepad, setShowNotepad] = useState(false);
  const [notepadContent, setNotepadContent] = useState(() => localStorage.getItem("vanops_notepad") || "");

  // EV State
  const [showEvDialog, setShowEvDialog] = useState(false);
  const [evVin, setEvVin] = useState("");
  const [evWorkOrder, setEvWorkOrder] = useState("");
  const [evStatus, setEvStatus] = useState<"plugged" | "unplugged">("plugged");

  // Priority List State
  const [priorityMoves, setPriorityMoves] = useState([
    { id: "M-101", vin: "...8842", desc: "2022 Ford Mach-E", from: "Chute (101)", to: "Lane 41", status: "assigned", priority: "high" },
  ]);

  // Location Permission Prompt State
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // GPS Logic
  useEffect(() => {
    const timer = setTimeout(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGpsStatus("locked");
                    setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
                },
                (error) => setGpsStatus("denied")
            );
        } else {
            setGpsStatus("denied");
        }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulate Distance updates
  useEffect(() => {
    if (scannedData && gpsStatus === 'locked') {
      const interval = setInterval(() => setDistanceToTarget(prev => Math.max(0, prev - 15)), 1000);
      return () => clearInterval(interval);
    }
  }, [scannedData, gpsStatus]);

  // Timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCrunching) interval = setInterval(() => setCrunchTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isCrunching]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isJumping) interval = setInterval(() => setJumpTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isJumping]);

  // BREAK TIMER LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breakStatus !== 'active' && breakTimer > 0) {
        interval = setInterval(() => {
            setBreakTimer(prev => {
                if (prev <= 1) {
                    setBreakOver(true);
                    // Play sound here if possible, using visual for now
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [breakStatus, breakTimer]);


  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- HANDLERS ---

  const verifyBadge = async () => {
    if (!badgeId) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/roster/check/${badgeId}`);
      const data = await res.json();
      
      if (res.ok && data.assigned) {
        setEmployeeName(data.employee.name);
        setDriverNumber(data.driver.driverNumber);
        toast({ 
          title: "Login Verified", 
          description: `Welcome ${data.employee.name}. You are Driver #${data.driver.driverNumber}.` 
        });
      } else if (res.ok && !data.assigned) {
        toast({ 
          title: "No Shift Assigned", 
          description: `Hello ${data.employee.name}, please see supervisor for assignment.`,
          variant: "destructive"
        });
        setEmployeeName(data.employee.name);
        setDriverNumber("");
      } else {
        toast({ title: "Invalid Badge", description: "Employee not found.", variant: "destructive" });
        setEmployeeName("");
        setDriverNumber("");
      }
    } catch (e) {
      toast({ title: "Error", description: "Connection failed.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartShift = () => {
      if (!shiftRole || !driverNumber) return;
      // Show location permission prompt first
      setShowLocationPrompt(true);
  };

  const confirmStartShift = () => {
      setShowLocationPrompt(false);
      setShiftStarted(true);
      toast({ title: "Shift Started", description: `Driver #${driverNumber} • Role: ${shiftRole?.toUpperCase() || 'VAN'}` });
  };

  const handleStartBreak = (type: '15' | '30') => {
      const seconds = type === '15' ? 15 * 60 : 30 * 60;
      setBreakTimer(seconds);
      setBreakStatus(type === '15' ? 'break_15' : 'break_30');
      setBreaksTaken(prev => ({ ...prev, [type]: prev[type as '15' | '30'] + 1 })); // Increment Counter
      setShowBreakDialog(false);
      setBreakOver(false);
      toast({ title: "Break Started", description: `${type} minute timer set.` });
  };

  const handleEndBreak = () => {
      setBreakStatus('active');
      setBreakTimer(0);
      setBreakOver(false);
      toast({ title: "Welcome Back", description: "Break logged. Ready for assignment." });
  };

  const handleStartCrunch = () => {
    if (!crunchLane || !crunchTask) return;
    setIsCrunching(true);
    setShowCrunchDialog(false);
    setMode("crunch");
  };

  const handleStopCrunch = () => {
    setIsCrunching(false);
    setCrunchTimer(0);
    setCrunchLane("");
    setCrunchTask("");
    setMode("bulk");
  };
  
  const handleRetroactiveCrunch = () => {
      setShowRetroactiveDialog(false);
      toast({ title: "Time Logged", description: `${retroactiveMinutes} mins logged as Crunch Mode.` });
  };

  const handleManualLookup = () => {
      const input = manualInput.toUpperCase().trim();
      if (!input) return;

      // Direct Code Lookup
      if (GROUP_CODE_MAP[input]) {
          setManualLookupResult({ code: input, ...GROUP_CODE_MAP[input] });
          return;
      }

      // Reverse Lookup (Zone Search)
      const entry = Object.entries(GROUP_CODE_MAP).find(([code, data]) => 
          data.zone.toUpperCase().includes(input) || data.desc.toUpperCase().includes(input)
      );

      if (entry) {
          setManualLookupResult({ code: entry[0], ...entry[1] });
      } else {
          toast({ title: "Not Found", description: "No matching code or zone found.", variant: "destructive" });
          setManualLookupResult(null);
      }
  };

  const handleManualSelect = () => {
      if (!manualLookupResult) return;
      
      if (manualLookupResult.code === "DLR") {
          setShowDlrDialog(true);
      } else {
          setScannedData({
              vin: "MANUAL_ENTRY",
              workOrder: "N/A",
              groupCode: manualLookupResult.code
          });
          setDistanceToTarget(850);
      }
      setShowManualEntryDialog(false);
      setManualInput("");
      setManualLookupResult(null);
  };

  const handleSaveGasCode = () => {
    if (gasCode.length === 4) {
      setIsGasCodeSaved(true);
      setShowGasCodeDialog(false);
    }
  };

  const handleRequestPickup = () => {
      if (!pickupLocation) return;
      setIsPickupRequested(true);
      setShowPickupDialog(false);
      
      // Calculate mock ETA based on "Distance from Van"
      // Simulating that vans are 2-10 mins away
      const mockETA = Math.floor(Math.random() * 8) + 2; 
      setEstimatedPickupTime(mockETA);

      toast({ title: "Pickup Requested", description: `Van dispatch notified. ETA: ~${mockETA} mins` });
  };

  const handleExitShift = () => {
      setLocation("/dashboard");
  };

  // --- SCANNER LOGIC WITH GROUP CODES ---
  const handleScanTrigger = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      const codes = Object.keys(GROUP_CODE_MAP);
      // Higher chance of DLR for demo
      const randomCode = Math.random() > 0.6 ? "DLR" : codes[Math.floor(Math.random() * codes.length)];
      
      setScannedData({
        vin: `1G1...${Math.floor(Math.random()*9000)+1000}`,
        workOrder: `${Math.floor(Math.random()*9000000)+1000000}`,
        groupCode: randomCode
      });
      setDistanceToTarget(850 + Math.floor(Math.random() * 500)); 
      
      if (randomCode === "DLR") {
        setShowDlrDialog(true);
      } else {
        setTimeout(() => setScanSuccess(false), 3000);
      }
    }, 1500);
  };

  const handleDlrDecision = (hasArs: boolean) => {
      setShowDlrDialog(false);
      if (scannedData) {
          setScannedData({
              ...scannedData,
              groupCode: hasArs ? "DLR-ARS" : "DLR-STD"
          });
          setTimeout(() => setScanSuccess(false), 3000);
      }
  };
  
  const completeMove = () => {
      setScannedData(null);
      setMovesCompleted(prev => prev + 1);
      setCurrentMPH(prev => Math.min(prev + 0.1, 8.0)); 
  };

  const handleSaveNote = () => {
      localStorage.setItem("vanops_notepad", notepadContent);
      toast({ title: "Note Saved", description: "Your notes have been updated." });
      setShowNotepad(false);
  };

  const handleEvScan = () => {
      // Simulate scan
      const mockVin = `1G1...${Math.floor(Math.random()*9000)+1000}`;
      setEvVin(mockVin);
      toast({ title: "VIN Scanned", description: mockVin });
  };

  const handleEvSave = () => {
      if (!evVin) return;
      toast({ 
          title: evStatus === 'plugged' ? "EV Charging Started" : "EV Removed", 
          description: `VIN: ${evVin} • Status: ${evStatus.toUpperCase()}` 
      });
      setShowEvDialog(false);
      setEvVin("");
      setEvWorkOrder("");
  };

  const handleIssueSubmit = () => {
    if (issueReason === 'Needs Jump') {
      setIsJumping(true);
      setJumpTimer(0);
      setShowIssueReport(false);
    } else {
      setScannedData(null); 
      setShowIssueReport(false);
      setIssueReason("");
      setIssueNotes("");
    }
  };

  const completeJump = (success: boolean) => {
    setIsJumping(false);
    if (!success) setScannedData(null);
  };

  const handleCheckBlockingVin = () => {
      if (blockingVin.length > 4) {
          setBlockingCarInfo({ desc: "2019 Chevy Malibu", belongsIn: "Lane 5, Spot 12" });
      }
  };

  const handleReportBlockage = (action: 'queue' | 'move_now') => {
      if (action === 'queue') {
          toast({ title: "Obstruction Logged", description: "Task added to priority queue." });
      } else {
          toast({ title: "Correction Started", description: "Moving blocking vehicle (+1 Credit)." });
      }
      setShowBlockageDialog(false);
      setBlockingVin("");
      setBlockingCarInfo(null);
  };

  const issueOptions = [
    { id: "Needs Jump", label: "Needs Jump (Fixable)", icon: BatteryWarning, color: "text-yellow-600" },
    { id: "Bad Brakes", label: "Bad Brakes", icon: AlertCircle, color: "text-red-600" },
    { id: "Biohazard", label: "Biohazard", icon: AlertTriangle, color: "text-red-600" },
    { id: "Flat Tire", label: "Flat Tire", icon: XCircle, color: "text-orange-600" },
    { id: "Forklift Needed", label: "Needs Forklift Removal", icon: Truck, color: "text-slate-600" },
    { id: "Inoperable", label: "Inoperable / Won't Start", icon: Ban, color: "text-red-600" },
    { id: "Key Missing", label: "Key Missing", icon: AlertCircle, color: "text-slate-600" },
    { id: "Locked Out", label: "Locked Out", icon: XCircle, color: "text-slate-600" },
    { id: "Needs EV Charge", label: "Needs EV Charge", icon: Zap, color: "text-teal-600" },
    { id: "Out of Gas", label: "Out of Gas", icon: AlertTriangle, color: "text-orange-600" },
    { id: "Tow Away", label: "Tow Away", icon: Truck, color: "text-red-600" },
  ];

  // --- RENDER: SHIFT START SCREEN ---
  if (!shiftStarted) {
      return (
        <div className="flex flex-col h-screen bg-slate-50 p-6 animate-in fade-in">
            <div className="max-w-md mx-auto w-full space-y-8 mt-10">
                <div className="text-center">
                    <div className="bg-blue-600 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
                        <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Start Shift</h1>
                    <p className="text-slate-500">Set your daily assignment.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Badge ID / Employee Number</Label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. 8842" 
                                className="text-lg font-bold h-12"
                                value={badgeId}
                                onChange={(e) => setBadgeId(e.target.value)} 
                            />
                            <Button 
                                onClick={verifyBadge} 
                                disabled={isVerifying || !badgeId}
                                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                            >
                                {isVerifying ? "..." : "Verify"}
                            </Button>
                        </div>
                        {employeeName && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-2 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <div className="text-xs text-green-600 font-bold uppercase">Verified Employee</div>
                                    <div className="font-bold text-green-900">{employeeName}</div>
                                </div>
                                {driverNumber ? (
                                    <div className="text-right">
                                        <div className="text-xs text-green-600 font-bold uppercase">Assigned Driver #</div>
                                        <div className="text-xl font-black text-green-900">{driverNumber}</div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-orange-600 font-bold">No Shift Assigned</div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-xs text-slate-400 uppercase">Or Manual Bypass</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <div className="relative">
                             <Input 
                                type="number" 
                                placeholder="Manual Driver # Override" 
                                className="text-sm h-10 bg-slate-50 border-dashed"
                                value={driverNumber}
                                onChange={(e) => setDriverNumber(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Assignment / Role</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShiftRole("chute")} className={`p-3 rounded-xl border-2 text-left transition-all ${shiftRole === 'chute' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                                <Layers className="h-5 w-5 text-blue-600 mb-1" />
                                <div className="font-bold text-sm text-slate-900">The Chute</div>
                            </button>
                            <button onClick={() => setShiftRole("clean")} className={`p-3 rounded-xl border-2 text-left transition-all ${shiftRole === 'clean' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200 bg-white hover:border-green-200'}`}>
                                <Zap className="h-5 w-5 text-green-600 mb-1" />
                                <div className="font-bold text-sm text-slate-900">Clean Side</div>
                            </button>
                            <button onClick={() => setShiftRole("sold")} className={`p-3 rounded-xl border-2 text-left transition-all ${shiftRole === 'sold' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                                <DollarIcon className="h-5 w-5 text-orange-600 mb-1" />
                                <div className="font-bold text-sm text-slate-900">Sold Units</div>
                            </button>
                            <button onClick={() => setShiftRole("list")} className={`p-3 rounded-xl border-2 text-left transition-all ${shiftRole === 'list' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 bg-white hover:border-purple-200'}`}>
                                <ClipboardList className="h-5 w-5 text-purple-600 mb-1" />
                                <div className="font-bold text-sm text-slate-900">Task List</div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <Button className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800" disabled={!shiftRole || !driverNumber} onClick={handleStartShift}>
                        Begin Shift
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleExitShift}>
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Menu
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: BREAK MODE SCREEN ---
  if (breakStatus !== 'active') {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-in fade-in">
              <div className="w-full max-w-md space-y-8 text-center">
                  <div className={`h-32 w-32 rounded-full mx-auto flex items-center justify-center animate-pulse border-4 ${breakOver ? 'bg-red-600 border-red-400 shadow-[0_0_30px_red]' : 'bg-blue-600 border-blue-400 shadow-[0_0_30px_blue]'}`}>
                      {breakOver ? <BellRing className="h-16 w-16 text-white animate-bounce" /> : <Coffee className="h-16 w-16 text-white" />}
                  </div>

                  <div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                          {breakOver ? "BREAK OVER" : "On Break"}
                      </h1>
                      <div className={`text-6xl font-mono font-bold tracking-wider ${breakOver ? 'text-red-400' : 'text-blue-400'}`}>
                          {formatTime(breakTimer)}
                      </div>
                      {breakOver && (
                          <p className="text-red-300 mt-4 font-bold animate-pulse">PLEASE RETURN TO WORK</p>
                      )}
                  </div>

                  <Button 
                      size="lg" 
                      className={`w-full h-16 text-xl font-bold ${breakOver ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-700'}`}
                      onClick={handleEndBreak}
                  >
                      End Break & Clock In
                  </Button>
              </div>
          </div>
      );
  }

  // --- RENDER: MAIN APP ---
  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <WelcomeTrigger userName={user?.name} userRole="driver" />
      
      {/* STATUS BAR */}
      <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2 rounded-t-xl text-xs">
          <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-slate-700 px-2 py-0.5 rounded text-blue-200">DRIVER #{driverNumber}</div>
              {gpsStatus === 'locked' ? <Satellite className="h-3 w-3 text-green-400" /> : <Satellite className="h-3 w-3 text-red-400" />}
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded cursor-pointer border border-slate-700" onClick={() => setShowGasCodeDialog(true)}>
               <Fuel className="h-3 w-3 text-orange-400" />
               <span className="font-mono font-bold text-orange-400 hidden sm:inline">{isGasCodeSaved ? gasCode : 'CODE'}</span>
             </div>
             {/* BREAK BUTTON */}
             <button 
                 onClick={() => setShowBreakDialog(true)} 
                 className="flex items-center gap-1 bg-blue-900/50 hover:bg-blue-800 px-2 py-0.5 rounded border border-blue-800 text-blue-200 transition-colors"
             >
                 <Coffee className="h-3 w-3" />
                 <span className="font-bold hidden sm:inline">BREAK</span>
             </button>
             {/* EXIT BUTTON */}
             <button 
                 onClick={handleExitShift}
                 className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded border border-slate-600 text-slate-300 transition-colors"
                 title="Exit to Menu"
             >
                 <LogOut className="h-3 w-3" />
             </button>
             {/* HELP BUTTON */}
             <button 
                 onClick={() => setShowOnboarding(true)}
                 className="flex items-center justify-center bg-blue-900 hover:bg-blue-800 w-7 h-7 rounded border border-blue-700 text-blue-300 transition-colors"
                 title="Help Guide"
             >
                 <HelpCircle className="h-3 w-3" />
             </button>
          </div>
      </div>

      {/* Shift & Weather Card */}
      <ShiftWeatherCard 
        userId={user?.id?.toString()}
        userName={user?.name}
        userRole={user?.role}
        compact={true}
        showClockIn={true}
      />

      {/* Driver Assignments from Supervisor */}
      <DriverAssignmentView 
        driverId={driverNumber}
        driverName={employeeName || `Driver ${driverNumber}`}
      />

      {/* MODE HEADER */}
      <Card className={`border-l-4 ${mode === 'crunch' ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500 bg-white'}`}>
        <CardContent className="p-4 flex justify-between items-center">
            <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Mode</div>
                <div className={`text-xl font-black flex items-center gap-2 ${mode === 'crunch' ? 'text-red-600' : 'text-slate-900'}`}>
                    {mode === 'crunch' ? <Flame className="h-5 w-5 fill-red-600" /> : <Truck className="h-5 w-5" />}
                    {mode === 'crunch' ? 'CRUNCH OPS' : 'BULK MOVE'}
                </div>
            </div>
            {mode === 'crunch' ? (
                <div className="text-right">
                    <div className="text-xs font-bold text-red-600 animate-pulse">ACTIVE TIMER</div>
                    <div className="text-2xl font-mono font-bold text-red-700">{formatTime(crunchTimer)}</div>
                </div>
            ) : (
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">PERFORMANCE</div>
                    <div className={`text-2xl font-mono font-bold ${currentMPH < TARGET_MPH ? 'text-red-500' : 'text-green-600'}`}>
                        {currentMPH.toFixed(1)} <span className="text-xs text-slate-400">MPH</span>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      {/* INSTRUCTION CARD (Dynamic) */}
      <Card className="overflow-hidden border-blue-100 shadow-lg shadow-blue-100/50">
          <div className="bg-blue-600 p-1 h-1 w-full"></div>
          <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase mb-1">Next Assignment</h3>
                      {isScanning ? (
                          <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                              <Loader className="h-5 w-5 animate-spin" />
                              <span className="font-bold text-lg">Scanning VIN...</span>
                          </div>
                      ) : scannedData ? (
                          <div>
                              <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                  {scannedData.groupCode}
                                  {scannedData.groupCode.includes("DLR") && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Verify</Badge>}
                              </div>
                              <div className="text-slate-500 font-mono text-sm mt-1">VIN: {scannedData.vin}</div>
                          </div>
                      ) : (
                          <div className="text-xl text-slate-400 italic font-medium">Ready to scan...</div>
                      )}
                  </div>
                  
                  {/* SCAN BUTTON */}
                  <Button 
                      size="lg" 
                      className={`h-14 w-14 rounded-2xl shadow-xl ${scannedData ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={scannedData ? completeMove : handleScanTrigger}
                  >
                      {scannedData ? <CheckCircle2 className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
                  </Button>
              </div>

              {/* DESTINATION REVEAL */}
              {scannedData && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
                      <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                              <Navigation className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Deliver To</div>
                              <div className="text-lg font-bold text-slate-900 leading-tight">
                                  {GROUP_CODE_MAP[scannedData.groupCode]?.zone || "Unknown Zone"}
                              </div>
                              <div className="text-sm text-slate-500 mt-1">
                                  {GROUP_CODE_MAP[scannedData.groupCode]?.desc}
                              </div>
                              
                              {/* GPS MOCKUP */}
                              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                  <MapPin className="h-3 w-3" />
                                  {distanceToTarget} ft to destination • ~{(distanceToTarget / 15 / 1.467).toFixed(0)}s away
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </CardContent>
      </Card>

      {/* BREAK MANAGER - PROMINENT POSITION */}
      <BreakManager 
        driverNumber={driverNumber} 
        driverName={`Driver ${driverNumber}`} 
        readOnly={userRole === 'inventory'}
      />

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50" onClick={() => setShowCrunchDialog(true)}>
              <Flame className="h-6 w-6 text-red-500" />
              <div className="text-xs font-bold">Crunch Mode</div>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50" onClick={() => setShowEvDialog(true)}>
              <PlugZap className="h-6 w-6 text-teal-600" />
              <div className="text-xs font-bold">EV Ops</div>
          </Button>

          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50" onClick={() => setShowPickupDialog(true)}>
              <Hand className="h-6 w-6 text-orange-500" />
              <div className="text-xs font-bold">Request Pickup</div>
          </Button>

          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-yellow-300 hover:bg-yellow-50" onClick={() => setShowIssueReport(true)}>
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div className="text-xs font-bold">Report Issue</div>
          </Button>

          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50" onClick={() => setShowBlockageDialog(true)}>
              <Ban className="h-6 w-6 text-purple-600" />
              <div className="text-xs font-bold">Blockage</div>
          </Button>
          
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50" onClick={() => setShowManualEntryDialog(true)}>
              <Hash className="h-6 w-6 text-indigo-600" />
              <div className="text-xs font-bold">Manual Entry</div>
          </Button>
      </div>

      {/* FOOTER / NOTEPAD */}
      <Button variant="ghost" className="w-full text-slate-400 text-xs" onClick={() => setShowNotepad(true)}>
          <NotebookPen className="h-3 w-3 mr-2" /> Driver Notes / Notepad
      </Button>

      {/* --- DIALOGS --- */}
      
      {/* LOCATION PERMISSION PROMPT */}
      <Dialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <LocateFixed className="h-5 w-5 text-blue-600" /> Turn On Location
                  </DialogTitle>
                  <DialogDescription>
                      To use Lot Ops Pro, you need to turn on location settings on your phone.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                          <Satellite className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="space-y-2">
                              <p className="font-semibold text-sm text-slate-900">Why we need this:</p>
                              <ul className="text-sm text-slate-700 space-y-1.5">
                                  <li className="flex items-start gap-2">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>Track your location on the lot so supervisors can see where you are</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>Enable messaging with dispatch and other drivers</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>Help you navigate to pickup and dropoff spots</span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                          <BellRing className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                              <p className="font-semibold text-sm text-slate-900 mb-1">What happens next:</p>
                              <p className="text-sm text-slate-700">
                                  After you tap "OK, Turn On Location" below, your phone will ask you to allow location access. 
                                  <span className="font-semibold"> Tap "Allow" or "While Using the App"</span> to continue.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setShowLocationPrompt(false)}>Cancel</Button>
                  <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={confirmStartShift}
                      data-testid="button-confirm-location"
                  >
                      <LocateFixed className="h-4 w-4 mr-2" />
                      OK, Turn On Location
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* BREAK DIALOG */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Break Time</DialogTitle>
                  <DialogDescription>Select break duration. This will pause your MPH tracking.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleStartBreak('15')}>
                      <Coffee className="h-8 w-8 text-blue-500" />
                      <span className="font-bold">15 Min Break</span>
                      <span className="text-xs text-slate-500">{breaksTaken[15]} taken today</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleStartBreak('30')}>
                      <Utensils className="h-8 w-8 text-green-500" />
                      <span className="font-bold">30 Min Lunch</span>
                      <span className="text-xs text-slate-500">{breaksTaken[30]} taken today</span>
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* CRUNCH MODE DIALOG */}
      <Dialog open={showCrunchDialog} onOpenChange={setShowCrunchDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-600" /> Start Crunch Mode
                  </DialogTitle>
                  <DialogDescription>
                      Tracking non-quota moves. Select task type.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Reason / Task</Label>
                      <Select onValueChange={setCrunchTask}>
                          <SelectTrigger><SelectValue placeholder="Select Task Type" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="fronting">Fronting Row</SelectItem>
                              <SelectItem value="jam">Clearing Jam</SelectItem>
                              <SelectItem value="supervisor">Supervisor Request</SelectItem>
                              <SelectItem value="audit">Lot Audit / Scan</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Lane / Location</Label>
                      <Input placeholder="e.g. Lane 5" value={crunchLane} onChange={e => setCrunchLane(e.target.value)} />
                  </div>
                  <div className="pt-2">
                      <Button 
                          variant="ghost" 
                          className="text-xs text-blue-600 h-auto p-0" 
                          onClick={() => { setShowCrunchDialog(false); setShowRetroactiveDialog(true); }}
                      >
                          Forgot to start timer? Log retroactive time.
                      </Button>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCrunchDialog(false)}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleStartCrunch} disabled={!crunchTask || !crunchLane}>Start Timer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* RETROACTIVE CRUNCH DIALOG */}
      <Dialog open={showRetroactiveDialog} onOpenChange={setShowRetroactiveDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Log Past Crunch Time</DialogTitle>
                  <DialogDescription>Add time to your daily log for untracked work.</DialogDescription>
              </DialogHeader>
              <div className="py-6">
                  <div className="text-center text-4xl font-bold text-slate-900 mb-4">
                      {retroactiveMinutes} <span className="text-lg text-slate-500 font-normal">min</span>
                  </div>
                  <Slider 
                      value={[retroactiveMinutes]} 
                      onValueChange={(v) => setRetroactiveMinutes(v[0])} 
                      max={60} 
                      step={5} 
                      className="w-full" 
                  />
              </div>
              <DialogFooter>
                  <Button onClick={handleRetroactiveCrunch}>Log Time</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* ISSUE REPORT DIALOG */}
      <Dialog open={showIssueReport} onOpenChange={setShowIssueReport}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Report Vehicle Issue</DialogTitle>
                  <DialogDescription>Select the issue to flag this VIN.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 py-2">
                  {issueOptions.map((opt) => (
                      <button 
                          key={opt.id}
                          onClick={() => setIssueReason(opt.id)}
                          className={`p-3 rounded-lg border-2 text-left flex flex-col items-center gap-2 hover:bg-slate-50 transition-all ${issueReason === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}
                      >
                          <opt.icon className={`h-6 w-6 ${opt.color}`} />
                          <span className="text-xs font-bold text-center leading-tight">{opt.label}</span>
                      </button>
                  ))}
              </div>
              {issueReason && (
                  <div className="animate-in slide-in-from-bottom-2">
                      <Label>Additional Notes</Label>
                      <Textarea 
                          placeholder="Describe location or details..." 
                          className="mt-1.5"
                          value={issueNotes}
                          onChange={e => setIssueNotes(e.target.value)}
                      />
                  </div>
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={() => setShowIssueReport(false)}>Cancel</Button>
                  <Button onClick={handleIssueSubmit} disabled={!issueReason} className="bg-red-600 hover:bg-red-700">Submit Report</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* GAS CODE DIALOG */}
      <Dialog open={showGasCodeDialog} onOpenChange={setShowGasCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Gas Code</DialogTitle>
            <DialogDescription>Enter today's 4-digit fuel pump code.</DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
             <Input 
                className="text-center text-4xl tracking-[1em] font-mono h-20 w-60" 
                maxLength={4} 
                value={gasCode}
                onChange={(e) => setGasCode(e.target.value)}
                placeholder="0000"
             />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGasCode} disabled={gasCode.length !== 4}>Save Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DLR PROMPT DIALOG */}
      <Dialog open={showDlrDialog} onOpenChange={setShowDlrDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Dealer Sticker Check</DialogTitle>
                  <DialogDescription>Does this unit have an "ARS" sticker on the windshield?</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                  <Button size="lg" className="h-24 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => handleDlrDecision(true)}>
                      YES (ARS)
                  </Button>
                  <Button size="lg" variant="outline" className="h-24 text-lg" onClick={() => handleDlrDecision(false)}>
                      NO (Standard)
                  </Button>
              </div>
          </DialogContent>
      </Dialog>

      {/* MANUAL ENTRY DIALOG */}
      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Manual Group Code Entry</DialogTitle>
                  <DialogDescription>Enter code (e.g. "DSC") or Zone Name.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                      <Input 
                          placeholder="Code or Zone..." 
                          className="text-lg uppercase" 
                          value={manualInput}
                          onChange={e => setManualInput(e.target.value)}
                      />
                      <Button onClick={handleManualLookup}>Search</Button>
                  </div>
                  
                  {manualLookupResult && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in">
                          <div className="text-xs font-bold text-slate-500 uppercase">Found Match</div>
                          <div className="text-xl font-bold text-slate-900">{manualLookupResult.zone}</div>
                          <div className="text-sm text-slate-600 mb-4">{manualLookupResult.desc}</div>
                          <Button className="w-full" onClick={handleManualSelect}>
                              Select & Route
                          </Button>
                      </div>
                  )}
              </div>
          </DialogContent>
      </Dialog>

      {/* PICKUP REQUEST DIALOG */}
      <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Request Pickup</DialogTitle>
                  <DialogDescription>Where are you waiting?</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Label>Current Location</Label>
                  <Input 
                      placeholder="e.g. Lane 55 End" 
                      value={pickupLocation} 
                      onChange={e => setPickupLocation(e.target.value)} 
                      className="mt-2"
                  />
              </div>
              <DialogFooter>
                  <Button onClick={handleRequestPickup} disabled={!pickupLocation}>Request Van</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* BLOCKAGE REPORT DIALOG */}
      <Dialog open={showBlockageDialog} onOpenChange={setShowBlockageDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Report Blockage</DialogTitle>
                  <DialogDescription>Enter VIN of vehicle blocking the way.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                   <div className="flex gap-2">
                      <Input 
                          placeholder="Blocking VIN..." 
                          value={blockingVin}
                          onChange={e => setBlockingVin(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleCheckBlockingVin}>Check</Button>
                   </div>
                   
                   {blockingCarInfo && (
                       <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                           <div className="font-bold text-red-900">{blockingCarInfo.desc}</div>
                           <div className="text-sm text-red-700">Belongs in: {blockingCarInfo.belongsIn}</div>
                       </div>
                   )}

                   {blockingCarInfo && (
                       <div className="grid grid-cols-2 gap-3 pt-2">
                           <Button variant="outline" onClick={() => handleReportBlockage('queue')}>
                               Queue for Later
                           </Button>
                           <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleReportBlockage('move_now')}>
                               Move Now (+Credit)
                           </Button>
                       </div>
                   )}
              </div>
          </DialogContent>
      </Dialog>

       {/* NOTEPAD DIALOG */}
      <Dialog open={showNotepad} onOpenChange={setShowNotepad}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Driver Notepad</DialogTitle>
                  <DialogDescription>Personal notes (saved locally).</DialogDescription>
              </DialogHeader>
              <Textarea 
                  className="min-h-[200px]" 
                  placeholder="Type notes here..." 
                  value={notepadContent}
                  onChange={e => setNotepadContent(e.target.value)}
              />
              <DialogFooter>
                  <Button onClick={handleSaveNote}>Save & Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* EV DIALOG */}
      <Dialog open={showEvDialog} onOpenChange={setShowEvDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>EV Charging Ops</DialogTitle>
                  <DialogDescription>Scan EV to log charging status.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <Button variant="outline" className="w-full py-8 border-dashed" onClick={handleEvScan}>
                      <QrCode className="mr-2 h-5 w-5" /> Scan VIN
                  </Button>
                  {evVin && (
                      <div className="space-y-3 animate-in fade-in">
                          <div className="font-mono font-bold text-center bg-slate-100 p-2 rounded">{evVin}</div>
                          <div className="grid grid-cols-2 gap-2">
                               <Button 
                                  variant={evStatus === 'plugged' ? 'default' : 'outline'}
                                  className={evStatus === 'plugged' ? 'bg-green-600' : ''}
                                  onClick={() => setEvStatus('plugged')}
                               >
                                  Plugged In
                               </Button>
                               <Button 
                                  variant={evStatus === 'unplugged' ? 'default' : 'outline'}
                                  className={evStatus === 'unplugged' ? 'bg-slate-600' : ''}
                                  onClick={() => setEvStatus('unplugged')}
                               >
                                  Unplugged
                               </Button>
                          </div>
                      </div>
                  )}
              </div>
              <DialogFooter>
                  <Button onClick={handleEvSave} disabled={!evVin}>Log Action</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* FACILITY NAVIGATOR MAP */}
      <FacilityMapNavigator currentDriverLocation={scannedData?.groupCode || ""} />
      
      {/* Floating Message Button */}
      <FloatingMessageButton 
        role="driver" 
        userId={driverNumber} 
        userName={employeeName || `Driver ${driverNumber}`}
      />
      
      {/* Easter Egg Popup - Random driver bios */}
      <EasterEggPopup currentDriverNumber={driverNumber} />
      
      {/* Lot Spot Reporter */}
      <LotSpotReporter 
        reporterName={employeeName || `Driver ${driverNumber}`}
        reporterRole="van_driver"
      />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        role="driver" 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      {/* Mock Loader Component for the scanner animation */}
      <div className="hidden">
        <Loader className="animate-spin" />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function Loader({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function DollarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
    )
}
