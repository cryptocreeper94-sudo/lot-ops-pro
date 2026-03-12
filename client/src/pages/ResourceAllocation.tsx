import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Users, 
  Truck, 
  ArrowRight, 
  Sliders, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  LayoutDashboard,
  AlertTriangle,
  Minimize2,
  Settings,
  MapPin,
  Edit3,
  Save,
  Plus,
  Calendar,
  ArrowRightLeft,
  Calculator,
  Gauge,
  Layers,
  Power,
  PowerOff,
  CalendarDays,
  ParkingSquare,
  Merge,
  Unplug,
  Crown,
  Gem,
  Container,
  ArrowDownRight,
  ListTodo,
  Search,
  ExternalLink,
  Send,
  Ruler,
  Hand,
  Map,
  Coffee,
  Route,
  HelpCircle,
  Key,
  Lock,
  Shield,
  ShieldCheck,
  Copy,
  ClipboardList,
  Sparkles,
  Zap,
  Activity
} from "lucide-react";
import { BentoGrid, BentoTile, BentoRow } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent, AccordionSection } from "@/components/ui/premium-accordion";
import { SwipeCarousel, HorizontalScroll } from "@/components/ui/premium-carousel";
import { PremiumButton, IconButton } from "@/components/ui/premium-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ChatOverlay } from "@/components/ChatOverlay";
import { BetaWelcomeModal } from "@/components/BetaWelcomeModal";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { QuarterlyReport } from "@/components/QuarterlyReport";
import { AiSuggestions } from "@/components/AiSuggestions";
import { LotManager } from "@/components/LotManager";
import { LiveDriverMap } from "@/components/LiveDriverMap";
import { BarChart3, FileText } from "lucide-react";
// WeatherWidget and NotesWidget moved to global components in App.tsx

import { RosterManager } from "@/components/RosterManager";
import { AssignmentManager } from "@/components/AssignmentManager";
import { SandboxModeIndicator } from "@/components/SandboxModeIndicator";
import { SandboxHelpButton } from "@/components/SandboxHelpButton";
import { HelpButton } from "@/components/HelpButton";
import { PerformanceReports } from "@/components/PerformanceReports";
import { Version2Button } from "@/components/Version2Roadmap";
import { LotSpotReporter } from "@/components/LotSpotReporter";
import { LotAvailabilityBoard } from "@/components/LotAvailabilityBoard";
import { QuickHelpPanel } from "@/components/ui/help-tooltip";
import { BetaTestingChecklist } from "@/components/BetaTestingChecklist";
import { SupervisorLiveWall } from "@/components/SupervisorLiveWall";
import { DashboardControls } from "@/components/DashboardControls";
import { EndOfShiftReport } from "@/components/EndOfShiftReport";
import { ShiftReportGenerator } from "@/components/ShiftReportGenerator";
import { ExoticKeyDashboard, SupervisorKeyPreferences } from "@/components/ExoticKeyTracking";
import { LotVisionDashboardWidget } from "@/components/LotVisionLauncher";
import { TeresaSupervisorOnboarding } from "@/components/TeresaSupervisorOnboarding";
import { SupervisorOnboarding } from "@/components/SupervisorOnboarding";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import ServiceDriverManagement from "@/components/ServiceDriverManagement";
import { EquipmentCheckoutLog } from "@/components/EquipmentCheckoutLog";
import { NavigationControl } from "@/components/NavigationControl";
import { AiOptimizationDashboard } from "@/components/AiOptimizationDashboard";
import { SupervisorAssignmentPanel } from "@/components/SupervisorAssignmentPanel";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { PageTutorialButton, pageTutorialContent } from "@/components/PageTutorialButton";
import { PopupGameToggle, PopupGameSettings } from "@/components/TeamAvatarPopupGame";

// Types for Configuration
interface Section {
  id: string;
  name: string;
  type: "static" | "dynamic" | "sold_lot" | "vip" | "utility" | "chute" | "inventory";
  capacity: number;
  overflowsTo?: string[]; // IDs of sections this overflows into
  distanceFromChute?: number; // Distance in Feet from Chute (101)
}

interface SaleLane {
  id: number;
  capacity: number;
  day: "Tuesday" | "Wednesday" | "Thursday_Ford" | "Both";
  status: "active" | "inactive";
  mergedWith?: number; // ID of the lane this one is merged into
  zone?: string; // Location logic (e.g. "West Lot", "East Lot")
  spillsInto?: number; // ID of the lane this one spills into (across the road)
}

interface PriorityMove {
  id: string;
  vin: string;
  desc: string;
  from: string;
  to: string;
  status: "pending" | "assigned" | "completed";
  priority: "high" | "normal";
}

interface PickupRequest {
  id: string;
  driverName: string;
  location: string;
  timestamp: string;
  status: "waiting" | "assigned" | "picked_up";
}

export default function ResourceAllocation() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Onboarding Tutorial - Auto-show for first 5 logins
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const loginCount = parseInt(localStorage.getItem('onboarding_supervisor_count') || "0");
    return loginCount < 5;
  });

  // Supervisor Onboarding (Show on first 5 logins OR when Help is clicked)
  const [showSupervisorTutorial, setShowSupervisorTutorial] = useState(false);
  const [showSupervisorHelp, setShowSupervisorHelp] = useState(false);

  // Track if onboarding was already shown - DISABLED: Users now directed to Settings for policies
  // The supervisor tutorial can be manually triggered via the Help button instead
  useEffect(() => {
    // Auto-show disabled - users are now directed to Settings page for policies and onboarding
    // Tutorial remains available via Help button click
  }, []);

  // Daily Access Code State
  const [dailyCode, setDailyCode] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(true);
  
  // Load today's daily access code
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

  // Shift Toggle (First Shift / Second Shift)
  const [currentShift, setCurrentShift] = useState<'first' | 'second'>(() => {
    return (localStorage.getItem('supervisor_shift') as 'first' | 'second') || 'first';
  });

  const toggleShift = (shift: 'first' | 'second') => {
    setCurrentShift(shift);
    localStorage.setItem('supervisor_shift', shift);
    toast({
      title: `Switched to ${shift === 'first' ? 'First' : 'Second'} Shift`,
      description: `Now managing ${shift === 'first' ? 'First' : 'Second'} Shift operations`,
    });
  };

  // Auth Check
  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
        toast({ title: "Access Denied", description: "Please log in as a supervisor.", variant: "destructive" });
        setLocation("/");
        return;
    }
    try {
        const user = JSON.parse(userStr);
        if (user.role !== "supervisor" && user.role !== "admin") {
            toast({ title: "Restricted Area", description: "Supervisor access required.", variant: "destructive" });
            setLocation("/dashboard");
        } else {
             // Personalized Greeting for Teresa
             if (user.name && user.name.includes("Teresa")) {
                 const hour = new Date().getHours();
                 const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                 
                 setTimeout(() => {
                     toast({ 
                         title: `${timeGreeting} Teresa!`, 
                         description: "Hope you're having a great day! Ready to manage the lot?",
                         className: "bg-gradient-to-r from-purple-50 to-blue-50 border-blue-200"
                     });
                 }, 500);
             }
        }
    } catch (e) {
        setLocation("/");
    }
  }, []);

  const [activeTab, setActiveTabState] = useState(() => 
    localStorage.getItem('lotops_supervisor_tab') || "config"
  );
  
  // Persist activeTab to localStorage
  const setActiveTab = (tab: string) => {
    localStorage.setItem('lotops_supervisor_tab', tab);
    setActiveTabState(tab);
  }; // Default to config to show map updates
  const [showHelp, setShowHelp] = useState(false);
  const [showQuarterlyReport, setShowQuarterlyReport] = useState(false);
  
  // PIN Management
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPin, setNewPin] = useState("");
  const [safetyAdvisors, setSafetyAdvisors] = useState<any[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  
  // Load users for PIN management
  useEffect(() => {
    const loadUsers = async () => {
      const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
      if (isDemoMode) return;
      
      try {
        const [safetyRes, driverRes] = await Promise.all([
          fetch('/api/users/role/safety_advisor'),
          fetch('/api/users/drivers')
        ]);
        
        if (safetyRes.ok) setSafetyAdvisors(await safetyRes.json());
        if (driverRes.ok) setAllDrivers(await driverRes.json());
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    
    if (activeTab === 'pins') {
      loadUsers();
    }
  }, [activeTab]);

  // Listen for tutorial tab navigation events
  useEffect(() => {
    const handleTutorialTabSelect = (e: CustomEvent<{ tabValue: string }>) => {
      setActiveTab(e.detail.tabValue);
    };
    window.addEventListener('tutorial-select-tab', handleTutorialTabSelect as EventListener);
    return () => {
      window.removeEventListener('tutorial-select-tab', handleTutorialTabSelect as EventListener);
    };
  }, []);

  // Check for pending tab from tutorial navigation on mount
  useEffect(() => {
    const pendingTab = sessionStorage.getItem('tutorial-pending-tab');
    if (pendingTab) {
      setActiveTab(pendingTab);
      sessionStorage.removeItem('tutorial-pending-tab');
    }
  }, []);
  
  const openPinDialog = (user: any) => {
    setSelectedUser(user);
    setNewPin("");
    setShowPinDialog(true);
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
            requestorRole: 'supervisor',
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
      title: "✓ PIN Changed",
      description: `PIN updated for ${selectedUser.name}`,
    });
    
    setNewPin("");
    setShowPinDialog(false);
    setSelectedUser(null);
  };
  
  // --- CONFIG STATE ---
  const [currentWeek, setCurrentWeekState] = useState(() => 
    parseInt(localStorage.getItem('lotops_current_week') || "42")
  );
  
  const setCurrentWeek = (week: number) => {
    localStorage.setItem('lotops_current_week', String(week));
    setCurrentWeekState(week);
  }; // Week 1-52
  
  const [shiftMode, setShiftModeState] = useState<"Monday_Prep" | "Tuesday_Sale" | "Wednesday_Sale" | "Thursday_Cleanup">(() => 
    (localStorage.getItem('lotops_shift_mode') as any) || "Monday_Prep"
  );
  
  const setShiftMode = (mode: "Monday_Prep" | "Tuesday_Sale" | "Wednesday_Sale" | "Thursday_Cleanup") => {
    localStorage.setItem('lotops_shift_mode', mode);
    setShiftModeState(mode);
  };
  
  // Updated with Manheim Nashville Map Data & User Specifics
  const [sections, setSections] = useState<Section[]>([
    // THE CHUTE (101) & Overflows
    { 
      id: "101", 
      name: "The Chute (Inbound)", 
      type: "chute", 
      capacity: 150,
      overflowsTo: ["140", "150", "160", "170"],
      distanceFromChute: 0
    },
    { id: "140", name: "Chute Overflow / Inventory", type: "utility", capacity: 60, distanceFromChute: 200 },
    { id: "150", name: "Chute Overflow / Inventory", type: "utility", capacity: 60, distanceFromChute: 250 },
    { id: "160", name: "Inventory / Chute Overflow", type: "utility", capacity: 60, distanceFromChute: 300 },
    { id: "170", name: "Inventory / Chute Overflow", type: "utility", capacity: 60, distanceFromChute: 350 },

    // VIP / Exotics
    { id: "180", name: "High Value Inventory (Exotics)", type: "vip", capacity: 40, distanceFromChute: 1200 },
    { id: "190", name: "High Value Inventory (Exotics)", type: "vip", capacity: 40, distanceFromChute: 1250 },
    { id: "500", name: "VIP Sold / High Value", type: "vip", capacity: 60, distanceFromChute: 1400 },
    
    // The Cage (Far Side)
    { id: "591-599", name: "The Cage (Inventory Only)", type: "inventory", capacity: 400, distanceFromChute: 2300 },

    // Utility / Overflow
    { id: "701", name: "Inventory (General)", type: "inventory", capacity: 120, distanceFromChute: 1800 },
    { id: "701-F", name: "Oversized (Fence Only)", type: "utility", capacity: 30, distanceFromChute: 1850 },
    
    // Specific Manufacturer Inventory
    { id: "516", name: "Ford Motor Credit (FOR Only)", type: "inventory", capacity: 50, distanceFromChute: 1680 },
    
    // General Inventory
    { id: "513-515", name: "Inventory (General)", type: "inventory", capacity: 150, distanceFromChute: 1650 },
    { id: "517-518", name: "Inventory (General)", type: "inventory", capacity: 100, distanceFromChute: 1700 },
    
    // Standard Sections
    { id: "102", name: "Inspections / Inbound", type: "static", capacity: 100, distanceFromChute: 100 },
    { id: "301-302", name: "Detail Shop", type: "static", capacity: 100, distanceFromChute: 800 },
    { id: "309", name: "Mech Shop", type: "static", capacity: 80, distanceFromChute: 850 },
    { id: "303-306", name: "Body Shop", type: "static", capacity: 120, distanceFromChute: 900 },
    { id: "400", name: "Imaging / Cleanside", type: "static", capacity: 400, distanceFromChute: 600 },
    { id: "200-258", name: "Sign Off / Vroom", type: "static", capacity: 250, distanceFromChute: 1500 },
    
    // Other Inventory
    { id: "501-512", name: "Inventory (Standard)", type: "inventory", capacity: 300, distanceFromChute: 1600 }, 
    { id: "519-525", name: "Inventory (Standard)", type: "inventory", capacity: 200, distanceFromChute: 1750 }, 
    
    { id: "601-618", name: "Wednesday Inventory", type: "inventory", capacity: 500, distanceFromChute: 1700 },
    { id: "801-820", name: "Sold Storage", type: "sold_lot", capacity: 1200, distanceFromChute: 2000 },
    { id: "TRA", name: "TRA / Paint (694-699)", type: "static", capacity: 200, distanceFromChute: 2100 },
  ]);

  // Generate 55 Lanes with Day Logic
  const [lanes, setLanes] = useState<SaleLane[]>(
    Array.from({ length: 55 }, (_, i) => {
      const id = i + 1;
      let day: "Tuesday" | "Wednesday" | "Thursday_Ford" | "Both" = "Wednesday"; // Default 1-22
      if (id >= 41 && id <= 52) day = "Tuesday";
      
      return {
        id,
        capacity: 70, // Default per user (1-70)
        day,
        status: "active",
        zone: "Main Sale Lot"
      };
    })
  );

  // Config Dialog State
  const [selectedLane, setSelectedLane] = useState<SaleLane | null>(null);
  const [isLaneDialogOpen, setIsLaneDialogOpen] = useState(false);
  const [editCapacity, setEditCapacity] = useState(70);
  const [editStatus, setEditStatus] = useState(true); // true = active
  const [editDay, setEditDay] = useState("Wednesday");
  const [editZone, setEditZone] = useState("Main Sale Lot");
  const [editSpillover, setEditSpillover] = useState<string>("none");

  // Distance Dialog State
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isDistanceDialogOpen, setIsDistanceDialogOpen] = useState(false);
  const [editDistance, setEditDistance] = useState(0);

  // Travel Time Calculator State
  const [testFrom, setTestFrom] = useState<string>("");
  const [testTo, setTestTo] = useState<string>("");
  const [testResult, setTestResult] = useState<string | null>(null);

  // Overflow Zones State
  const [overflowConfig, setOverflowConfig] = useState({
    laneRoads: false, // Parking in roads between lanes
    grassLines: false, // Parking on grass (500/515)
    arenaFront: false, // 600
    arenaBack: false, // 700
    fence701: true, // 701 Fence (Always active for oversized)
  });

  // Dispatch / Priority List State
  const [priorityMoves, setPriorityMoves] = useState<PriorityMove[]>([
    { id: "M-101", vin: "...8842", desc: "2022 Ford Mach-E", from: "Chute (101)", to: "Lane 41", status: "assigned", priority: "high" },
    { id: "M-102", vin: "...9931", desc: "2020 Chevy F-150", from: "Detail", to: "Lane 12", status: "pending", priority: "normal" },
    { id: "M-103", vin: "...2210", desc: "2023 Tesla Model Y", from: "Inbound", to: "EV Charging", status: "pending", priority: "high" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [newMove, setNewMove] = useState({ vin: "", desc: "", from: "", to: "" });

  // Pickup Request State
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([
    { id: "P-1", driverName: "Sarah J.", location: "Lane 55", timestamp: "2m ago", status: "waiting" },
    { id: "P-2", driverName: "Mike R.", location: "The Cage (591)", timestamp: "5m ago", status: "waiting" },
  ]);

  // Service Truck Driver State
  const [serviceTruckDriver, setServiceTruckDriver] = useState(() => {
    return localStorage.getItem('service_truck_driver') || 'James';
  });

  useEffect(() => {
    localStorage.setItem('service_truck_driver', serviceTruckDriver);
  }, [serviceTruckDriver]);

  // Resource Inputs
  const [driverCount, setDriverCount] = useState(12);
  const [vanCount, setVanCount] = useState(8);
  const [cleanSideVolume, setCleanSideVolume] = useState(120); // Daily var
  const [salePrepVolume, setSalePrepVolume] = useState(350); // Cars to move to lanes

  // --- BENCHMARK CALCULATOR STATE ---
  // Updated defaults for 326 Acre Facility
  const [speedLimit, setSpeedLimit] = useState(15); // mph
  const [avgDistance, setAvgDistance] = useState(1.8); // miles (Increased for 326 acres)
  const [turnaroundTime, setTurnaroundTime] = useState(7); // minutes (Increased for larger lot finding)
  
  // Derived Goal
  const calculateBenchmark = () => {
      const travelTimeMin = (avgDistance / speedLimit) * 60;
      const totalCycleTime = travelTimeMin + turnaroundTime;
      return (60 / totalCycleTime).toFixed(1); // Moves per hour
  };
  
  const [calculatedGoal, setCalculatedGoal] = useState(calculateBenchmark());

  // --- SMART CREW CALCULATOR STATE (NEW) ---
  const [crewMoves, setCrewMoves] = useState({
    chute: 150,
    cleanSide: 40,
    shopsReady: 60, // NEW: Separate from Inventory
    sold: 0,
    inventory: 200
  });
  
  // Calculated Allocation Plan
  const [allocation, setAllocation] = useState<{
    chuteVans: number;
    cleanLoopVans: number; // Clean Side <-> Sold
    shopsLoopVans: number; // Shops <-> Sold
    inventoryVans: number;
    movesPerHour: number;
    estCompletion: string;
  } | null>(null);

  useEffect(() => {
      setCalculatedGoal(calculateBenchmark());
  }, [speedLimit, avgDistance, turnaroundTime]);
  
  // --- SMART ALLOCATION LOGIC ---
  const calculateSmartAllocation = () => {
      const totalDrivers = driverCount; 
      const totalMoves = crewMoves.chute + crewMoves.cleanSide + crewMoves.shopsReady + crewMoves.sold + crewMoves.inventory;
      
      if (totalMoves === 0 || totalDrivers === 0) {
          setAllocation(null);
          return;
      }

      // LOGIC UPDATE: LOOP OPTIMIZATION
      // Instead of dedicating vans to "Sold" exclusively, we pair "Sold" moves with "Clean Side" and "Shops" returns.
      // 1. Clean Side Loop: Pick up Clean Side -> Drop Off -> Pick up Sold -> Drop Off -> Return to Clean Side
      // 2. Shops Loop: Pick up Shops -> Drop Off -> Pick up Sold -> Drop Off -> Return to Shops
      
      let remainingDrivers = totalDrivers;
      let chuteVans = 0;
      let cleanLoopVans = 0;
      let shopsLoopVans = 0;
      let inventoryVans = 0;

      // 1. Assign Minimums (Avoid abandonment)
      if (crewMoves.chute > 0 && remainingDrivers > 0) { chuteVans++; remainingDrivers--; }
      if (crewMoves.cleanSide > 0 && remainingDrivers > 0) { cleanLoopVans++; remainingDrivers--; }
      if (crewMoves.shopsReady > 0 && remainingDrivers > 0) { shopsLoopVans++; remainingDrivers--; }
      if (crewMoves.inventory > 0 && remainingDrivers > 0) { inventoryVans++; remainingDrivers--; }

      // 2. Distribute remaining proportionally based on volume
      // Note: "Sold" volume is absorbed into Clean/Shops loops as return trips.
      const effectiveMoves = Math.max(1, totalMoves - crewMoves.sold); // Sold is secondary leg
      
      const chuteShare = (crewMoves.chute / effectiveMoves) * remainingDrivers;
      const cleanShare = (crewMoves.cleanSide / effectiveMoves) * remainingDrivers;
      const shopsShare = (crewMoves.shopsReady / effectiveMoves) * remainingDrivers;
      const invShare = (crewMoves.inventory / effectiveMoves) * remainingDrivers;

      chuteVans += Math.round(chuteShare);
      cleanLoopVans += Math.round(cleanShare);
      shopsLoopVans += Math.round(shopsShare);
      inventoryVans += Math.round(invShare);

      // Adjust for rounding
      const assigned = chuteVans + cleanLoopVans + shopsLoopVans + inventoryVans;
      const diff = totalDrivers - assigned;
      
      if (diff !== 0) {
          const maxBucket = Math.max(crewMoves.chute, crewMoves.cleanSide, crewMoves.shopsReady, crewMoves.inventory);
          if (maxBucket === crewMoves.chute) chuteVans += diff;
          else if (maxBucket === crewMoves.cleanSide) cleanLoopVans += diff;
          else if (maxBucket === crewMoves.shopsReady) shopsLoopVans += diff;
          else inventoryVans += diff;
      }

      // 3. Calculate Estimates (Assume Loops are 20% more efficient due to no deadhead)
      const loopEfficiencyFactor = 1.2;
      const mphPerDriver = parseFloat(calculatedGoal); 
      const systemMPH = (chuteVans * mphPerDriver) + 
                        (inventoryVans * mphPerDriver) + 
                        ((cleanLoopVans + shopsLoopVans) * mphPerDriver * loopEfficiencyFactor);
                        
      const hoursToComplete = totalMoves / systemMPH;
      const estCompletion = hoursToComplete < 1 
          ? `${Math.ceil(hoursToComplete * 60)} mins`
          : `${hoursToComplete.toFixed(1)} hours`;

      setAllocation({
          chuteVans,
          cleanLoopVans,
          shopsLoopVans,
          inventoryVans,
          movesPerHour: parseFloat(systemMPH.toFixed(1)),
          estCompletion
      });
  };

  // Recalculate whenever inputs change
  useEffect(() => {
      calculateSmartAllocation();
  }, [crewMoves, driverCount, calculatedGoal]);


  // Calculated Plan
  const [plan, setPlan] = useState<{cleanSideVans: number, prepVans: number, soldVans: number, efficiencyNote: string} | null>(null);

  // Mock Live Data
  const activeDrivers = [
    { id: "D1", name: "Driver #42", mode: "bulk", from: "Chute (100)", to: "Lane 41", time: "12m", status: "active", mph: 5.2 },
    { id: "D2", name: "Driver #18", mode: "break", from: "Break Room", to: "--", time: "12:45", status: "break", mph: 0 },
    { id: "D3", name: "Driver #05", mode: "ev", from: "400 Imaging", to: "Charging A", time: "05m", status: "active", mph: 4.1 },
    { id: "D4", name: "Driver #33", mode: "bulk", from: "801 Sold", to: "309 Mech", time: "22m", status: "warning", mph: 3.4 },
  ];

  // Check if current week is a Ford Sale Week (1st & 3rd Thurs)
  // Simplified logic: Odd weeks = Ford Sale
  const isFordWeek = currentWeek % 2 !== 0; 
  const isSaleDay = shiftMode.includes("Sale");

  // Auto-Disable Arena on Sale Days
  useEffect(() => {
    if (isSaleDay) {
        setOverflowConfig(prev => ({ ...prev, arenaFront: false, arenaBack: false }));
    }
  }, [isSaleDay]);

  const calculatePlan = () => {
    // Simple heuristic based on user logic
    let cleanSideVans = 0;
    let prepVans = 0;
    let soldVans = 0;
    let efficiencyNote = "Standard routing active.";
    const totalVans = vanCount;

    if (shiftMode === "Monday_Prep") {
      const totalVol = cleanSideVolume + salePrepVolume;
      cleanSideVans = Math.round((cleanSideVolume / totalVol) * totalVans);
      prepVans = totalVans - cleanSideVans;
      efficiencyNote = isFordWeek 
        ? "Ford Week Active: Prioritizing Lane 31 Prep for Thursday Sale."
        : "Standard Prep: Moving Inventory to Tuesday Lanes.";
    } 
    else if (shiftMode === "Tuesday_Sale") {
      cleanSideVans = 2; 
      const remainingVans = totalVans - 2;
      soldVans = Math.ceil(remainingVans * 0.6); 
      prepVans = remainingVans - soldVans; 
      efficiencyNote = "Optimized Loop: Drop Clean Side → Pick up Sold Unit (No Deadhead).";
    }
    else if (shiftMode === "Wednesday_Sale") {
       cleanSideVans = 2;
       const remainingVans = totalVans - 2;
       soldVans = Math.ceil(remainingVans * 0.7); 
       prepVans = remainingVans - soldVans;
       efficiencyNote = "Clearing Sale Lanes to Sold Storage efficiently.";
    }
    else {
      // Thursday Cleanup
      if (isFordWeek) {
          cleanSideVans = 2;
          soldVans = totalVans - 2;
          efficiencyNote = "Ford Sale Thursday (Lane 31): High Priority Clear.";
      } else {
          cleanSideVans = 1;
          soldVans = totalVans - 1;
          efficiencyNote = "Standard Cleanup Day.";
      }
    }

    setPlan({ cleanSideVans, prepVans, soldVans, efficiencyNote });
  };

  const openLaneConfig = (lane: SaleLane) => {
    setSelectedLane(lane);
    setEditCapacity(lane.capacity);
    setEditStatus(lane.status === 'active');
    setEditDay(lane.day);
    setEditZone(lane.zone || "Main Sale Lot");
    setEditSpillover(lane.spillsInto ? lane.spillsInto.toString() : "none");
    setIsLaneDialogOpen(true);
  };

  const openDistanceConfig = (section: Section) => {
    setSelectedSection(section);
    setEditDistance(section.distanceFromChute || 0);
    setIsDistanceDialogOpen(true);
  };

  const saveDistanceConfig = () => {
    if (!selectedSection) return;
    const updatedSections = sections.map(s => 
        s.id === selectedSection.id ? { ...s, distanceFromChute: editDistance } : s
    );
    setSections(updatedSections);
    setIsDistanceDialogOpen(false);
  };

  const saveLaneConfig = () => {
    if (!selectedLane) return;
    
    const updatedLanes = lanes.map(l => {
      if (l.id === selectedLane.id) {
        return {
          ...l,
          capacity: editCapacity,
          status: editStatus ? 'active' : 'inactive' as "active" | "inactive",
          day: editDay as "Tuesday" | "Wednesday" | "Thursday_Ford" | "Both",
          zone: editZone,
          spillsInto: editSpillover === "none" ? undefined : Number(editSpillover)
        };
      }
      return l;
    });
    
    setLanes(updatedLanes);
    setIsLaneDialogOpen(false);
  };

  const handleAddMove = () => {
      if (!newMove.vin || !newMove.from || !newMove.to) return;
      
      const move: PriorityMove = {
          id: `M-${Math.floor(Math.random() * 1000)}`,
          vin: newMove.vin,
          desc: newMove.desc || "Vehicle",
          from: newMove.from,
          to: newMove.to,
          status: "pending",
          priority: "normal"
      };
      
      setPriorityMoves([...priorityMoves, move]);
      setNewMove({ vin: "", desc: "", from: "", to: "" });
      setIsMoveDialogOpen(false);
      toast({
          title: "Move Request Created",
          description: `${move.desc} added to priority queue.`
      });
  };

  const handleClearPickup = (id: string) => {
      setPickupRequests(pickupRequests.filter(p => p.id !== id));
      toast({
          title: "Pickup Completed",
          description: "Driver removed from queue."
      });
  };

  const handleTestDistance = () => {
      if (!testFrom || !testTo) return;
      
      const fromSection = sections.find(s => s.id === testFrom);
      const toSection = sections.find(s => s.id === testTo);
      
      if (fromSection && toSection) {
          const distFrom = fromSection.distanceFromChute || 0;
          const distTo = toSection.distanceFromChute || 0;
          const totalDistanceFt = Math.abs(distFrom - distTo);
          
          // Calculate time at 15mph
          const speedFtPerSec = (speedLimit * 5280) / 3600;
          const timeSec = totalDistanceFt / speedFtPerSec;
          const timeMin = Math.ceil(timeSec / 60);
          
          setTestResult(`${totalDistanceFt} ft • ~${timeMin} min drive`);
      }
  };

  const filteredMoves = priorityMoves.filter(m => 
      m.vin.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen dashboard-premium flex flex-col scrollbar-premium">
       <WelcomeTrigger userRole="supervisor" />
       {/* Sandbox Mode Indicator */}
       {localStorage.getItem("vanops_demo_mode") === "true" && (
         <div className="bg-purple-900/30 px-4 py-2 border-b border-purple-500/30">
           <SandboxModeIndicator />
         </div>
       )}
       
       {/* Premium Header */}
       <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 p-4 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2 justify-between items-center max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            {localStorage.getItem("vanops_demo_mode") === "true" && (
              <SandboxHelpButton role="supervisor" page="resource-allocation" size="sm" />
            )}
            <NavigationControl variant="back" fallbackRoute="/dashboard" />
            <Button variant="ghost" size="icon" onClick={() => setLocation("/analytics")} className="text-purple-400 hover:bg-purple-900/50" data-testid="button-analytics">
                <BarChart3 className="h-5 w-5" />
            </Button>
            <ShiftReportGenerator />
            <Button onClick={() => setShowQuarterlyReport(true)} className="btn-premium btn-premium-green text-white flex items-center gap-2" data-testid="button-quarterly-report">
                <FileText className="h-4 w-4" />
                Quarterly Report
            </Button>
            <Version2Button />
            {pageTutorialContent["/resource-allocation"] && (
              <PageTutorialButton 
                slides={pageTutorialContent["/resource-allocation"].slides}
                pageTitle={pageTutorialContent["/resource-allocation"].title}
                buttonSize="sm"
                showLabel={false}
              />
            )}
            <PopupGameToggle showLabel={false} />
            <DashboardControls triggerClassName="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10" />
            <EndOfShiftReport 
              driverName={JSON.parse(localStorage.getItem('vanops_user') || '{}').name || 'Supervisor'}
              shiftSummary={{
                totalMoves: 38,
                quota: 45,
                hoursWorked: 8,
                breaksTaken: 2,
                incidentsReported: 0
              }}
            />
            <Button variant="ghost" size="icon" onClick={() => setShowOnboarding(true)} className="text-blue-600 hover:bg-blue-50" title="View Help Guide">
                <HelpCircle className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-bold text-lg leading-none text-gradient-blue">Supervisor Console</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Resource & Activity Monitor</p>
              </div>
              
              {/* Shift Toggle - Premium Styled */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-600/50">
                <button
                  onClick={() => toggleShift('first')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    currentShift === 'first' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  1st Shift
                </button>
                <button
                  onClick={() => toggleShift('second')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    currentShift === 'second' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  2nd Shift
                </button>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="beta-testing" className="border-2 border-blue-400 bg-blue-50">
                <span className="font-bold text-blue-700">Beta Test</span>
              </TabsTrigger>
              <TabsTrigger value="arena-staging" className="border-2 border-purple-300 bg-purple-50">
                <span className="font-semibold text-purple-700">Arena</span>
              </TabsTrigger>
              <TabsTrigger value="resources">Shift Planner</TabsTrigger>
              <TabsTrigger value="roster">Roster</TabsTrigger>
              <TabsTrigger value="service_driver" className="border-2 border-amber-300 bg-amber-50">
                <span className="font-semibold text-amber-700">Service Driver</span>
              </TabsTrigger>
              <TabsTrigger value="lot_capacity" className="border-2 border-blue-300 bg-blue-50">
                <span className="font-semibold text-blue-700">Lot Capacity</span>
              </TabsTrigger>
              <TabsTrigger value="ai_optimization" className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50">
                <span className="font-semibold text-purple-700">🧠 AI</span>
              </TabsTrigger>
              <TabsTrigger value="pins">PIN Management</TabsTrigger>
              <TabsTrigger value="equipment">Equipment Log</TabsTrigger>
              <TabsTrigger value="config">Facility Map</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Mobile Tabs */}
        <div className="md:hidden overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex flex-wrap gap-2 h-auto p-1">
              <TabsTrigger value="dispatch" className="text-[10px] px-2 py-1 h-7">Dispatch</TabsTrigger>
              <TabsTrigger value="monitor" className="text-[10px] px-2 py-1 h-7">Live</TabsTrigger>
              <TabsTrigger value="roster" className="text-[10px] px-2 py-1 h-7">Roster</TabsTrigger>
              <TabsTrigger value="performance" className="text-[10px] px-2 py-1 h-7">Perf</TabsTrigger>
              <TabsTrigger value="reports" className="text-[10px] px-2 py-1 h-7">Reports</TabsTrigger>
              <TabsTrigger value="resources" className="text-[10px] px-2 py-1 h-7">Plan</TabsTrigger>
              <TabsTrigger value="arena-staging" className="text-[10px] px-2 py-1 h-7 bg-purple-50 text-purple-700">Arena</TabsTrigger>
              <TabsTrigger value="lot_capacity" className="text-[10px] px-2 py-1 h-7 bg-blue-50 text-blue-700">Lots</TabsTrigger>
              <TabsTrigger value="ai_optimization" className="text-[10px] px-2 py-1 h-7 bg-purple-100 text-purple-700">🧠 AI</TabsTrigger>
              <TabsTrigger value="service_driver" className="text-[10px] px-2 py-1 h-7 bg-amber-50 text-amber-700">Svc</TabsTrigger>
              <TabsTrigger value="pins" className="text-[10px] px-2 py-1 h-7">PINs</TabsTrigger>
              <TabsTrigger value="equipment" className="text-[10px] px-2 py-1 h-7">Equip</TabsTrigger>
              <TabsTrigger value="config" className="text-[10px] px-2 py-1 h-7">Map</TabsTrigger>
              <TabsTrigger value="beta-testing" className="text-[10px] px-2 py-1 h-7 bg-green-50 text-green-700">Beta</TabsTrigger>
              <TabsTrigger value="settings" className="text-[10px] px-2 py-1 h-7">⚙️</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <SupervisorOnboarding 
          open={showSupervisorTutorial} 
          onClose={() => setShowSupervisorTutorial(false)} 
        />
        
        <BetaWelcomeModal />

        {/* Quick Navigation Guide */}
        <QuickHelpPanel 
          title="Supervisor Dashboard Guide"
          tips={[
            "📍 DISPATCH: View and assign priority work orders to drivers",
            "👥 ROSTER: Manage daily crew assignments and driver roles",
            "📊 REPORTS: Download performance summaries and efficiency metrics",
            "📋 ASSIGNMENTS: Create assignment lists for van drivers to follow",
            "🔐 PIN MGMT: Change PINs for drivers and safety advisors when needed"
          ]}
        />

        {/* Live Driver Wall - Real-time tracking of all active drivers */}
        <SupervisorLiveWall />

        {/* Premium Bento Grid - Quick Stats & Daily Code */}
        <BentoGrid columns={3} gap="md" className="mb-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {/* Daily Access Code - Premium Tile */}
          <BentoTile
            size="lg"
            variant="premium"
            sparkle={true}
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Today's Daily Access Code"
            description="Announce at pre-shift • Required for all drivers"
            badge="ACTIVE"
            data-testid="tile-daily-code"
          >
            {loadingCode ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-black text-amber-400 tracking-wider font-mono drop-shadow-lg">
                  {dailyCode}
                </div>
                <PremiumButton
                  variant="glass"
                  size="sm"
                  onClick={copyDailyCode}
                  icon={<Copy className="w-4 h-4" />}
                  data-testid="button-copy-code"
                >
                  Copy
                </PremiumButton>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <Clock className="w-3 h-3" />
              Valid until midnight
            </div>
          </BentoTile>

          {/* Shift Overview - Gradient Tile */}
          <BentoTile
            size="md"
            variant="gradient"
            icon={<BarChart3 className="w-5 h-5" />}
            title={`${currentShift === 'first' ? '1st' : '2nd'} Shift Overview`}
            description="Current shift performance"
            badge={currentShift === 'first' ? '1ST' : '2ND'}
            data-testid="tile-shift-overview"
          >
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Active Drivers
                </span>
                <span className="text-xl font-bold text-primary">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Moves Done
                </span>
                <span className="text-xl font-bold text-green-500">487</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Gauge className="w-3 h-3" /> Avg MPH
                </span>
                <span className="text-xl font-bold text-purple-500">18.4</span>
              </div>
            </div>
          </BentoTile>

          {/* Quick Actions - Glow Tile */}
          <BentoTile
            size="md"
            variant="glow"
            icon={<Zap className="w-5 h-5" />}
            title="Quick Actions"
            description="Fast access to key functions"
            data-testid="tile-quick-actions"
          >
            <div className="flex flex-wrap gap-2 mt-2">
              <PremiumButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsMoveDialogOpen(true)}
                data-testid="button-quick-add-move"
              >
                Add Move
              </PremiumButton>
              <PremiumButton
                variant="secondary"
                size="sm"
                icon={<ListTodo className="w-4 h-4" />}
                onClick={() => setActiveTab('dispatch')}
                data-testid="button-quick-dispatch"
              >
                Dispatch
              </PremiumButton>
              <PremiumButton
                variant="glass"
                size="sm"
                icon={<Activity className="w-4 h-4" />}
                onClick={() => setActiveTab('monitor')}
                data-testid="button-quick-monitor"
              >
                Monitor
              </PremiumButton>
            </div>
          </BentoTile>
        </BentoGrid>

        {/* --- ROSTER TAB --- */}
        {activeTab === "roster" && (
          <div className="space-y-4 animate-in fade-in" data-section="roster" id="roster">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SupervisorAssignmentPanel 
                userName={JSON.parse(localStorage.getItem('vanops_user') || '{}').name || 'Supervisor'}
                userRole="supervisor"
              />
              <div className="space-y-4">
                <RosterManager />
              </div>
            </div>
          </div>
        )}

        {/* --- SERVICE DRIVER TAB --- */}
        {activeTab === "service_driver" && <ServiceDriverManagement />}

        {/* --- LOT CAPACITY TAB --- */}
        {activeTab === "lot_capacity" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
            <p className="text-muted-foreground">Lot Capacity features are being developed for a future update.</p>
          </div>
        )}

        {/* --- AI OPTIMIZATION TAB --- */}
        {activeTab === "ai_optimization" && (
          <div className="space-y-4 animate-in fade-in">
            <AiOptimizationDashboard />
          </div>
        )}

        {/* --- BETA TESTING TAB --- */}
        {activeTab === "beta-testing" && <BetaTestingChecklist />}
        
        {/* --- ARENA STAGING TAB --- */}
        {activeTab === "arena-staging" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
            <p className="text-muted-foreground">Arena Staging features are being developed for a future update.</p>
          </div>
        )}

        {/* --- DISPATCH / PRIORITY LIST TAB --- */}
        {activeTab === "dispatch" && (
            <div className="space-y-6 animate-in fade-in" data-section="assignments" id="assignments" data-testid="section-dispatch">
                {/* Top Bento Grid - Service Truck & Dispatch Status */}
                <BentoGrid columns={3} gap="md" className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {/* Service Truck Assignment - Premium Tile */}
                  <BentoTile
                    size="lg"
                    variant="gradient"
                    icon={<Truck className="w-5 h-5" />}
                    title="Service Truck Driver"
                    description="Night shift & emergency repairs"
                    badge="ASSIGNED"
                    data-testid="tile-service-truck"
                  >
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        placeholder="Enter driver name"
                        value={serviceTruckDriver}
                        onChange={(e) => setServiceTruckDriver(e.target.value)}
                        className="flex-1 bg-white/10 border-white/20"
                        data-testid="input-service-truck-driver"
                      />
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Night
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {serviceTruckDriver ? `${serviceTruckDriver} is currently assigned` : 'No driver assigned'}
                    </p>
                  </BentoTile>

                  {/* Van Dispatch Status - Glow Tile */}
                  <BentoTile
                    size="md"
                    variant="premium"
                    sparkle={true}
                    icon={<Hand className="w-5 h-5" />}
                    title="Van Dispatch Status"
                    badge={`${pickupRequests.length} WAITING`}
                    data-testid="tile-dispatch-status"
                  >
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <div className="text-3xl font-black text-amber-400">{pickupRequests.length}</div>
                        <div className="text-xs text-muted-foreground">Avg Wait: 3m 12s</div>
                      </div>
                      <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </BentoTile>

                  {/* Quick Add Move - Glass Tile */}
                  <BentoTile
                    size="md"
                    variant="glow"
                    icon={<Plus className="w-5 h-5" />}
                    title="Priority Moves"
                    description="Create and manage move requests"
                    data-testid="tile-priority-moves"
                    action={
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsMoveDialogOpen(true)}
                        shine={true}
                        data-testid="button-create-move"
                      >
                        Create Move
                      </PremiumButton>
                    }
                  >
                    <div className="text-2xl font-bold text-primary">{filteredMoves.length} Active</div>
                  </BentoTile>
                </BentoGrid>

                {/* Van Pickup Queue - Swipeable Cards */}
                <AccordionSection
                  title="Van Pickup Queue"
                  description="Drivers waiting for a ride back"
                  icon={<Hand className="w-5 h-5" />}
                  badge={`${pickupRequests.length} IN QUEUE`}
                  variant="glass"
                  defaultOpen={pickupRequests.length > 0}
                >
                  {pickupRequests.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground italic">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No active pickup requests
                    </div>
                  ) : (
                    <SwipeCarousel itemWidth="240px" gap={12} showPeek={true}>
                      {pickupRequests.map(req => (
                        <BentoTile
                          key={req.id}
                          size="sm"
                          variant="gradient"
                          className="h-full"
                          data-testid={`tile-pickup-${req.id}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-orange-500/20 p-2 rounded-full text-orange-400">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sm">{req.driverName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {req.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-orange-400 font-semibold">{req.timestamp}</span>
                            <PremiumButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleClearPickup(req.id)}
                              data-testid={`button-pickup-clear-${req.id}`}
                            >
                              Picked Up
                            </PremiumButton>
                          </div>
                        </BentoTile>
                      ))}
                    </SwipeCarousel>
                  )}
                </AccordionSection>

                {/* Assignment Lists */}
                <AssignmentManager />
                
                {/* AI Lot Suggestions */}
                <AccordionSection
                  title="AI Suggestions"
                  description="Smart lot optimization recommendations"
                  icon={<Sparkles className="w-5 h-5" />}
                  variant="premium"
                  defaultOpen={false}
                >
                  <AiSuggestions />
                </AccordionSection>

                {/* Priority Moves Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Priority Move Requests</h2>
                            <p className="text-sm text-muted-foreground">Manage ad-hoc move requests and locate vehicles.</p>
                        </div>
                        <PremiumButton 
                          variant="primary" 
                          icon={<Plus className="w-4 h-4" />}
                          onClick={() => setIsMoveDialogOpen(true)}
                          data-testid="button-create-move-alt"
                        >
                          Create Move
                        </PremiumButton>
                    </div>

                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ListTodo className="h-5 w-5 text-blue-600" /> Active Priority Queue
                                    </CardTitle>
                                    <div className="relative w-48 sm:w-64">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search VIN, Desc, Loc..." 
                                            className="pl-8 h-9 bg-slate-50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {filteredMoves.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">
                                            No active moves found.
                                        </div>
                                    ) : (
                                        filteredMoves.map(move => (
                                            <div key={move.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-full mt-1 ${move.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        <Truck className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900">{move.desc}</span>
                                                            {move.priority === 'high' && <Badge variant="destructive" className="h-5 text-[10px]">URGENT</Badge>}
                                                            <Badge variant="outline" className="h-5 text-[10px] font-mono">{move.vin}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                            <span className="font-medium">{move.from}</span>
                                                            <ArrowRight className="h-3 w-3 text-slate-400" />
                                                            <span className="font-medium">{move.to}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="text-right mr-2 hidden sm:block">
                                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</div>
                                                        <div className={`text-sm font-bold ${
                                                            move.status === 'pending' ? 'text-orange-600' : 
                                                            move.status === 'assigned' ? 'text-blue-600' : 'text-green-600'
                                                        }`}>
                                                            {move.status.toUpperCase()}
                                                        </div>
                                                    </div>
                                                    
                                                    <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                        onClick={() => window.open('https://xt.lotvision.cognosos.net', '_blank')}
                                                    >
                                                        <ExternalLink className="h-3 w-3" /> <span className="hidden sm:inline">Lot Vision</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
            </div>
        )}

        {/* --- PERFORMANCE DASHBOARD TAB --- */}
        {activeTab === "performance" && (
          <div className="space-y-6 animate-in fade-in" data-section="performance" id="performance">
            <PerformanceDashboard />
          </div>
        )}

        {/* --- LIVE MONITOR TAB --- */}
        {activeTab === "monitor" && (
          <div className="space-y-6 animate-in fade-in" data-testid="section-monitor">
            {/* Exotic Car Key Tracking - High Priority Security */}
            <ExoticKeyDashboard />

            {/* Lot Vision GPS Integration */}
            <LotVisionDashboardWidget />

            {/* Premium Stats Bento Grid */}
            <BentoGrid columns={4} gap="md" className="grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
              <BentoTile
                size="sm"
                variant="gradient"
                sparkle={true}
                icon={<Truck className="w-5 h-5" />}
                badge="LIVE"
                className="w-full max-w-full"
                data-testid="tile-vans-active"
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-primary">8/10</div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Vans Active</div>
                </div>
              </BentoTile>

              <BentoTile
                size="sm"
                variant="glow"
                icon={<CheckCircle2 className="w-5 h-5" />}
                badge="TODAY"
                className="w-full max-w-full"
                data-testid="tile-moves-completed"
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-green-500">142</div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Moves Done</div>
                </div>
              </BentoTile>

              <BentoTile
                size="sm"
                variant="glass"
                icon={<Gauge className="w-5 h-5" />}
                className="w-full max-w-full"
                data-testid="tile-performance-goal"
              >
                <div className="text-center">
                  <div className="text-2xl font-black">
                    4.2 <span className="text-sm font-normal text-muted-foreground">/ {calculatedGoal}</span>
                  </div>
                  <div className="text-xs text-primary uppercase font-bold">Current vs Goal</div>
                </div>
              </BentoTile>

              <BentoTile
                size="sm"
                variant="default"
                icon={<TrendingUp className="w-5 h-5" />}
                badge="↑ 12%"
                className="w-full max-w-full"
                data-testid="tile-efficiency"
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-500">94%</div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Efficiency</div>
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Live GPS Tracking Map */}
            <LiveDriverMap />

            {/* Live Driver Activity - Premium Accordion */}
            <AccordionSection
              title="Live Driver Activity"
              description="Real-time driver status and locations"
              icon={<LayoutDashboard className="w-5 h-5" />}
              badge={`${activeDrivers.length} ACTIVE`}
              variant="gradient"
              defaultOpen={true}
            >
              <HorizontalScroll gap={12} className="overflow-x-auto w-full max-w-full">
                {activeDrivers.map((driver) => (
                  <BentoTile
                    key={driver.id}
                    size="sm"
                    variant={driver.mode === 'break' ? 'default' : 'glass'}
                    className="min-w-[200px]"
                    data-testid={`tile-driver-${driver.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-slate-100 border-2 border-white">
                        <AvatarFallback className="text-slate-600 text-xs">{driver.name.split('#')[1]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{driver.name}</div>
                        <Badge variant="secondary" className={`
                          ${driver.mode === 'break' ? 'bg-yellow-100 text-yellow-800' :
                            driver.mode === 'crunch' ? 'bg-slate-800 text-white' : 
                            driver.mode === 'ev' ? 'bg-teal-100 text-teal-800' : 
                            'bg-blue-100 text-blue-800'} border-0 px-1.5 h-5 text-[10px]
                        `}>
                          {driver.mode === 'break' ? 'BREAK' : driver.mode.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {driver.mode === 'break' ? (
                        <span className="flex items-center gap-1">
                          <Coffee className="h-3 w-3" /> {driver.time}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {driver.from} <ArrowRight className="h-3 w-3" /> {driver.to}
                        </span>
                      )}
                    </div>
                    {driver.mode !== 'break' && (
                      <div className={`text-xs font-bold mt-1 ${driver.mph < Number(calculatedGoal) ? 'text-red-500' : 'text-green-500'}`}>
                        {driver.mph > 0 ? `${driver.mph} MPH` : '-'}
                      </div>
                    )}
                  </BentoTile>
                ))}
              </HorizontalScroll>
            </AccordionSection>
          </div>
        )}

        {/* --- REPORTS TAB --- */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-in fade-in">
            <PerformanceReports />
          </div>
        )}

        {/* --- SHIFT PLANNER TAB (The Brain) --- */}
        {activeTab === "resources" && (
          <div className="space-y-6 animate-in fade-in" data-testid="section-resources">
            
            {/* Premium Week & Goal Bento Grid */}
            <BentoGrid columns={3} gap="md" className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {/* Weekly Schedule - Hero Tile */}
              <BentoTile
                size="lg"
                variant="premium"
                sparkle={true}
                icon={<CalendarDays className="w-6 h-6" />}
                title="Weekly Schedule"
                description="Set active week for Ford Sale Logic"
                badge={isFordWeek ? "FORD WEEK" : "STANDARD"}
                data-testid="tile-weekly-schedule"
              >
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Fiscal Week</Label>
                    <span className="font-mono font-bold text-2xl text-amber-400">WK {currentWeek}</span>
                  </div>
                  <Slider 
                    value={[currentWeek]} 
                    onValueChange={(v) => setCurrentWeek(v[0])} 
                    min={1} 
                    max={52} 
                    step={1}
                    className="py-2" 
                  />
                  {isFordWeek && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-full text-white">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-400 uppercase">Upcoming</div>
                        <div className="text-sm font-bold">Ford Sale (Lane 31)</div>
                      </div>
                    </div>
                  )}
                </div>
              </BentoTile>

              {/* Goal Tile - Glow */}
              <BentoTile
                size="md"
                variant="glow"
                sparkle={true}
                icon={<Gauge className="w-5 h-5" />}
                title="Performance Goal"
                data-testid="tile-goal"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-5xl font-black text-primary mb-2">{calculatedGoal}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Moves / Hour</div>
                  <Badge variant="outline" className="mt-2">Target</Badge>
                </div>
              </BentoTile>

              {/* Shift Mode Tile */}
              <BentoTile
                size="md"
                variant="gradient"
                icon={<Sliders className="w-5 h-5" />}
                title="Shift Mode"
                description="Current operation mode"
                badge={shiftMode.replace('_', ' ')}
                data-testid="tile-shift-mode"
              >
                <div className="space-y-2 mt-2">
                  <Select value={shiftMode} onValueChange={(v) => setShiftMode(v as any)}>
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday_Prep">Monday Prep</SelectItem>
                      <SelectItem value="Tuesday_Sale">Tuesday Sale</SelectItem>
                      <SelectItem value="Wednesday_Sale">Wednesday Sale</SelectItem>
                      <SelectItem value="Thursday_Cleanup">Thursday Cleanup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Lot Management - Wrapped in Accordion */}
            <AccordionSection
              title="Lot Management"
              description="Configure facility sections and zones"
              icon={<Map className="w-5 h-5" />}
              variant="gradient"
              defaultOpen={true}
            >
              <div className="space-y-4">
                <LotAvailabilityBoard />
                <LotManager />
              </div>
            </AccordionSection>

            {/* Crew & Workload - Bento Grid */}
            <BentoGrid columns={2} gap="md" className="grid-cols-1 md:grid-cols-2">
              {/* Crew Size - Gradient Tile */}
              <BentoTile
                size="md"
                variant="gradient"
                icon={<Users className="w-5 h-5" />}
                title="Crew Size"
                description="Available drivers clocked in"
                badge={`${driverCount} DRIVERS`}
                data-testid="tile-crew-size"
              >
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center">
                    <Label>Available Drivers</Label>
                    <span className="font-bold text-3xl text-primary">{driverCount}</span>
                  </div>
                  <Slider 
                    value={[driverCount]} 
                    onValueChange={(v) => setDriverCount(v[0])} 
                    max={50} 
                    step={1}
                    data-testid="slider-driver-count"
                  />
                  <p className="text-xs text-muted-foreground">Adjust based on clocked-in crew.</p>
                </div>
              </BentoTile>

              {/* Workload Inputs - Glass Tile */}
              <BentoTile
                size="lg"
                variant="glass"
                icon={<ListTodo className="w-5 h-5" />}
                title="Current Backlog"
                description="Move requests by zone"
                badge={`${crewMoves.chute + crewMoves.cleanSide + crewMoves.shopsReady + crewMoves.sold + crewMoves.inventory} TOTAL`}
                data-testid="tile-workload"
              >
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">The Chute (101)</Label>
                      <Badge variant="outline">{crewMoves.chute}</Badge>
                    </div>
                    <Slider 
                      value={[crewMoves.chute]} 
                      onValueChange={(v) => setCrewMoves(prev => ({...prev, chute: v[0]}))} 
                      max={1000} step={10} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Clean Side (400/DTL)</Label>
                      <Badge variant="outline">{crewMoves.cleanSide}</Badge>
                    </div>
                    <Slider 
                      value={[crewMoves.cleanSide]} 
                      onValueChange={(v) => setCrewMoves(prev => ({...prev, cleanSide: v[0]}))} 
                      max={800} step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Shops Ready</Label>
                      <Badge variant="outline">{crewMoves.shopsReady}</Badge>
                    </div>
                    <Slider 
                      value={[crewMoves.shopsReady]} 
                      onValueChange={(v) => setCrewMoves(prev => ({...prev, shopsReady: v[0]}))} 
                      max={500} step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Sold Units (800s)</Label>
                      <Badge variant="outline">{crewMoves.sold}</Badge>
                    </div>
                    <Slider 
                      value={[crewMoves.sold]} 
                      onValueChange={(v) => setCrewMoves(prev => ({...prev, sold: v[0]}))} 
                      max={800} step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">General Inventory</Label>
                      <Badge variant="outline">{crewMoves.inventory}</Badge>
                    </div>
                    <Slider 
                      value={[crewMoves.inventory]} 
                      onValueChange={(v) => setCrewMoves(prev => ({...prev, inventory: v[0]}))} 
                      max={1500} step={20}
                    />
                  </div>
                </div>
              </BentoTile>

              {/* Results - Premium Glow Tile */}
              <BentoTile
                size="lg"
                variant="premium"
                sparkle={true}
                icon={<Calculator className="w-5 h-5" />}
                title="Optimized Workflow"
                description="Smart allocation plan"
                badge={allocation ? `${allocation.movesPerHour} MPH` : 'AWAITING'}
                data-testid="tile-allocation-results"
              >
                {!allocation ? (
                  <div className="text-center text-muted-foreground py-6">Enter drivers and moves to see plan.</div>
                ) : (
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                        <div className="text-xs text-purple-300 uppercase font-bold">Chute</div>
                        <div className="text-2xl font-bold">{allocation.chuteVans}</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <div className="text-xs text-blue-300 uppercase font-bold">Clean Loop</div>
                        <div className="text-2xl font-bold">{allocation.cleanLoopVans}</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                        <div className="text-xs text-orange-300 uppercase font-bold">Shops</div>
                        <div className="text-2xl font-bold">{allocation.shopsLoopVans}</div>
                      </div>
                      <div className="bg-slate-500/20 p-3 rounded-lg border border-slate-500/30">
                        <div className="text-xs text-slate-300 uppercase font-bold">Inventory</div>
                        <div className="text-2xl font-bold">{allocation.inventoryVans}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completion:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{allocation.estCompletion}</Badge>
                    </div>
                  </div>
                )}
              </BentoTile>
            </BentoGrid>
          </div>
        )}

        {/* --- PIN MANAGEMENT TAB --- */}
        {activeTab === "pins" && (
          <div className="space-y-6 animate-in fade-in" data-testid="section-pins">
            <BentoGrid columns={2} gap="md" className="grid-cols-1 md:grid-cols-2">
              {/* Safety Advisor Tile */}
              <BentoTile
                size="md"
                variant="gradient"
                sparkle={true}
                icon={<Shield className="w-5 h-5" />}
                title="Safety Advisors"
                description="Admin PIN management"
                badge={`${safetyAdvisors.length} USERS`}
                data-testid="tile-safety-advisors"
              >
                <div className="space-y-2 mt-2">
                  {safetyAdvisors.length > 0 ? (
                    safetyAdvisors.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="text-sm font-semibold">{user.name}</div>
                            <Badge variant="outline" className="text-xs">{user.pin}</Badge>
                          </div>
                        </div>
                        <PremiumButton 
                          size="sm" 
                          variant="glass"
                          onClick={() => openPinDialog(user)}
                          data-testid={`btn-change-pin-${user.id}`}
                        >
                          <Key className="w-3 h-3 mr-1" />
                          Change
                        </PremiumButton>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">No safety advisors</div>
                  )}
                </div>
              </BentoTile>

              {/* Drivers Tile */}
              <BentoTile
                size="lg"
                variant="glass"
                icon={<Users className="w-5 h-5" />}
                title="Driver PINs"
                description="All crew members"
                badge={`${allDrivers.length} DRIVERS`}
                data-testid="tile-driver-pins"
              >
                <ScrollArea className="h-80 mt-2">
                  <div className="space-y-2 pr-2">
                    {allDrivers.length > 0 ? (
                      allDrivers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.role === 'driver' ? 'bg-blue-500' : 'bg-green-500'}`} />
                            <div>
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.role === 'driver' ? 'Van' : 'Inv'} • {user.pin}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openPinDialog(user)}
                            data-testid={`btn-driver-pin-${user.id}`}
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">No drivers found</div>
                    )}
                  </div>
                </ScrollArea>
              </BentoTile>
            </BentoGrid>
          </div>
        )}

        {/* --- EQUIPMENT LOG TAB --- */}
        {activeTab === "equipment" && (
          <div className="space-y-6 animate-in fade-in" data-testid="section-equipment">
            <BentoGrid columns={1} gap="md">
              <BentoTile
                size="wide"
                variant="glass"
                icon={<ClipboardList className="w-5 h-5" />}
                title="Equipment Checkout Log"
                description="Track all driver equipment checkouts and missing reports"
                badge="LIVE"
                data-testid="tile-equipment-log"
              >
                <div className="mt-2">
                  <EquipmentCheckoutLog mode="manager" />
                </div>
              </BentoTile>
            </BentoGrid>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-6 animate-in fade-in" data-section="config" id="config" data-testid="section-config">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Facility Configuration</h2>
                <p className="text-sm text-muted-foreground">Map lot sections and dynamic sale lanes.</p>
              </div>
              <PremiumButton variant="primary" data-testid="btn-save-config">
                <Save className="mr-2 h-4 w-4" /> Save Layout
              </PremiumButton>
            </div>

            {/* Config Tools Bento Grid */}
            <BentoGrid columns={2} gap="md" className="grid-cols-1 md:grid-cols-2">
              {/* Travel Time Estimator */}
              <BentoTile
                size="lg"
                variant="gradient"
                icon={<Route className="w-5 h-5" />}
                title="Travel Time Estimator"
                description="Calculate drive times between zones"
                badge="15 MPH"
                data-testid="tile-travel-time"
              >
                <div className="space-y-4 mt-2">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <Label className="text-xs">From</Label>
                      <Select onValueChange={setTestFrom}>
                        <SelectTrigger className="bg-white/10 border-white/20">
                          <SelectValue placeholder="Select Start..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map(s => <SelectItem key={`from-${s.id}`} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block mt-4" />
                    <div className="flex-1 w-full">
                      <Label className="text-xs">To</Label>
                      <Select onValueChange={setTestTo}>
                        <SelectTrigger className="bg-white/10 border-white/20">
                          <SelectValue placeholder="Destination..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map(s => <SelectItem key={`to-${s.id}`} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <PremiumButton variant="glass" className="w-full" onClick={handleTestDistance} data-testid="btn-calc-time">
                    Calculate Time
                  </PremiumButton>
                  {testResult && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-center font-bold animate-in zoom-in-95">
                      {testResult}
                    </div>
                  )}
                </div>
              </BentoTile>

              {/* Overflow & Special Zones Tile */}
              <BentoTile
                size="lg"
                variant="glass"
                icon={<ParkingSquare className="w-5 h-5" />}
                title="Overflow Zones"
                description="Toggle special storage areas"
                badge={isSaleDay ? "SALE DAY" : "NORMAL"}
                data-testid="tile-overflow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Lane Roads</Label>
                        <div className="text-xs text-muted-foreground">Between rows 46-52</div>
                      </div>
                      <Switch 
                        checked={overflowConfig.laneRoads} 
                        onCheckedChange={(c) => setOverflowConfig(prev => ({...prev, laneRoads: c}))}
                        data-testid="switch-lane-roads"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Grass Lines</Label>
                        <div className="text-xs text-muted-foreground">Near 500/515 Inventory</div>
                      </div>
                      <Switch 
                        checked={overflowConfig.grassLines} 
                        onCheckedChange={(c) => setOverflowConfig(prev => ({...prev, grassLines: c}))}
                        data-testid="switch-grass"
                      />
                    </div>
                    <div className="flex items-center justify-between opacity-60">
                      <div>
                        <Label className="text-sm">701 Fence</Label>
                        <div className="text-xs text-muted-foreground">Always active</div>
                      </div>
                      <Switch checked={overflowConfig.fence701} disabled />
                    </div>
                  </div>
                  <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold text-sm">Arena Logic</span>
                    </div>
                    <Badge variant={isSaleDay ? "destructive" : "outline"} className="w-full justify-center">
                      {isSaleDay ? "BLOCKED: Sale Day" : "AVAILABLE"}
                    </Badge>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Arena Front (600)</Label>
                      <Switch 
                        checked={overflowConfig.arenaFront} 
                        onCheckedChange={(c) => setOverflowConfig(prev => ({...prev, arenaFront: c}))}
                        disabled={isSaleDay}
                        data-testid="switch-arena-front"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Arena Back (700)</Label>
                      <Switch 
                        checked={overflowConfig.arenaBack} 
                        onCheckedChange={(c) => setOverflowConfig(prev => ({...prev, arenaBack: c}))}
                        disabled={isSaleDay}
                        data-testid="switch-arena-back"
                      />
                    </div>
                  </div>
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Static Sections - Accordion */}
            <AccordionSection
              title="Lot Sections & Distances"
              description="Distance from The Chute (101)"
              icon={<MapPin className="w-5 h-5" />}
              badge={`${sections.length} ZONES`}
              variant="glass"
              defaultOpen={false}
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.map(section => (
                    <div key={section.id} className={`flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm 
                        ${section.type === 'vip' ? 'border-yellow-400 bg-yellow-50' : 
                          section.type === 'utility' ? 'border-orange-200 bg-orange-50' : 
                          section.type === 'chute' ? 'border-red-200 bg-red-50' :
                          section.type === 'inventory' ? 'border-blue-200 bg-blue-50' : ''}`}>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                            {section.name}
                            {section.type === 'vip' && <Crown className="h-3 w-3 text-yellow-600" />}
                            {section.type === 'utility' && <Container className="h-3 w-3 text-orange-600" />}
                            {section.type === 'chute' && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                            {section.type === 'inventory' && <Gem className="h-3 w-3 text-blue-600" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="text-xs text-slate-500">ID: {section.id} • Cap: {section.capacity}</div>
                            <Badge variant="secondary" className="text-[10px] font-mono flex items-center gap-1 h-5 bg-slate-100 text-slate-600">
                                <Ruler className="h-3 w-3" /> {section.distanceFromChute} ft
                            </Badge>
                        </div>
                        {section.overflowsTo && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                <span className="text-[10px] font-bold text-slate-400">OVERFLOWS →</span>
                                {section.overflowsTo.map(o => (
                                    <Badge key={o} variant="outline" className="text-[9px] h-4 px-1 bg-white border-slate-300">{o}</Badge>
                                ))}
                            </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDistanceConfig(section)}>
                        <Edit3 className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="h-auto border-dashed border-2 flex flex-col gap-1 py-4 text-slate-400 hover:text-blue-600 hover:border-blue-200">
                    <Plus className="h-6 w-6" />
                    Add Section
                  </Button>
                </div>
              </div>
            </AccordionSection>

            {/* Dynamic Lanes - Accordion */}
            <AccordionSection
              title="Sale Lane Configuration"
              description="Click a lane to configure"
              icon={<Sliders className="w-5 h-5" />}
              badge={`${lanes.length} LANES`}
              variant="gradient"
              defaultOpen={false}
            >
              <div className="p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
                  {lanes.map(lane => (
                    <button
                      key={lane.id}
                      onClick={() => openLaneConfig(lane)}
                      data-testid={`btn-lane-${lane.id}`}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all relative overflow-hidden min-h-[60px] hover:scale-105
                        ${lane.status === 'inactive' ? 'bg-slate-100/50 border-slate-200 opacity-50' : 
                          lane.capacity > 100 ? 'bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/20' : 
                          lane.id === 31 && isFordWeek ? 'bg-yellow-500/10 border-yellow-500/30 ring-2 ring-yellow-500/20' :
                          'bg-white/5 border-white/20 hover:border-primary/50'}
                      `}
                    >
                      <span className="font-bold">L{lane.id}</span>
                      <span className="text-[10px] text-muted-foreground">{lane.capacity}</span>
                      
                      {lane.spillsInto && (
                        <div className="absolute bottom-0 left-0 right-0 bg-purple-500/20 text-[8px] text-purple-300 font-bold py-0.5 truncate">
                          → L{lane.spillsInto}
                        </div>
                      )}

                      {lane.status === 'inactive' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-500/50">
                          <PowerOff className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                      {lane.id === 31 && isFordWeek && (
                        <div className="absolute top-0 right-0 p-0.5">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </AccordionSection>
          </div>
        )}
        
        {/* Lane Configuration Dialog */}
        <Dialog open={isLaneDialogOpen} onOpenChange={setIsLaneDialogOpen}>
           <DialogContent className="max-w-md">
               <DialogHeader>
                   <DialogTitle>Configure Lane {selectedLane?.id}</DialogTitle>
               </DialogHeader>
               <ScrollArea className="max-h-[60vh]">
               <div className="space-y-6 py-4 pr-4">
                   <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${editStatus ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                               {editStatus ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                           </div>
                           <div>
                               <Label>Lane Status</Label>
                               <div className="text-xs text-slate-500">{editStatus ? 'Active & Receiving' : 'Closed / Merged'}</div>
                           </div>
                       </div>
                       <Switch checked={editStatus} onCheckedChange={setEditStatus} />
                   </div>

                   <div className="space-y-3">
                       <div className="flex justify-between">
                           <Label>Capacity (Spots)</Label>
                           <span className="font-bold text-blue-600">{editCapacity}</span>
                       </div>
                       <Slider 
                          value={[editCapacity]} 
                          onValueChange={(v) => setEditCapacity(v[0])} 
                          min={0} 
                          max={500} 
                          step={10} 
                          disabled={!editStatus}
                       />
                       <p className="text-xs text-slate-400">
                           Standard: 70 • Double: 140 • Mega: 210+
                       </p>
                   </div>

                   <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg space-y-3">
                       <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                           <Merge className="h-4 w-4" /> Lane Spillover / Extension
                       </div>
                       <p className="text-xs text-purple-700">
                           If this lane overflows across the road into another lane (e.g., L43 → L41).
                       </p>
                       <div className="space-y-2">
                           <Label className="text-xs">Spills Into Lane:</Label>
                           <Select value={editSpillover} onValueChange={setEditSpillover} disabled={!editStatus}>
                               <SelectTrigger className="bg-white">
                                   <SelectValue placeholder="None" />
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="none">None (Standard)</SelectItem>
                                   {lanes.filter(l => l.id !== selectedLane?.id).map(l => (
                                       <SelectItem key={`spill-${l.id}`} value={l.id.toString()}>
                                           Lane {l.id} (Current Cap: {l.capacity})
                                       </SelectItem>
                                   ))}
                               </SelectContent>
                           </Select>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <Label>Lot Location / Zone</Label>
                       <Select value={editZone} onValueChange={setEditZone} disabled={!editStatus}>
                           <SelectTrigger>
                               <SelectValue placeholder="Select Zone..." />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="Main Sale Lot">Main Sale Lot</SelectItem>
                               <SelectItem value="West Expansion">West Expansion (Gravel)</SelectItem>
                               <SelectItem value="East Paved">East Paved</SelectItem>
                               <SelectItem value="Front Line">Front Line (Premium)</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>

                   <div className="space-y-2">
                       <Label>Sale Day Assignment</Label>
                       <Select value={editDay} onValueChange={setEditDay} disabled={!editStatus}>
                           <SelectTrigger>
                               <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="Tuesday">Tuesday Sale</SelectItem>
                               <SelectItem value="Wednesday">Wednesday Sale</SelectItem>
                               <SelectItem value="Thursday_Ford">Thursday (Ford Only)</SelectItem>
                               <SelectItem value="Both">Both Days</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
               </div>
               </ScrollArea>
               <DialogFooter>
                   <Button variant="outline" onClick={() => setIsLaneDialogOpen(false)}>Cancel</Button>
                   <Button onClick={saveLaneConfig}>Save Changes</Button>
               </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* NEW MOVE DIALOG */}
        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Priority Move Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Last 6 of VIN</Label>
                        <Input 
                            placeholder="e.g. 884210" 
                            value={newMove.vin} 
                            onChange={(e) => setNewMove({...newMove, vin: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Vehicle Description</Label>
                        <Input 
                            placeholder="e.g. 2021 Toyota Camry" 
                            value={newMove.desc} 
                            onChange={(e) => setNewMove({...newMove, desc: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From (Current Loc)</Label>
                            <Input 
                                placeholder="e.g. Chute" 
                                value={newMove.from} 
                                onChange={(e) => setNewMove({...newMove, from: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>To (Destination)</Label>
                            <Input 
                                placeholder="e.g. Lane 41" 
                                value={newMove.to} 
                                onChange={(e) => setNewMove({...newMove, to: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMove}>Create Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* DISTANCE CONFIG DIALOG */}
        <Dialog open={isDistanceDialogOpen} onOpenChange={setIsDistanceDialogOpen}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Configure Distance</DialogTitle>
                    <DialogDescription>
                        Set the distance from "The Chute" (101) to {selectedSection?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-center">
                        <div className="bg-slate-100 rounded-full h-24 w-24 flex items-center justify-center border-4 border-slate-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{editDistance}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">FEET</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs text-slate-500 px-1">
                            <span>0 ft</span>
                            <span>5000 ft</span>
                        </div>
                        <Slider 
                            value={[editDistance]} 
                            onValueChange={(v) => setEditDistance(v[0])} 
                            min={0} 
                            max={5000} 
                            step={50}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDistanceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveDistanceConfig}>Save Distance</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
      
      <QuarterlyReport open={showQuarterlyReport} onClose={() => setShowQuarterlyReport(false)} />
      <ChatOverlay role="supervisor" serviceTruckDriver={serviceTruckDriver} />
      <OnboardingTutorial 
        role="supervisor" 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      {/* PIN Change Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              Change PIN
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `Update PIN for ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 rounded border">
              <div className="text-xs text-slate-600 mb-1">Current PIN</div>
              <div className="text-lg font-bold font-mono">{selectedUser?.pin}</div>
            </div>

            <div>
              <Label>New PIN (4 digits)</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="Enter new 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="text-lg font-mono text-center"
              />
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded p-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              User will need this new PIN to log in. Make sure to communicate it to them.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={changePIN} disabled={newPin.length !== 4}>
              <Key className="w-4 h-4 mr-2" />
              Update PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- SETTINGS TAB --- */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Team Avatar Pop-up Game Settings */}
          <PopupGameSettings />
          
          {/* Exotic Car Key Delivery Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SupervisorKeyPreferences />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Exotic Key Tracking Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor high-value vehicle key security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  View live status of all exotic car keys in the Monitor tab.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('monitor')}
                  data-testid="button-view-exotic-dashboard"
                >
                  View Exotic Key Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Integration Guide
              </CardTitle>
              <CardDescription className="text-xs">
                Technical guide for connecting Manheim's barcode system to Lot Ops Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">🔌 Barcode Integration Opportunity</h4>
                <p className="text-xs text-blue-700">
                  This document explains how to connect Manheim's barcode system to Lot Ops Pro. No database access required - just barcode format specifications.
                </p>
              </div>

              <details className="bg-white border rounded-lg">
                <summary className="cursor-pointer p-3 font-semibold text-sm hover:bg-gray-50">
                  📋 View Integration Guide (Copy-Paste Ready)
                </summary>
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2 italic">Click in the box and press Ctrl+A (Cmd+A on Mac) to select all, then Ctrl+C to copy</p>
                  <textarea 
                    readOnly 
                    className="w-full h-96 p-3 text-xs font-mono border rounded bg-white"
                    value={`BARCODE INTEGRATION OPPORTUNITY
An Open Letter from the Lot Ops Pro Development Team

To: Manheim Nashville Management & IT Department
From: Jason & the Dark Wave Studios Development Team
Date: November 21, 2025
RE: Simple Barcode Integration - No Database Access Required

---

EXECUTIVE SUMMARY

We've built Lot Ops Pro to work completely autonomously - drivers scan VINs with their phone cameras using OCR technology, and the system handles everything else. It works great, but there's an even better opportunity: connecting to your existing barcode system.

The good news? We don't need access to your full database. We just need barcode format specifications.

---

WHAT WE'RE ASKING FOR (It's Simple)

We only need ONE piece of information from your IT team:

📋 BARCODE FORMAT SPECIFICATION

When you scan a vehicle barcode with your handheld scanners, what data does it contain?

Example format we need to know:
• Field 1: Work Order Number (8 digits)
• Field 2: VIN (17 characters)
• Field 3: Buyer Code (4-6 alphanumeric)
• Field 4: Lot Location (2-4 characters)
• Field 5: Sale Day (1 character: T/W/H)

That's it. Just the format - not the actual database, not API access, just "what's encoded in the barcode."

For the full integration guide with ROI calculations, risk assessment, and implementation timeline, see the Developer Dashboard or contact Jason.

---

QUICK SUMMARY

✅ What we need: Barcode format specification from IT
✅ What we don't need: Database access, API keys, VPN access
✅ Time to implement: 4 weeks after receiving format specs
✅ Cost: $0 (one email to IT)
✅ ROI: $10,000-$26,000 annually in time savings

---

Contact Jason for the complete technical document.`}
                    data-testid="textarea-integration-guide-supervisor"
                  />
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Notes and Weather moved to global FloatingNotepad and FloatingWeatherButton in App.tsx */}
      
      {/* Help Center */}
      <HelpButton role="supervisor" variant="floating" size="md" />
      
      {/* Lot Spot Reporter */}
      <LotSpotReporter 
        reporterName="Lot Supervisor"
        reporterRole="supervisor"
      />
    </div>
  );
}
