import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  ClipboardList, 
  Key, 
  Car, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  RefreshCw,
  FileText,
  ChevronRight,
  TrendingUp,
  Activity,
  UserPlus,
  Send,
  Copy,
  Check,
  Edit2,
  Save,
  Camera,
  Map,
  Navigation,
  Coffee,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Play,
  Pause,
  Eye,
  X,
  Truck,
  Timer,
  Target,
  Award,
  Brain,
  ShieldCheck,
  Radio,
  Image,
  Upload,
  Download,
  Mail,
  Printer,
  Newspaper,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicSkyBackground } from "@/components/DynamicSkyBackground";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CameraPreviewModal } from "@/components/CameraPreviewModal";

// Mock data for sandbox mode
const MOCK_DRIVERS = [
  { id: 1, name: "John Smith", phone: "555-1234", status: "available" },
  { id: 2, name: "Maria Garcia", phone: "555-2345", status: "available" },
  { id: 3, name: "James Wilson", phone: "555-3456", status: "available" },
  { id: 4, name: "Sarah Johnson", phone: "555-4567", status: "available" },
  { id: 5, name: "Mike Brown", phone: "555-5678", status: "off" },
  { id: 6, name: "Lisa Davis", phone: "555-6789", status: "available" },
  { id: 7, name: "Robert Taylor", phone: "555-7890", status: "available" },
  { id: 8, name: "Emily Martinez", phone: "555-8901", status: "available" },
];

const JOB_ASSIGNMENTS = [
  { id: "clean_side", name: "Clean Side", description: "Dealer-ready vehicles staging", color: "blue" },
  { id: "lists", name: "Lists", description: "Picking vehicles from lists", color: "green" },
  { id: "chute", name: "Chute", description: "Sale lane flow management", color: "purple" },
  { id: "shops_ready", name: "Shops Ready", description: "Post-service vehicles", color: "amber" },
  { id: "sold_units", name: "Sold Units", description: "Sold vehicle staging", color: "rose" },
  { id: "crunch_mode", name: "Crunch Mode", description: "501-505, 513-518, 591-599", color: "red" },
  { id: "flip_sale", name: "Flip Sale", description: "Lanes 1-55", color: "cyan" },
  { id: "special", name: "Special", description: "Custom tasks", color: "slate" },
];

// Lot zones for map
const LOT_ZONES = [
  { id: "sale_lanes", name: "Sale Lanes", spots: "210-257", color: "bg-purple-500" },
  { id: "dirtside", name: "Dirtside", spots: "325-372", color: "bg-amber-600" },
  { id: "cleanside", name: "Cleanside", spots: "400-411", color: "bg-green-500" },
  { id: "inventory", name: "Inventory", spots: "501-520", color: "bg-blue-500" },
  { id: "cage", name: "The Cage", spots: "591-599", color: "bg-red-500" },
  { id: "overflow", name: "Overflow", spots: "702+", color: "bg-slate-500" },
  { id: "psi", name: "PSI", spots: "800-860", color: "bg-cyan-500" },
];

interface DriverAssignment {
  driverId: number;
  assignmentId: string;
  vanNumber: number;
}

interface SimulatedVan {
  id: number;
  driverName: string;
  vanNumber: number;
  x: number;
  y: number;
  zone: string;
  status: "moving" | "idle" | "loading";
}

interface TimelineEvent {
  id: number;
  time: string;
  event: string;
  type: "scan" | "move" | "break" | "alert" | "assignment";
}

// Animated Hand Component for Tutorial
function AnimatedHand({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`text-4xl ${className}`}
      animate={{ 
        y: [0, -8, 0],
        rotate: [0, -10, 0, 10, 0],
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-10 h-10 text-yellow-400 drop-shadow-lg"
      >
        <path d="M18.75 6.5V5.5C18.75 4.26 17.74 3.25 16.5 3.25C16.04 3.25 15.62 3.39 15.26 3.63C15.02 2.6 14.1 1.83 13 1.83C11.77 1.83 10.77 2.84 10.77 4.08V4.5C10.38 4.18 9.88 4 9.33 4C8.1 4 7.08 5.02 7.08 6.25V6.5C6.7 6.18 6.2 6 5.67 6C4.43 6 3.42 7.02 3.42 8.25V15.17C3.42 18.39 6.01 21 9.21 21H14.96C18.16 21 20.75 18.39 20.75 15.17V8.5C20.75 7.27 19.74 6.25 18.5 6.25C18.58 6.33 18.62 6.42 18.75 6.5Z" />
      </svg>
    </motion.div>
  );
}

// Tutorial step data - Simplified 3-step daily setup
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Set Up Your Day!",
    description: "This is your daily shift setup. It's simple: pick your drivers, assign their jobs, generate the shift code, and you're live!",
    highlight: "header",
  },
  {
    id: 2,
    title: "Step 1: Build Your Roster",
    description: "Tap drivers to add them to today's shift. Assign each one a van number and their job area.",
    highlight: "roster",
  },
  {
    id: 3,
    title: "Step 2: Generate Shift Code",
    description: "Create the 6-digit code drivers enter to clock into this shift. Share it at the pre-shift meeting.",
    highlight: "shiftcode",
  },
  {
    id: 4,
    title: "Go Live!",
    description: "Hit Go Live and your Command Center opens. Watch your drivers move in real-time, tap any van to message them, and generate your report at shift end!",
    highlight: "golive",
  },
];

export default function SupervisorSandbox() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);
  const [shiftCode, setShiftCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [driverAssignments, setDriverAssignments] = useState<DriverAssignment[]>([]);
  const [activeSection, setActiveSection] = useState<string>("roster");
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [weeklyLaneMap, setWeeklyLaneMap] = useState<string | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showLaneMapDialog, setShowLaneMapDialog] = useState(false);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showMapsTab, setShowMapsTab] = useState(false);
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [lastScannedVin, setLastScannedVin] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Reset Employee PIN state
  const [resetPinEmployeeId, setResetPinEmployeeId] = useState<number | null>(null);
  const [resetPinTempCode, setResetPinTempCode] = useState("");
  const [isResettingPin, setIsResettingPin] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Check if this is first visit to show tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('vanops_supervisor_tutorial_seen');
    if (!hasSeenTutorial && !isSetupComplete) {
      // Small delay to let page render first
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isSetupComplete]);
  
  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('vanops_supervisor_tutorial_seen', 'true');
  };
  
  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      dismissTutorial();
    }
  };
  
  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };
  
  // Live dashboard state
  const [simulatedVans, setSimulatedVans] = useState<SimulatedVan[]>([]);
  const [selectedVan, setSelectedVan] = useState<SimulatedVan | null>(null);
  const [showVanMessageDialog, setShowVanMessageDialog] = useState(false);
  const [vanMessage, setVanMessage] = useState("");
  const [shiftStats, setShiftStats] = useState({
    totalMoves: 0,
    avgTime: "0:00",
    efficiency: 0,
    activeAlerts: 0,
  });
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [assignmentProgress, setAssignmentProgress] = useState<Record<string, number>>({});
  
  // Initialize simulated data when setup completes
  useEffect(() => {
    if (isSetupComplete) {
      // Initialize simulated vans based on selected drivers with their assigned van numbers
      const vans: SimulatedVan[] = selectedDrivers.slice(0, 6).map((driverId, index) => {
        const driver = MOCK_DRIVERS.find(d => d.id === driverId);
        const assignment = driverAssignments.find(a => a.driverId === driverId);
        return {
          id: driverId,
          driverName: driver?.name.split(' ')[0] || 'Driver',
          vanNumber: assignment?.vanNumber || (index + 1),
          x: 20 + (index % 3) * 30,
          y: 25 + Math.floor(index / 3) * 35,
          zone: JOB_ASSIGNMENTS[index % JOB_ASSIGNMENTS.length].name,
          status: "moving" as const,
        };
      });
      setSimulatedVans(vans);
      
      // Initialize assignment progress
      const progress: Record<string, number> = {};
      JOB_ASSIGNMENTS.forEach(job => {
        progress[job.id] = Math.floor(Math.random() * 60) + 20;
      });
      setAssignmentProgress(progress);
      
      // Initialize stats
      setShiftStats({
        totalMoves: Math.floor(Math.random() * 50) + 80,
        avgTime: `${Math.floor(Math.random() * 3) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        efficiency: Math.floor(Math.random() * 15) + 85,
        activeAlerts: Math.floor(Math.random() * 3),
      });
      
      // Initialize timeline
      const events: TimelineEvent[] = [
        { id: 1, time: "2:45 PM", event: "John scanned VIN 1HGCM82633A123456", type: "scan" },
        { id: 2, time: "2:42 PM", event: "Maria completed move to Lane 215", type: "move" },
        { id: 3, time: "2:38 PM", event: "James started break (15 min)", type: "break" },
        { id: 4, time: "2:35 PM", event: "Speed alert: Mike - 18 MPH in Zone B", type: "alert" },
        { id: 5, time: "2:30 PM", event: "Sarah assigned to Sold Units", type: "assignment" },
      ];
      setTimelineEvents(events);
    }
  }, [isSetupComplete, selectedDrivers]);
  
  // Animate vans
  useEffect(() => {
    if (!isSetupComplete || simulatedVans.length === 0) return;
    
    const interval = setInterval(() => {
      setSimulatedVans(prev => prev.map(van => ({
        ...van,
        x: Math.max(5, Math.min(90, van.x + (Math.random() - 0.5) * 8)),
        y: Math.max(10, Math.min(85, van.y + (Math.random() - 0.5) * 6)),
        status: Math.random() > 0.7 ? (Math.random() > 0.5 ? "idle" : "loading") : "moving",
      })));
      
      // Increment stats periodically
      setShiftStats(prev => ({
        ...prev,
        totalMoves: prev.totalMoves + (Math.random() > 0.7 ? 1 : 0),
      }));
      
      // Update progress
      setAssignmentProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] < 100) {
            updated[key] = Math.min(100, updated[key] + (Math.random() > 0.8 ? 1 : 0));
          }
        });
        return updated;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isSetupComplete, simulatedVans.length]);
  
  // Generate a random 6-digit shift code
  const generateShiftCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setShiftCode(code);
    toast({
      title: "Shift Code Generated",
      description: `New code: ${code}. Share this with your drivers.`,
    });
  };

  const copyShiftCode = () => {
    navigator.clipboard.writeText(shiftCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({
      title: "Copied!",
      description: "Shift code copied to clipboard",
    });
  };

  // Reset Employee PIN handler
  const handleResetEmployeePin = async () => {
    if (!resetPinEmployeeId || resetPinTempCode.length !== 4) return;
    
    setIsResettingPin(true);
    try {
      const employee = MOCK_DRIVERS.find(d => d.id === resetPinEmployeeId);
      
      // In sandbox mode, just simulate the reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "PIN Reset Successful",
        description: `${employee?.name}'s PIN has been reset to ${resetPinTempCode}. They must change it on next login.`,
      });
      
      // Clear the form
      setResetPinEmployeeId(null);
      setResetPinTempCode("");
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Could not reset PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPin(false);
    }
  };

  const toggleDriverSelection = (driverId: number) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const assignDriver = (driverId: number, assignmentId: string) => {
    setDriverAssignments(prev => {
      const existing = prev.findIndex(a => a.driverId === driverId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], driverId, assignmentId };
        return updated;
      }
      // Default van number based on order
      const defaultVanNumber = prev.length + 1;
      return [...prev, { driverId, assignmentId, vanNumber: defaultVanNumber }];
    });
  };

  const getDriverAssignment = (driverId: number) => {
    return driverAssignments.find(a => a.driverId === driverId)?.assignmentId;
  };

  const getAssignmentColor = (assignmentId: string) => {
    const assignment = JOB_ASSIGNMENTS.find(j => j.id === assignmentId);
    const colors: Record<string, string> = {
      blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      green: "bg-green-500/20 text-green-300 border-green-500/30",
      purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      rose: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      red: "bg-red-500/20 text-red-300 border-red-500/30",
      cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      slate: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    };
    return colors[assignment?.color || "slate"] || colors.slate;
  };

  const handleGoLive = () => {
    setShowGoLiveDialog(false);
    localStorage.removeItem('vanops_sandbox_mode');
    setLocation('/');
  };

  const completeSetup = () => {
    if (!shiftCode) {
      toast({
        title: "Missing Shift Code",
        description: "Please generate a shift code before completing setup.",
        variant: "destructive",
      });
      return;
    }
    if (selectedDrivers.length === 0) {
      toast({
        title: "No Drivers Selected",
        description: "Please select at least one driver for today's shift.",
        variant: "destructive",
      });
      return;
    }
    if (driverAssignments.length < selectedDrivers.length) {
      toast({
        title: "Incomplete Assignments",
        description: "Please assign all selected drivers to their jobs.",
        variant: "destructive",
      });
      return;
    }
    setIsSetupComplete(true);
    toast({
      title: "Shift Started!",
      description: "Live dashboard is now active. Monitor your drivers in real-time.",
    });
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setWeeklyLaneMap(imageData);
        stopCamera();
        setShowCameraDialog(false);
        toast({
          title: "Lane Map Captured!",
          description: "Ready to distribute to all drivers.",
        });
      }
    }
  };

  const sendLaneMapToAll = () => {
    toast({
      title: "Lane Map Sent!",
      description: `Weekly lane map distributed to ${selectedDrivers.length} drivers.`,
    });
  };

  const availableDrivers = MOCK_DRIVERS.filter(d => d.status === "available");
  const selectedDriversList = availableDrivers.filter(d => selectedDrivers.includes(d.id));

  // Get driver status for live dashboard
  const getDriverStatus = (driverId: number) => {
    const van = simulatedVans.find(v => v.id === driverId);
    if (!van) return { status: "offline", color: "bg-slate-500" };
    switch (van.status) {
      case "moving": return { status: "Active", color: "bg-green-500" };
      case "idle": return { status: "Idle", color: "bg-yellow-500" };
      case "loading": return { status: "Loading", color: "bg-blue-500" };
      default: return { status: "Unknown", color: "bg-slate-500" };
    }
  };

  // Render Setup Phase
  if (!isSetupComplete) {
    const currentStep = TUTORIAL_STEPS[tutorialStep];
    
    return (
      <div className="min-h-screen relative overflow-hidden">
        <DynamicSkyBackground />
        
        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && dismissTutorial()}
            >
              {/* Tutorial Card */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md"
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/50 shadow-2xl shadow-purple-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-600 text-white">
                        Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={dismissTutorial}
                        className="text-slate-400 hover:text-white"
                        data-testid="button-close-tutorial"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl text-white flex items-center gap-3 mt-2">
                      <AnimatedHand />
                      {currentStep.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-base leading-relaxed mb-6">
                      {currentStep.description}
                    </p>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-4">
                      {TUTORIAL_STEPS.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === tutorialStep 
                              ? 'bg-purple-500 w-6' 
                              : idx < tutorialStep 
                                ? 'bg-purple-400' 
                                : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      {tutorialStep > 0 && (
                        <Button
                          variant="outline"
                          onClick={prevTutorialStep}
                          className="flex-1 border-slate-600 text-slate-300"
                          data-testid="button-tutorial-prev"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                      )}
                      <Button
                        onClick={nextTutorialStep}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        data-testid="button-tutorial-next"
                      >
                        {tutorialStep === TUTORIAL_STEPS.length - 1 ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Got It!
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-slate-500 text-center mt-3">
                      Tap outside to skip tutorial
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Floating hand pointer to relevant section */}
              {tutorialStep > 0 && tutorialStep < TUTORIAL_STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute pointer-events-none"
                  style={{
                    top: tutorialStep === 1 ? '55%' : 
                         tutorialStep === 2 ? '60%' :
                         tutorialStep === 3 ? '65%' :
                         tutorialStep === 4 ? '70%' : '50%',
                    left: '15%',
                  }}
                >
                  <motion.div
                    animate={{ 
                      x: [0, 20, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowLeft className="h-12 w-12 text-yellow-400 rotate-180 drop-shadow-lg" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sandbox Mode Banner */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold text-sm sm:text-base">SUPERVISOR SANDBOX</span>
            <span className="hidden sm:inline text-sm opacity-80">- Practice shift setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTutorialStep(0);
                setShowTutorial(true);
              }}
              className="text-white/80 hover:text-white hover:bg-white/10"
              data-testid="button-show-tutorial"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Tutorial</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowGoLiveDialog(true)}
              className="bg-white text-purple-700 hover:bg-purple-100 font-bold"
              data-testid="button-go-live-header"
            >
              Go Live
            </Button>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <div className="relative z-10 pt-16 pb-8 px-4 max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4 text-slate-300 hover:text-white"
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          {/* Header - Clear "Set Up Your Day" messaging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Set Up Your Day</h1>
            <p className="text-slate-300">Pick your drivers, assign their vans and jobs, generate the shift code</p>
          </motion.div>

          {/* Setup Progress - Simple 3-step checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className={`flex items-center gap-2 ${selectedDrivers.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">{selectedDrivers.length} Drivers</span>
                    </div>
                    <div className={`flex items-center gap-2 ${driverAssignments.length >= selectedDrivers.length && selectedDrivers.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">{driverAssignments.length} with Vans/Jobs</span>
                    </div>
                    <div className={`flex items-center gap-2 ${shiftCode ? 'text-green-400' : 'text-slate-400'}`}>
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">Shift Code</span>
                    </div>
                  </div>
                  <Button
                    onClick={completeSetup}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                    data-testid="button-complete-setup"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Go Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accordion Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" value={activeSection} onValueChange={setActiveSection} className="space-y-4">
              {/* ROSTER SECTION */}
              <AccordionItem value="roster" className="border-0">
                <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-roster">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">Today's Roster</h3>
                        <p className="text-xs text-slate-400">
                          {selectedDrivers.length} of {availableDrivers.length} drivers selected
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        {availableDrivers.map((driver) => (
                          <div 
                            key={driver.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                              selectedDrivers.includes(driver.id)
                                ? 'bg-blue-500/20 border border-blue-500/30'
                                : 'bg-slate-800/50 hover:bg-slate-700/50'
                            }`}
                            onClick={() => toggleDriverSelection(driver.id)}
                            data-testid={`roster-driver-${driver.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={selectedDrivers.includes(driver.id)}
                                onCheckedChange={() => toggleDriverSelection(driver.id)}
                              />
                              <div>
                                <p className="font-medium text-white">{driver.name}</p>
                                <p className="text-xs text-slate-400">{driver.phone}</p>
                              </div>
                            </div>
                            {selectedDrivers.includes(driver.id) && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                Selected
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                          {MOCK_DRIVERS.filter(d => d.status === "off").length} drivers marked off today
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-slate-300 border-slate-600"
                          onClick={() => setSelectedDrivers(availableDrivers.map(d => d.id))}
                          data-testid="button-select-all-drivers"
                        >
                          Select All Available
                        </Button>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* ASSIGNMENTS SECTION */}
              <AccordionItem value="assignments" className="border-0">
                <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-assignments">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <ClipboardList className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">Job Assignments</h3>
                        <p className="text-xs text-slate-400">
                          {driverAssignments.length} drivers assigned
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-2">
                      {selectedDrivers.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Select drivers from the Roster first</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedDriversList.map((driver, index) => {
                            const assignment = driverAssignments.find(a => a.driverId === driver.id);
                            return (
                              <div 
                                key={driver.id}
                                className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50"
                              >
                                {/* Van Number */}
                                <Select
                                  value={assignment?.vanNumber?.toString() || ""}
                                  onValueChange={(value) => {
                                    const vanNum = parseInt(value);
                                    setDriverAssignments(prev => {
                                      const existing = prev.find(a => a.driverId === driver.id);
                                      if (existing) {
                                        return prev.map(a => a.driverId === driver.id ? { ...a, vanNumber: vanNum } : a);
                                      }
                                      return [...prev, { driverId: driver.id, assignmentId: "", vanNumber: vanNum }];
                                    });
                                  }}
                                >
                                  <SelectTrigger 
                                    className="w-20 bg-slate-700/50 border-slate-600"
                                    data-testid={`select-van-${driver.id}`}
                                  >
                                    <SelectValue placeholder="Van" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                                      <SelectItem key={num} value={num.toString()}>
                                        Van {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {/* Driver Name */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{driver.name}</p>
                                </div>
                                
                                {/* Job Assignment */}
                                <Select
                                  value={getDriverAssignment(driver.id) || ""}
                                  onValueChange={(value) => assignDriver(driver.id, value)}
                                >
                                  <SelectTrigger 
                                    className={`w-32 ${getDriverAssignment(driver.id) ? getAssignmentColor(getDriverAssignment(driver.id)!) : 'bg-slate-700/50 border-slate-600'}`}
                                    data-testid={`select-assignment-${driver.id}`}
                                  >
                                    <SelectValue placeholder="Job..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {JOB_ASSIGNMENTS.map((job) => (
                                      <SelectItem key={job.id} value={job.id}>
                                        {job.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Assignment Legend */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-2">Available Assignments:</p>
                        <div className="flex flex-wrap gap-2">
                          {JOB_ASSIGNMENTS.map((job) => (
                            <Badge 
                              key={job.id}
                              variant="outline"
                              className={`text-xs ${getAssignmentColor(job.id)}`}
                            >
                              {job.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* SHIFT CODE SECTION */}
              <AccordionItem value="shift-code" className="border-0">
                <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-shift-code">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Key className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">Shift Code</h3>
                        <p className="text-xs text-slate-400">
                          {shiftCode ? `Code: ${shiftCode}` : 'Generate a code for drivers'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-2">
                      <div className="space-y-4">
                        {/* Current Code Display */}
                        {shiftCode ? (
                          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4 text-center">
                            <p className="text-sm text-amber-300 mb-2">Today's Shift Code</p>
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-4xl font-bold tracking-widest text-white font-mono">
                                {shiftCode}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={copyShiftCode}
                                className="text-amber-400 hover:text-amber-300"
                                data-testid="button-copy-shift-code"
                              >
                                {copiedCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                              </Button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              Share this code at the pre-shift meeting
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-slate-800/50 rounded-lg">
                            <Key className="h-10 w-10 mx-auto mb-3 text-slate-500" />
                            <p className="text-slate-400 mb-4">No shift code generated yet</p>
                          </div>
                        )}

                        {/* Generate Button */}
                        <Button
                          onClick={generateShiftCode}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                          data-testid="button-generate-shift-code"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {shiftCode ? 'Generate New Code' : 'Generate Shift Code'}
                        </Button>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* RESET EMPLOYEE PIN SECTION */}
              <AccordionItem value="reset-pin" className="border-0">
                <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-reset-pin">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/20">
                        <Key className="h-5 w-5 text-rose-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">Reset Employee PIN</h3>
                        <p className="text-xs text-slate-400">Help team members who forgot their PIN</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-4">
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                          <p className="text-sm text-slate-300 mb-3">
                            If a team member forgets their PIN, you can reset it to a temporary 4-digit code. 
                            They'll be required to change it on their next login.
                          </p>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-slate-300 text-sm">Select Employee</Label>
                              <Select 
                                value={resetPinEmployeeId?.toString() || ""} 
                                onValueChange={(val) => setResetPinEmployeeId(parseInt(val))}
                              >
                                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                                  <SelectValue placeholder="Choose employee..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  {MOCK_DRIVERS.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id.toString()}>
                                      {driver.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-300 text-sm">Temporary PIN (4 digits)</Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="e.g. 1234"
                                value={resetPinTempCode}
                                onChange={(e) => setResetPinTempCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="bg-slate-800/50 border-slate-700 text-white mt-1 text-center text-xl tracking-widest font-mono"
                                data-testid="input-reset-pin-temp"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleResetEmployeePin}
                          disabled={!resetPinEmployeeId || resetPinTempCode.length !== 4 || isResettingPin}
                          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500"
                          data-testid="button-reset-employee-pin"
                        >
                          {isResettingPin ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Resetting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Key className="h-4 w-4" />
                              Reset PIN
                            </span>
                          )}
                        </Button>
                        <p className="text-xs text-slate-500 text-center">
                          Give the temporary PIN to the employee verbally. They'll set a new PIN on next login.
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Skip Setup Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              onClick={() => setShowGoLiveDialog(true)}
              variant="outline"
              className="w-full h-14 text-lg font-bold border-slate-600 text-slate-300"
              data-testid="button-go-live"
            >
              <Zap className="h-5 w-5 mr-2" />
              Skip Setup & Go Live
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Camera Dialog */}
        <Dialog open={showCameraDialog} onOpenChange={(open) => {
          setShowCameraDialog(open);
          if (!open) stopCamera();
        }}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-cyan-400" />
                Scan Weekly Lane Map
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Position the lane map in the viewfinder and capture
              </DialogDescription>
            </DialogHeader>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <Button onClick={startCamera} className="bg-cyan-600">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              )}
              {/* Viewfinder overlay */}
              <div className="absolute inset-4 border-2 border-cyan-400/50 rounded-lg pointer-events-none" />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  stopCamera();
                  setShowCameraDialog(false);
                }}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!cameraStream}
                className="bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Go Live Confirmation Dialog */}
        <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-400" />
                Go Live?
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Switch to live mode where actions affect the real system.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-amber-400 mb-2">Setup Incomplete</h4>
                <p className="text-sm text-slate-300">
                  You haven't completed the shift setup. Going live now means you'll need to set up in the live system.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGoLiveDialog(false)}
                className="border-slate-600 text-slate-300"
              >
                Stay in Sandbox
              </Button>
              <Button
                onClick={handleGoLive}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Go Live Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============================================
  // LIVE COMMAND CENTER (After Setup Complete)
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Live Mode Banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="font-bold text-sm sm:text-base">LIVE SHIFT</span>
          <span className="hidden sm:inline text-sm opacity-80">• {selectedDrivers.length} Drivers Active</span>
          <span className="hidden md:inline text-sm opacity-80">• Code: {shiftCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowMapsTab(true)}
            className="text-white hover:bg-white/20"
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowGoLiveDialog(true)}
            className="bg-white text-green-700 hover:bg-green-100 font-bold"
          >
            End Shift
          </Button>
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 pt-14 pb-4 px-2 sm:px-4">
        {/* Bento Grid Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 auto-rows-[minmax(80px,auto)]">
          
          {/* LIVE MAP - Large tile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-2 row-span-3 md:col-span-2 lg:col-span-3"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50 overflow-hidden">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400" />
                    Live Map
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    {simulatedVans.length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 h-[calc(100%-48px)]">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  {/* Actual Lot Footprint Map */}
                  <img 
                    src="/attached_assets/image-3705654498381149414_1763515079330.jpg"
                    alt="Manheim Nashville Facility Map"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Zone legend overlay */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    {LOT_ZONES.slice(0, 4).map(zone => (
                      <Badge key={zone.id} variant="outline" className={`text-[10px] bg-black/50 backdrop-blur-sm ${zone.color}/30 border-white/30`}>
                        {zone.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Animated vans overlay on map - Tap to message */}
                  {simulatedVans.map(van => (
                    <motion.div
                      key={van.id}
                      className="absolute flex flex-col items-center z-20 cursor-pointer"
                      animate={{ left: `${van.x}%`, top: `${van.y}%` }}
                      transition={{ type: "spring", damping: 20 }}
                      onClick={() => {
                        setSelectedVan(van);
                        setShowVanMessageDialog(true);
                      }}
                      data-testid={`van-marker-${van.vanNumber}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white ${
                        van.status === 'moving' ? 'bg-green-500 animate-pulse' :
                        van.status === 'idle' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {van.vanNumber}
                      </div>
                      <span className="text-[9px] text-white bg-black/70 px-1.5 py-0.5 rounded mt-0.5 font-medium">{van.driverName}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QUICK STATS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 md:col-span-2 lg:col-span-3"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-2 h-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{shiftStats.totalMoves}</div>
                    <div className="text-[10px] text-slate-400">Moves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{shiftStats.avgTime}</div>
                    <div className="text-[10px] text-slate-400">Avg Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{shiftStats.efficiency}%</div>
                    <div className="text-[10px] text-slate-400">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{shiftStats.activeAlerts}</div>
                    <div className="text-[10px] text-slate-400">Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* DRIVER ROSTER STATUS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 row-span-2 lg:col-span-3"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  Driver Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[120px]">
                  <div className="space-y-1">
                    {selectedDriversList.slice(0, 6).map(driver => {
                      const status = getDriverStatus(driver.id);
                      const assignment = JOB_ASSIGNMENTS.find(j => j.id === getDriverAssignment(driver.id));
                      return (
                        <div key={driver.id} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`} />
                            <span className="text-sm text-white">{driver.name.split(' ')[0]}</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${getAssignmentColor(assignment?.id || '')}`}>
                            {assignment?.name || 'Unassigned'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* ASSIGNMENT PROGRESS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-2 row-span-2 lg:col-span-3"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  Assignment Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-2">
                  {JOB_ASSIGNMENTS.slice(0, 5).map(job => (
                    <div key={job.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{job.name}</span>
                        <span className="text-slate-400">{assignmentProgress[job.id] || 0}%</span>
                      </div>
                      <Progress value={assignmentProgress[job.id] || 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-2 md:col-span-2"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-5 gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-col h-14 text-xs text-slate-300"
                    onClick={() => setShowVinScanner(true)}
                    data-testid="button-quick-scan"
                  >
                    <Camera className="h-4 w-4 mb-1 text-cyan-400" />
                    Scan
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-col h-14 text-xs text-slate-300">
                    <Coffee className="h-4 w-4 mb-1 text-amber-400" />
                    Breaks
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-col h-14 text-xs text-slate-300">
                    <RefreshCw className="h-4 w-4 mb-1 text-green-400" />
                    Reassign
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-col h-14 text-xs text-slate-300">
                    <MessageSquare className="h-4 w-4 mb-1 text-blue-400" />
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-col h-14 text-xs text-slate-300"
                    onClick={() => setLocation("/employee-portal")}
                    data-testid="button-employee-portal"
                  >
                    <Newspaper className="h-4 w-4 mb-1 text-indigo-400" />
                    Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SAFETY CENTER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-1"
          >
            <Card 
              className="h-full bg-slate-900/90 border-slate-700/50 cursor-pointer hover:border-red-500/50 transition-colors"
              onClick={() => setShowSafetyDialog(true)}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                <ShieldCheck className="h-6 w-6 text-red-400 mb-1" />
                <span className="text-xs text-white font-medium">Safety</span>
                <Badge variant="outline" className="text-[10px] mt-1 bg-green-500/20 text-green-300 border-green-500/30">
                  0 Issues
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI SUGGESTIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50 cursor-pointer hover:border-purple-500/50 transition-colors">
              <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                <Brain className="h-6 w-6 text-purple-400 mb-1" />
                <span className="text-xs text-white font-medium">AI Tips</span>
                <Badge variant="outline" className="text-[10px] mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  2 New
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* PERFORMANCE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-2"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {selectedDriversList.slice(0, 3).map((driver, idx) => (
                    <div key={driver.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {driver.name.split(' ')[0]}
                      </span>
                      <span className="text-green-400">{Math.floor(Math.random() * 10) + 10} moves</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SHIFT TIMELINE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-span-2 row-span-2"
          >
            <Card className="h-full bg-slate-900/90 border-slate-700/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[100px]">
                  <div className="space-y-2">
                    {timelineEvents.map(event => (
                      <div key={event.id} className="flex items-start gap-2 text-xs">
                        <span className="text-slate-500 whitespace-nowrap">{event.time}</span>
                        <span className={`${
                          event.type === 'alert' ? 'text-red-400' :
                          event.type === 'scan' ? 'text-cyan-400' :
                          event.type === 'break' ? 'text-amber-400' :
                          'text-slate-300'
                        }`}>{event.event}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* FOOTER ACTIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="col-span-2 md:col-span-4 lg:col-span-6"
          >
            <Card className="bg-slate-900/90 border-slate-700/50">
              <CardContent className="p-2">
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                    <FileText className="h-4 w-4 mr-2" />
                    Shift Report
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300" onClick={() => setShowMapsTab(true)}>
                    <Map className="h-4 w-4 mr-2" />
                    Maps
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600"
                    onClick={() => setShowGoLiveDialog(true)}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    End Shift
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Maps Tab Dialog - Enhanced with Lane Map Management */}
      <Dialog open={showMapsTab} onOpenChange={setShowMapsTab}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Map className="h-5 w-5 text-cyan-400" />
              Facility Maps
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              View lot footprint and manage weekly lane maps
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="footprint" className="w-full">
            <TabsList className="w-full bg-slate-800">
              <TabsTrigger value="footprint" className="flex-1">Lot Footprint</TabsTrigger>
              <TabsTrigger value="lanes" className="flex-1">
                Weekly Lanes
                {weeklyLaneMap && <Badge className="ml-2 bg-green-500/20 text-green-400 text-[10px]">Active</Badge>}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="footprint" className="mt-4 space-y-4">
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <img 
                  src="/attached_assets/image-3705654498381149414_1763515079330.jpg"
                  alt="Manheim Nashville Lot Footprint"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {LOT_ZONES.map(zone => (
                  <Badge key={zone.id} variant="outline" className={`text-xs ${zone.color}/30 border-white/20`}>
                    {zone.name}: {zone.spots}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">Tap to zoom. Footprint map is permanent.</p>
            </TabsContent>
            <TabsContent value="lanes" className="mt-4 space-y-4">
              {/* Week Number Display */}
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                <div>
                  <span className="text-xs text-slate-400">Current Week</span>
                  <div className="text-lg font-bold text-cyan-400">Week {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}</div>
                </div>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                  {weeklyLaneMap ? 'Map Uploaded' : 'No Map'}
                </Badge>
              </div>
              
              {weeklyLaneMap ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-cyan-500/30">
                    <img src={weeklyLaneMap} alt="Weekly Lane Map" className="w-full rounded-lg" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                      onClick={() => setWeeklyLaneMap(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                      onClick={sendLaneMapToAll}
                      data-testid="button-send-lane-map"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Push to All Drivers
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => {
                        setShowMapsTab(false);
                        setShowCameraDialog(true);
                        startCamera();
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">This map is now available in all driver dashboards</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600">
                    <Map className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                    <p className="text-slate-400 mb-2">No lane map for this week</p>
                    <p className="text-xs text-slate-500">Scan or upload the weekly lane configuration</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setShowMapsTab(false);
                        setShowCameraDialog(true);
                        startCamera();
                      }}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600"
                      data-testid="button-scan-lane-map"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Scan Map
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                      onClick={() => {
                        setWeeklyLaneMap("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM2NGI1ZjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjI0Ij5XZWVrbHkgTGFuZSBNYXA8L3RleHQ+PC9zdmc+");
                        toast({ title: "Lane Map Uploaded", description: "Map loaded and available to drivers" });
                      }}
                      data-testid="button-upload-lane-map"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Safety Dialog */}
      <Dialog open={showSafetyDialog} onOpenChange={setShowSafetyDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-400" />
              Safety Center
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">2</div>
                  <div className="text-xs text-slate-400">Safety Reps On Duty</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-xs text-slate-400">Incidents Today</div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Recent Activity</h4>
              <div className="text-xs text-slate-400 p-3 bg-slate-800 rounded-lg">
                No safety incidents reported today
              </div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Shift Report
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Review your shift summary and export the report
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Shift Summary */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Shift Summary
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Moves</span>
                  <span className="text-white font-bold">{shiftStats.totalMoves}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Efficiency</span>
                  <span className="text-white font-bold">{shiftStats.efficiency}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Drivers</span>
                  <span className="text-white font-bold">{selectedDrivers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Time/Move</span>
                  <span className="text-white font-bold">{shiftStats.avgTime}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shift Code</span>
                  <span className="text-purple-400 font-mono font-bold">{shiftCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Safety Incidents</span>
                  <span className="text-green-400 font-bold">0</span>
                </div>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Export Report</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "PDF Generated!",
                      description: "Shift report saved to downloads.",
                    });
                  }}
                  className="flex-col h-auto py-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-export-pdf"
                >
                  <Download className="h-5 w-5 mb-1 text-red-400" />
                  <span className="text-xs">Save PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Email Sent!",
                      description: "Report emailed to management.",
                    });
                  }}
                  className="flex-col h-auto py-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-export-email"
                >
                  <Mail className="h-5 w-5 mb-1 text-blue-400" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.print();
                    toast({
                      title: "Print Dialog",
                      description: "Opening print dialog...",
                    });
                  }}
                  className="flex-col h-auto py-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-export-print"
                >
                  <Printer className="h-5 w-5 mb-1 text-green-400" />
                  <span className="text-xs">Print</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowGoLiveDialog(false)}
              className="border-slate-600 text-slate-300 flex-1"
            >
              Continue Shift
            </Button>
            <Button
              onClick={handleGoLive}
              className="bg-gradient-to-r from-red-600 to-rose-600 flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              End Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Van Message Dialog - Tap a van on the map to message driver */}
      <Dialog open={showVanMessageDialog} onOpenChange={setShowVanMessageDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                selectedVan?.status === 'moving' ? 'bg-green-500' :
                selectedVan?.status === 'idle' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}>
                {selectedVan?.vanNumber}
              </div>
              Van {selectedVan?.vanNumber} - {selectedVan?.driverName}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {selectedVan?.status === 'moving' ? 'Currently moving' : 
               selectedVan?.status === 'idle' ? 'Idle' : 'Loading vehicle'} in {selectedVan?.zone}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-slate-400">Status</span>
                <div className="font-bold text-white capitalize">{selectedVan?.status}</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-slate-400">Zone</span>
                <div className="font-bold text-white">{selectedVan?.zone}</div>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 mb-2 block">Send Message</Label>
              <Input
                placeholder="Type a message to driver..."
                value={vanMessage}
                onChange={(e) => setVanMessage(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                data-testid="input-van-message"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                onClick={() => {
                  toast({
                    title: "Calling Driver",
                    description: `Calling Van ${selectedVan?.vanNumber} - ${selectedVan?.driverName}...`,
                  });
                }}
                data-testid="button-call-driver"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (vanMessage.trim()) {
                    toast({
                      title: "Message Sent!",
                      description: `Message sent to Van ${selectedVan?.vanNumber}`,
                    });
                    setVanMessage("");
                    setShowVanMessageDialog(false);
                  } else {
                    toast({
                      title: "Quick Ping Sent",
                      description: `Ping sent to Van ${selectedVan?.vanNumber}`,
                    });
                  }
                }}
                data-testid="button-send-message"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {vanMessage.trim() ? 'Send' : 'Ping'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIN Scanner with Camera Preview */}
      <CameraPreviewModal
        isOpen={showVinScanner}
        mode="photo"
        title="Scan Vehicle"
        description="Position the ticket or VIN in frame"
        showScanFrame={true}
        onClose={() => setShowVinScanner(false)}
        onCapture={(dataUrl) => {
          // For sandbox, simulate a successful scan
          const mockVin = "1HGCV1F34LA" + Math.random().toString().slice(2, 8);
          setLastScannedVin(mockVin);
          setShowVinScanner(false);
          toast({
            title: "Scan Successful",
            description: `VIN: ${mockVin}`,
          });
        }}
        onProcessing={async (dataUrl) => {
          // Simulate OCR processing
          await new Promise(resolve => setTimeout(resolve, 1500));
        }}
      />
    </div>
  );
}
