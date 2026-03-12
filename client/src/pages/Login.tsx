import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Lock, LogIn, ChevronRight, ShieldCheck, Shield, Truck, Tag, Camera, LayoutDashboard, UserPlus, Briefcase, Check, PlayCircle, BookOpen, Sparkles, Settings as SettingsIcon, HelpCircle, Phone, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Footer } from "@/components/Footer";
import { GPSPermissionNotice } from "@/components/GPSPermissionNotice";
import { NavigationControl } from "@/components/NavigationControl";
import { PageWorkflowGuide } from "@/components/PageWorkflowGuide";
import { HowToGuideButton } from "@/components/HowToGuideButton";
import { useFacilityMode } from "@/hooks/useFacilityMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { CitySkyline } from "@/components/CitySkyline";
import { DynamicSkyBackground, useSkyCondition } from "@/components/DynamicSkyBackground";
import { APP_VERSION } from "@shared/version";
import angledCarDriver from "@assets/generated_images/driver_front_angled_porsche_transparent.png";

type LoginStep = "credentials" | "manager-login" | "registration" | "role";

export default function Login() {
  // Get sky condition for dynamic text colors
  const { isLightBackground } = useSkyCondition();
  
  const [pin, setPin] = useState("");
  const [dailyCode, setDailyCode] = useState("");
  const [shiftCode, setShiftCode] = useState("");
  const [shift, setShift] = useState<"first" | "second">("first");
  const [username, setUsername] = useState("");
  const [personalPin, setPersonalPin] = useState(""); // New: personal PIN during registration
  const [selectedRole, setSelectedRole] = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null); // New: role from universal PIN
  const [step, setStep] = useState<LoginStep>("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoRoleDialog, setShowDemoRoleDialog] = useState(false);
  const [demoRole, setDemoRole] = useState<string>("");
  const [showSarahWelcome, setShowSarahWelcome] = useState(false);
  const [showConnorWelcome, setShowConnorWelcome] = useState(false);
  const [showKathyWelcome, setShowKathyWelcome] = useState(false);
  const [showArielWelcome, setShowArielWelcome] = useState(false);
  const [showTeresaWelcome, setShowTeresaWelcome] = useState(false);
  const [showStacyWelcome, setShowStacyWelcome] = useState(false);
  const [showMatthewWelcome, setShowMatthewWelcome] = useState(false);
  const [showRonWelcome, setShowRonWelcome] = useState(false);
  const [showChrisWelcome, setShowChrisWelcome] = useState(false);
  const [pinSubmitted, setPinSubmitted] = useState(false);
  const [showSettingsBanner, setShowSettingsBanner] = useState(false);
  const [showForgotPinDialog, setShowForgotPinDialog] = useState(false);
  
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { isPublic } = useFacilityMode();
  const isMobile = useIsMobile();

  // Clear sandbox welcome flag for fresh onboarding experience (run once on mount)
  useEffect(() => {
    // Reset the sandbox welcome for fresh experience for all beta testers
    // This ensures everyone gets the new Lot Buddy onboarding
    const resetOnboarding = localStorage.getItem("vanops_onboarding_v2_reset");
    if (!resetOnboarding) {
      localStorage.removeItem("vanops_sandbox_welcome_seen");
      localStorage.removeItem("vanops_first_time_seen");
      localStorage.setItem("vanops_onboarding_v2_reset", "true");
    }
  }, []);


  // HANDLE DEMO MODE SELECTION
  const handleDemoModeToggle = (enabled: boolean) => {
    setDemoMode(enabled);
    if (enabled) {
      setShowDemoRoleDialog(true);
    } else {
      setDemoRole("");
    }
  };

  // START DEMO MODE WITH SELECTED ROLE
  const startDemoMode = () => {
    if (!demoRole) {
      toast({ title: "Select a Role", description: "Choose which role you want to demo.", variant: "destructive" });
      return;
    }

    const demoUsers: Record<string, any> = {
      driver: {
        id: 999,
        pin: "1234",
        name: "Demo Van Driver",
        role: "driver",
        driverNumber: "99",
        isDemo: true,
        route: "/crew-manager"
      },
      inventory: {
        id: 998,
        pin: "1234",
        name: "Demo Inventory Driver",
        role: "inventory",
        driverNumber: "98",
        isDemo: true,
        route: "/scanner"
      },
      supervisor: {
        id: 997,
        pin: "1234",
        name: "Demo Supervisor",
        role: "supervisor",
        isDemo: true,
        route: "/resource-allocation"
      },
      operations_manager: {
        id: 996,
        pin: "1234",
        name: "Demo Operations Manager",
        role: "operations_manager",
        isDemo: true,
        route: "/operations-manager"
      }
    };

    const mockUser = demoUsers[demoRole];
    
    // Set 30-minute session expiry for demo mode
    const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    
    localStorage.setItem("vanops_user", JSON.stringify(mockUser));
    localStorage.setItem("vanops_demo_mode", "true");
    localStorage.setItem("vanops_demo_expiry", String(expiryTime));
    localStorage.setItem("vanops_pin", "1234");
    
    toast({ 
      title: "🎮 Demo Mode Active", 
      description: `Practice as ${mockUser.name} - Session lasts 30 minutes!`,
      duration: 4000
    });
    
    setShowDemoRoleDialog(false);
    setLocation(mockUser.route);
  };

  // UNIFIED PIN LOGIN
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinSubmitted(true);
    setIsLoading(true);
    
    try {
       // TERESA PIN (1131) → Supervisor with Sandbox Welcome
       if (pin === "1131") {
         const teresaUser = {
           id: 9999,
           pin: "1131",
           name: "Teresa",
           role: "supervisor",
           isDemo: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(teresaUser));
         localStorage.setItem("vanops_pin", "1131");
         localStorage.setItem("vanops_demo_mode", "true");
         const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Teresa", role: "supervisor" }));
         setIsLoading(false);
         setLocation("/resource-allocation");
         return;
       }

       // STACY PIN (111) → Beta Tester (Manheim Beta Mode)
       if (pin === "111") {
         const stacyUser = {
           id: 8888,
           pin: "111",
           name: "Stacy",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(stacyUser));
         localStorage.setItem("vanops_pin", "111");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "111", name: "Stacy", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Stacy", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // KATHY PIN (222) → Beta Tester (Manheim Beta Mode)
       if (pin === "222") {
         const kathyUser = {
           id: 8777,
           pin: "222",
           name: "Kathy",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(kathyUser));
         localStorage.setItem("vanops_pin", "222");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "222", name: "Kathy", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Kathy", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // MATTHEW PIN (333) → Beta Tester (Manheim Beta Mode)
       if (pin === "333") {
         const matthewUser = {
           id: 8666,
           pin: "333",
           name: "Matthew",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(matthewUser));
         localStorage.setItem("vanops_pin", "333");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "333", name: "Matthew", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Matthew", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // SARAH PIN (444) → Beta Tester (Manheim Beta Mode)
       if (pin === "444") {
         const sarahUser = {
           id: 8555,
           pin: "444",
           name: "Sarah",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(sarahUser));
         localStorage.setItem("vanops_pin", "444");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "444", name: "Sarah", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Sarah", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // CONNOR PIN (555) → Beta Tester (Manheim Beta Mode)
       if (pin === "555") {
         const connorUser = {
           id: 8444,
           pin: "555",
           name: "Connor",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(connorUser));
         localStorage.setItem("vanops_pin", "555");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "555", name: "Connor", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Connor", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // RON ANDREWS PIN (777) → Beta Tester (Manheim Beta Mode)
       if (pin === "777") {
         const ronUser = {
           id: 8333,
           pin: "777",
           name: "Ron Andrews",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(ronUser));
         localStorage.setItem("vanops_pin", "777");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "777", name: "Ron Andrews", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Ron Andrews", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }

       // CHRIS PIN (888) → Beta Tester (Manheim Beta Mode)
       if (pin === "888") {
         const chrisUser = {
           id: 8222,
           pin: "888",
           name: "Chris",
           role: "developer",
           isDemo: true,
           isViewer: true,
           isReadOnly: true,
           isBetaTester: true,
         };
         localStorage.setItem("vanops_user", JSON.stringify(chrisUser));
         localStorage.setItem("vanops_pin", "888");
         localStorage.setItem("vanops_demo_mode", "true");
         localStorage.setItem("VITE_FACILITY_MODE", "manheim_beta");
         const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
         localStorage.setItem("vanops_demo_expiry", String(expiryTime));
         // Log beta tester access
         fetch("/api/log-beta-access", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: "888", name: "Chris", timestamp: new Date().toISOString() })
         }).catch(console.error);
         // Store pending welcome to trigger AFTER navigation to dashboard
         localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: "Chris", role: "developer" }));
         setIsLoading(false);
         setLocation("/dashboard");
         return;
       }
       
       // SMART ROUTING: Developer PIN (0424) → Developer Dashboard
       if (pin === "0424") {
         const devUser = {
           id: 1,
           pin: "0424",
           name: "Developer",
           role: "developer",
           isDemo: false,
         };
         localStorage.setItem("vanops_user", JSON.stringify(devUser));
         localStorage.setItem("vanops_pin", "0424");
         localStorage.setItem("vanops_dev_autologin", "true"); // Auto-login flag for developer
         toast({ title: "Developer Access Granted", description: "Welcome to the Developer Dashboard" });
         setLocation("/developer");
         setIsLoading(false);
         return;
       }
       
       // SMART ROUTING: Driver Number/Phone (0430) → Van Driver Setup
       if (pin === "0430") {
         setDetectedRole("driver"); // Pre-set role to van driver
         setStep("registration");
         toast({ 
           title: "New Van Driver Setup", 
           description: "Complete your profile to get started",
           duration: 3000
         });
         setIsLoading(false);
         return;
       }
       
       // DEMO MODE - Handled by separate role selection dialog
       if (demoMode && !demoRole) {
           setIsLoading(false);
           return;
       }
       
       // LIVE MODE - Normal database login
       const res = await fetch("/api/login", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ pin, shiftCode: shiftCode || undefined })
       });
       
       const data = await res.json();
       
       // New user needs registration
       if (res.status === 404 && data.needsRegistration) {
           // If universal PIN detected, store the role
           if (data.detectedRole) {
               setDetectedRole(data.detectedRole);
           }
           setStep("registration");
           setIsLoading(false);
           return;
       }
       
       if (!res.ok) {
           throw new Error(data.message || "Login failed");
       }
       
       const user = data;
       console.log("Logged in user:", user);

       // LOG PIN LOGIN FOR BETA TESTING TRACKING
       try {
         await fetch("/api/pin-logins/track", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             pin,
             userName: user.name,
             userRole: user.role,
             userId: user.id,
             ipAddress: window.location.hostname
           })
         });
       } catch (trackError) {
         console.error("Failed to track PIN login:", trackError);
       }
       
       // BETA TESTERS: Automatically launch sandbox mode
       if (user.isBetaTester) {
           toast({ 
               title: `Welcome, ${user.name}!`, 
               description: "Launching sandbox mode for testing - no changes will be saved",
               duration: 3000
           });
           setDemoMode(true);
           setShowDemoRoleDialog(true);
           return;
       }
       
       setUsername(user.name);
       setUserRole(user.role);
       
       // Store user data (with demo flag off)
       localStorage.setItem("vanops_user", JSON.stringify({ ...user, isDemo: false }));
       localStorage.setItem("vanops_demo_mode", "false");
       localStorage.setItem("vanops_pin", pin);
       
       // FIRST LOGIN - All users get sandbox mode with unified welcome
       if (user.isFirstLogin) {
           localStorage.setItem("vanops_demo_mode", "true");
           const expiryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hour session
           localStorage.setItem("vanops_demo_expiry", String(expiryTime));
           localStorage.setItem("vanops_pending_sandbox_welcome", JSON.stringify({ name: user.name, role: user.role }));
           
           // Navigate to role-appropriate dashboard - exhaustive role mapping
           const roleRoutes: Record<string, string> = {
               developer: "/developer",
               operations_manager: "/operations-manager",
               supervisor: "/resource-allocation",
               driver: "/crew-manager",
               inventory: "/scanner",
               safety_advisor: "/safety-dashboard",
               merch: "/crew-manager",
               imaging: "/scanner",
               transport: "/crew-manager",
               admin: "/operations-manager",
           };
           const targetRoute = roleRoutes[user.role] || "/operations-manager";
           setLocation(targetRoute);
           return;
       }
       
       // FORCE PIN CHANGE IF USING TEMPORARY PIN
       if (user.mustChangePin) {
           toast({
               title: "Temporary PIN Detected",
               description: "You must set your personal PIN before continuing",
               variant: "default",
           });
           setLocation("/change-pin-required");
           return;
       }
       
       // Check if install prompt was already shown
       const installShown = localStorage.getItem("vanops_install_shown");
       
       // Route based on role
       if (user.role === "developer") {
           setLocation("/developer");
       } else if (user.role === "operations_manager") {
           setLocation("/operations-manager");
       } else if (user.role === "supervisor") {
           setLocation("/resource-allocation");
       } else if (user.role === "safety_advisor") {
           // Show install prompt on first login
           if (!installShown) {
               setShowInstallPrompt(true);
           } else {
               setLocation("/safety-dashboard");
           }
       } else if (user.role === "driver") {
           // Show install prompt on first login for drivers
           if (!installShown) {
               setShowInstallPrompt(true);
           } else {
               setLocation("/crew-manager");
           }
       } else if (user.role === "inventory") {
           // Show install prompt on first login
           if (!installShown) {
               setShowInstallPrompt(true);
           } else {
               setLocation("/scanner");
           }
       } else {
           setStep("role");
       }
    } catch (e: any) {
       console.error("Login error:", e);
       toast({ title: "Login Failed", description: e.message || "Please check your PIN and try again.", variant: "destructive" });
    } finally {
       setIsLoading(false);
    }
  };

  // HANDLE PHOTO UPLOAD
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB to handle most camera photos)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Please choose a photo under 5MB.", variant: "destructive" });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePhoto(base64);
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // HANDLE REGISTRATION (with universal PIN role detection)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For universal PIN flow: need name + personal PIN + detected role
    // For old flow: need name + role (backward compatibility)
    if (!username || !personalPin) {
      toast({ title: "Missing Information", description: "Please enter your name and a 4-digit personal PIN.", variant: "destructive" });
      return;
    }

    if (!/^\d{4}$/.test(personalPin)) {
      toast({ title: "Invalid PIN", description: "PIN must be exactly 4 digits.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const roleToUse = detectedRole || selectedRole;
      if (!roleToUse) {
        throw new Error("No role detected. Please try again.");
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          personalPin,  // New PIN set by user
          name: username, 
          role: roleToUse, 
          profilePhoto 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - auto-login
      toast({ title: "Welcome!", description: `Account created as ${roleToUse}. Your personal PIN is now ${personalPin}.` });
      localStorage.setItem("vanops_user", JSON.stringify(data.user));
      localStorage.setItem("vanops_pin", personalPin);

      // Route based on role
      const roleRoutes: Record<string, string> = {
        "driver": "/crew-manager",
        "inventory": "/scanner",
        "supervisor": "/resource-allocation",
        "operations_manager": "/operations-manager",
        "safety_advisor": "/safety-dashboard",
        "developer": "/developer"
      };

      setLocation(roleRoutes[roleToUse] || "/dashboard");
    } catch (e: any) {
      toast({ title: "Registration Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    // Different flows based on role
    if (roleId === "transport") {
      setLocation("/crew-manager");
    } else if (roleId === "inventory") {
      setLocation("/scanner");
    } else if (roleId === "merch") {
      setLocation("/printer-connect");
    } else if (roleId === "imaging") {
      setLocation("/imaging-dashboard");
    } else {
      setLocation("/dashboard");
    }
  };

  const roles = [
    { 
      id: "transport", 
      title: "Van Driver", 
      desc: "Transport routing & crew management", 
      icon: <Truck className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    { 
      id: "inventory", 
      title: "Inventory Driver", 
      desc: "Car scanning & pickup requests", 
      icon: <Tag className="h-6 w-6" />,
      color: "bg-green-500"
    },
    { 
      id: "merch", 
      title: "Merchandising", 
      desc: "Stickering & lot operations", 
      icon: <Tag className="h-6 w-6" />,
      color: "bg-orange-500"
    },
    { 
      id: "imaging", 
      title: "Imaging Center", 
      desc: "Photo booth operations", 
      icon: <Camera className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start relative overflow-x-hidden overflow-y-auto pt-2" style={{ touchAction: 'pan-y' }}>
      
      {/* Dynamic Weather-Reactive Sky Background - full coverage */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DynamicSkyBackground />
      </div>
      
      {/* Dark ground cover - starts from grass area down, blocks sky below */}
      <div 
        className="absolute inset-x-0 z-[1] pointer-events-none" 
        style={{ 
          top: 'calc(55vh + 180px)',
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 20, 25, 0.7) 5%, rgb(15, 20, 25) 15%, rgb(15, 20, 25) 100%)',
          width: '120vw',
          marginLeft: '-10vw'
        }} 
      />
      
      {/* Premium Background Pattern - subtle overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-[1] pointer-events-none" 
           style={{ 
             backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", 
             backgroundSize: "24px 24px" 
           }} 
      />

      {/* Full-Width Nashville City Skyline - Silhouette against dynamic sky - FULL OPACITY */}
      <div className="absolute inset-x-0 top-[195px] z-[5] pointer-events-none w-screen" style={{ filter: 'none', opacity: 1 }}>
        <CitySkyline 
          city="nashville" 
          opacity={1} 
          height="400px"
        />
      </div>

      {/* Dark ground layer - blocks sky/stars below the grass area */}
      <div 
        className="absolute inset-x-0 bottom-0 z-[1] pointer-events-none"
        style={{
          height: '55vh',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 20, 15, 0.6) 2%, rgba(10, 15, 10, 0.95) 5%, rgb(8, 12, 8) 10%, rgb(5, 8, 5) 20%, rgb(5, 8, 5) 100%)',
          width: '120vw',
          marginLeft: '-10vw'
        }}
      />

      {/* Grass strip under the emblem - extends under character's feet */}
      <div 
        className="absolute inset-x-0 top-[500px] z-[2] pointer-events-none h-64"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(20, 70, 20, 0.5) 20%, rgba(25, 85, 25, 0.7) 50%, rgba(20, 75, 20, 0.6) 80%, transparent 100%)',
          width: '110vw',
          marginLeft: '-5vw'
        }}
      />


      <motion.div 
        className="w-full max-w-4xl px-4 z-10 relative"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Brand Header - Title & Tagline */}
        <div className="text-center mb-0 relative z-20 mt-[70px]">
          <svg 
            viewBox="0 0 400 60" 
            className="w-full max-w-[700px] md:max-w-[900px] h-auto mx-auto"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
          >
            <defs>
              {/* Chrome/Metallic Reflective Gradient */}
              <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c0c0c0">
                  <animate attributeName="stop-color" values="#c0c0c0;#e8e8e8;#ffffff;#d4d4d4;#a0a0a0;#c0c0c0" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="25%" stopColor="#ffffff">
                  <animate attributeName="stop-color" values="#ffffff;#d4d4d4;#a0a0a0;#c0c0c0;#e8e8e8;#ffffff" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#b8b8b8">
                  <animate attributeName="stop-color" values="#b8b8b8;#ffffff;#e8e8e8;#a8a8a8;#d0d0d0;#b8b8b8" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="75%" stopColor="#e0e0e0">
                  <animate attributeName="stop-color" values="#e0e0e0;#a8a8a8;#c8c8c8;#ffffff;#b0b0b0;#e0e0e0" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#d0d0d0">
                  <animate attributeName="stop-color" values="#d0d0d0;#c0c0c0;#e8e8e8;#b8b8b8;#ffffff;#d0d0d0" dur="2.5s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              {/* Chrome highlight shimmer */}
              <linearGradient id="chromeShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent">
                  <animate attributeName="offset" values="-0.5;1.5" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="40%" stopColor="rgba(255,255,255,0.8)">
                  <animate attributeName="offset" values="-0.1;1.9" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="rgba(255,255,255,1)">
                  <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="60%" stopColor="rgba(255,255,255,0.8)">
                  <animate attributeName="offset" values="0.1;2.1" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="transparent">
                  <animate attributeName="offset" values="0.5;2.5" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="url(#holoGradient)"
              style={{ 
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: '48px',
                fontWeight: 300,
                letterSpacing: '0.1em'
              }}
            >
              Lot Ops Pro
            </text>
          </svg>
          <svg 
            viewBox="0 0 600 35" 
            className="w-full max-w-[800px] md:max-w-[1000px] h-auto mx-auto mt-2"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
          >
            <defs>
              <linearGradient id="subtitleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {isLightBackground ? (
                  <>
                    <stop offset="0%" stopColor="#1e293b">
                      <animate attributeName="stop-color" values="#1e293b;#334155;#475569;#1e293b" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="50%" stopColor="#475569">
                      <animate attributeName="stop-color" values="#475569;#1e293b;#334155;#475569" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#334155">
                      <animate attributeName="stop-color" values="#334155;#475569;#1e293b;#334155" dur="4s" repeatCount="indefinite" />
                    </stop>
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#e2e8f0">
                      <animate attributeName="stop-color" values="#e2e8f0;#cbd5e1;#f1f5f9;#e2e8f0" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="50%" stopColor="#f1f5f9">
                      <animate attributeName="stop-color" values="#f1f5f9;#e2e8f0;#cbd5e1;#f1f5f9" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#cbd5e1">
                      <animate attributeName="stop-color" values="#cbd5e1;#f1f5f9;#e2e8f0;#cbd5e1" dur="4s" repeatCount="indefinite" />
                    </stop>
                  </>
                )}
              </linearGradient>
              {/* Text shadow filter for readability on any sky */}
              <filter id="subtitleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={isLightBackground ? "#ffffff" : "#000000"} floodOpacity={isLightBackground ? "0.8" : "0.6"} />
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={isLightBackground ? "#ffffff" : "#000000"} floodOpacity={isLightBackground ? "0.5" : "0.4"} />
              </filter>
            </defs>
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fill="url(#subtitleGradient)"
              filter="url(#subtitleShadow)"
              style={{ 
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.2em'
              }}
            >
              Autonomous Lot Management System
            </text>
          </svg>
        </div>
        
        {/* Hero Image - Pixar Figure with Angled Car - IN FRONT of skyline */}
        <div className="relative mb-1 z-10">
          <div className="mx-auto w-64 md:w-80 flex items-center justify-center relative overflow-visible" style={{ transform: 'translateX(calc(45vw - 75px)) scale(0.73)' }}>
             <div className="relative mt-[245px]">
               <img 
                 src={angledCarDriver} 
                 alt="Lot Ops Pro" 
                 className="w-full h-auto object-contain drop-shadow-2xl relative z-10"
               />
             </div>
          </div>
        </div>

        {/* First Time Banner - Directs users to Settings for policies */}
        {showSettingsBanner && (
          <div className="mb-4">
            <div className="relative bg-gradient-to-r from-blue-900/60 to-slate-800/60 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
              <button
                onClick={() => {
                  localStorage.setItem('vanops_settings_banner_dismissed', 'true');
                  setShowSettingsBanner(false);
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss"
                data-testid="button-dismiss-settings-banner"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 pr-6">
                <div className="flex-shrink-0">
                  <SettingsIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-100 font-medium">First time?</p>
                  <p className="text-xs text-slate-400">Check Settings for important policies to review</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setLocation("/settings")}
                  className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-go-to-settings"
                >
                  Settings →
                </Button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* --- MOBILE: LANDING PAGE ENTRY BUTTONS --- */}
          {step === "credentials" && isMobile && (
            <motion.div
              key="entry-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto -mt-[60px]"
            >
              {/* Tutorial Guide Button - Above sandbox buttons */}
              <div className="mb-4 flex justify-center">
                <PageWorkflowGuide />
              </div>
              {/* Sandbox Mode Disclaimer */}
              <div className="text-center mb-6">
                <p className="text-slate-300 text-sm font-medium backdrop-blur-sm bg-slate-900/40 inline-block px-4 py-2 rounded-lg border border-slate-700/50">
                  You are entering Sandbox Mode
                </p>
              </div>

              {/* Two Entry Buttons */}
              <div className="flex flex-col gap-4 justify-center">
                {/* Drivers Button */}
                <Button
                  onClick={() => {
                    // Go directly to driver sandbox - no login required
                    localStorage.setItem('vanops_sandbox_mode', 'true');
                    localStorage.setItem('vanops_entry_type', 'driver');
                    setLocation('/driver-sandbox');
                  }}
                  className="h-20 text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border border-blue-400/30 shadow-xl shadow-blue-900/30"
                  data-testid="button-enter-drivers"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Truck className="h-8 w-8" />
                    <span>Drivers</span>
                  </div>
                </Button>

                {/* Managers / Supervisors Button */}
                <Button
                  onClick={() => {
                    // Show PIN entry for managers/supervisors
                    setStep("manager-login");
                  }}
                  className="h-20 text-xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 border border-purple-400/30 shadow-xl shadow-purple-900/30"
                  data-testid="button-enter-managers"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="h-8 w-8" />
                    <span>Managers / Supervisors</span>
                  </div>
                </Button>
              </div>

            </motion.div>
          )}

          {/* --- DESKTOP: ORIGINAL PIN LOGIN CARD --- */}
          {step === "credentials" && !isMobile && (
            <motion.div
              key="pin-login-desktop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto -mt-[60px]"
            >
              {/* Tutorial Guide Button - Above login card */}
              <div className="mb-4 flex justify-center">
                <PageWorkflowGuide />
              </div>
              <Card className="card-premium border-indigo-500/30 backdrop-blur-xl shadow-2xl glow-purple">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl text-white text-center text-gradient-blue">Team Login</CardTitle>
                  <CardDescription className="text-center text-slate-300">
                    Enter your personal PIN to access the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePinLogin} className="space-y-6">
                    {!demoMode && pinSubmitted && (
                      <div className="space-y-2">
                        <Label htmlFor="dailyCode" className="text-slate-300 text-sm flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-yellow-400" />
                          Daily Access Code
                        </Label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500" />
                          <Input 
                            id="dailyCode"
                            type="text"
                            inputMode="numeric"
                            placeholder="6-digit code" 
                            className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-yellow-500 h-14 text-2xl tracking-widest text-center font-bold"
                            value={dailyCode}
                            onChange={(e) => setDailyCode(e.target.value)}
                            autoFocus
                            maxLength={6}
                            autoComplete="off"
                            data-testid="input-daily-code"
                          />
                        </div>
                        <p className="text-xs text-slate-500 text-center">
                          Announced at pre-shift meeting
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="pin" className="text-slate-300 text-sm">Your PIN</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input 
                          id="pin"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter PIN" 
                          className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 h-14 text-2xl tracking-widest text-center font-bold"
                          value={pin}
                          onChange={(e) => {
                            setPin(e.target.value);
                            setPinSubmitted(false);
                          }}
                          autoFocus={demoMode}
                          maxLength={10}
                          autoComplete="off"
                          data-testid="input-pin"
                        />
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Use the last 4 digits of your phone number
                      </p>
                    </div>

                    {/* Shift Code for Drivers (2FA) */}
                    <div className="space-y-2">
                      <Label htmlFor="shiftCode" className="text-slate-300 text-sm">
                        Shift Code <span className="text-slate-500">(Drivers only)</span>
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input 
                          id="shiftCode"
                          type="text"
                          inputMode="numeric"
                          placeholder="6-digit code" 
                          className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-green-500 h-12 text-xl tracking-widest text-center font-bold"
                          value={shiftCode}
                          onChange={(e) => setShiftCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          autoComplete="off"
                          data-testid="input-shift-code"
                        />
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Supervisors & Managers login with PIN only
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 font-bold text-lg text-white btn-premium transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading || !pin}
                      data-testid="button-login"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Login <ChevronRight className="h-5 w-5" />
                        </span>
                      )}
                    </Button>

                    {/* Try Demo Button - Public Mode Only */}
                    {isPublic && (
                      <div className="pt-4 border-t border-slate-700/50">
                        <p className="text-center text-slate-400 text-sm mb-3">
                          No account? Try it free!
                        </p>
                        <Button 
                          type="button"
                          onClick={() => setShowDemoRoleDialog(true)}
                          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
                          data-testid="button-try-demo"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Try Demo - No Sign Up Required
                          </span>
                        </Button>
                        <p className="text-center text-slate-500 text-xs mt-2">
                          30-minute session • Full feature access • No credit card
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* --- MANAGER/SUPERVISOR PIN LOGIN --- */}
          {step === "manager-login" && (
            <motion.div
              key="manager-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto -mt-[100px]"
            >
              <Card className="card-premium border-purple-500/30 backdrop-blur-xl shadow-2xl glow-purple">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl text-white text-center">Manager / Supervisor Login</CardTitle>
                  <CardDescription className="text-center text-slate-300">
                    Enter your 4-digit PIN to access your sandbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      if (pin.length >= 4) {
                        // Sandbox mode - go directly to supervisor sandbox
                        localStorage.setItem('vanops_sandbox_mode', 'true');
                        localStorage.setItem('vanops_entry_type', 'supervisor');
                        localStorage.setItem('vanops_manager_pin', pin);
                        setLocation('/supervisor-sandbox');
                      }
                    }} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="manager-pin" className="text-slate-300 text-sm">Your PIN</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input 
                          id="manager-pin"
                          type="text"
                          inputMode="numeric"
                          placeholder="4-digit PIN" 
                          className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-purple-500 h-14 text-2xl tracking-widest text-center font-bold"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          autoFocus
                          maxLength={4}
                          autoComplete="off"
                          data-testid="input-manager-pin"
                        />
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Last 4 digits of your phone number
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700"
                      disabled={pin.length < 4}
                      data-testid="button-manager-login"
                    >
                      <span className="flex items-center gap-2">
                        Enter Sandbox <ChevronRight className="h-5 w-5" />
                      </span>
                    </Button>

                    {/* Back Button */}
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("credentials");
                        setPin("");
                      }}
                      className="w-full text-slate-400 hover:text-white"
                      data-testid="button-back-to-landing"
                    >
                      Back to Landing
                    </Button>

                    {/* Forgot PIN Link */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotPinDialog(true)}
                        className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2"
                        data-testid="link-forgot-pin"
                      >
                        Forgot your PIN?
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* --- REGISTRATION (NEW USER) --- */}
          {step === "registration" && (
            <motion.div
              key="registration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <Card className="card-premium card-premium-green backdrop-blur-xl shadow-2xl glow-green">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl text-white text-center text-gradient-green">Welcome!</CardTitle>
                  <CardDescription className="text-center text-slate-300">
                    We don't recognize this PIN. Let's get you set up.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-6">
                    {/* Role Info (from universal PIN) */}
                    {detectedRole && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-xs text-green-400 font-semibold">
                          Role Auto-Detected: <span className="capitalize">{detectedRole.replace(/_/g, " ")}</span>
                        </p>
                      </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300 text-sm">What's your name?</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input 
                          id="name"
                          placeholder="e.g. Jason Smith" 
                          className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-green-500 h-12"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoFocus
                          data-testid="input-name"
                        />
                      </div>
                    </div>

                    {/* Personal PIN Input */}
                    <div className="space-y-2">
                      <Label htmlFor="personal-pin" className="text-slate-300 text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Create Your Personal PIN (4 digits)
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input 
                          id="personal-pin"
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="e.g. 5678" 
                          className="pl-12 bg-slate-800/50 border-slate-700 text-white focus:border-green-500 h-12 text-2xl tracking-widest text-center font-bold"
                          value={personalPin}
                          onChange={(e) => setPersonalPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          data-testid="input-personal-pin"
                        />
                      </div>
                      <p className="text-xs text-slate-400">You'll use this PIN to log in after setup</p>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="space-y-3 p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Camera className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <Label className="text-purple-300 font-bold text-sm">Add Your Selfie! 📸</Label>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            We're building a fun Easter egg game with random driver faces and sarcastic comments to make the night go faster! 
                            Your photo will also show up as your avatar in the messaging system so everyone knows who's texting.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {photoPreview && (
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                            data-testid="img-photo-preview"
                          />
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            data-testid="input-photo-upload"
                          />
                          <label htmlFor="photo-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                              onClick={() => document.getElementById('photo-upload')?.click()}
                              data-testid="button-upload-photo"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              {photoPreview ? "Change Photo" : "Upload Selfie"}
                            </Button>
                          </label>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 text-center">
                        Optional but recommended! Make a funny face 🤪
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 btn-premium btn-premium-green text-white font-bold transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading || !username || !personalPin || !/^\d{4}$/.test(personalPin)}
                      data-testid="button-register"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>

                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full text-slate-400 hover:text-white"
                      onClick={() => {
                        setStep("credentials");
                        setPin("");
                        setUsername("");
                        setSelectedRole("");
                      }}
                      data-testid="button-back-to-login"
                    >
                      Back to Login
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* --- ROLE SELECTION (DRIVER) --- */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl text-white text-center">Welcome, {username}</CardTitle>
                  <CardDescription className="text-center text-slate-400">
                    Select your department to clock in
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:scale-[1.02] transition-all group text-left"
                    >
                      <div className={`p-3 rounded-lg ${role.color} text-white shadow-lg`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{role.title}</h3>
                        <p className="text-xs text-slate-400">{role.desc}</p>
                      </div>
                      <ChevronRight className="ml-auto h-5 w-5 text-slate-600 group-hover:text-white" />
                    </button>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    className="mt-2 text-slate-500 hover:text-white"
                    onClick={() => {
                        setStep("credentials");
                        setPin("");
                        setUsername("");
                    }}
                    data-testid="button-back"
                  >
                    Back to Login
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 text-center space-y-3">
          <button
            onClick={() => setLocation("/about")}
            className="text-sm text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
            data-testid="link-about"
          >
            About Lot Ops Pro →
          </button>
          <div className="space-y-2">
            <p className="text-[10px] text-slate-600">
              Protected by Enterprise Grade Security • {APP_VERSION.full}
            </p>
            {step === "credentials" && (
              <button
                onClick={() => {
                  const devCode = import.meta.env.VITE_DEVELOPER_CODE;
                  if (devCode) {
                    const devUser = {
                      id: 1,
                      pin: devCode,
                      name: "Developer",
                      role: "developer",
                      isDemo: false,
                    };
                    localStorage.setItem("vanops_user", JSON.stringify(devUser));
                    localStorage.setItem("vanops_pin", devCode);
                    toast({ title: "Developer Access Granted", description: "Welcome to the Developer Dashboard" });
                    setLocation("/developer");
                  } else {
                    toast({ title: "Access Denied", description: "Developer code not configured", variant: "destructive" });
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1 mx-auto"
                data-testid="button-developer-access"
              >
                <LayoutDashboard className="h-3 w-3" />
                Developer Login
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Demo Mode Role Selection Dialog */}
      <Dialog open={showDemoRoleDialog} onOpenChange={(open) => {
        setShowDemoRoleDialog(open);
        if (!open) {
          setDemoMode(false);
          setDemoRole("");
        }
      }}>
        <DialogContent className="bg-slate-900 border-rose-400 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Demo Mode - Select Role
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose which position you want to practice with.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <button
              onClick={() => setDemoRole("driver")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                demoRole === "driver" 
                  ? "border-blue-500 bg-blue-500/20" 
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-bold text-white">Van Driver</div>
                  <div className="text-xs text-slate-400">Vehicle routing & crew management</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setDemoRole("inventory")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                demoRole === "inventory" 
                  ? "border-green-500 bg-green-500/20" 
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-bold text-white">Inventory Driver</div>
                  <div className="text-xs text-slate-400">Scanner & ticket processing (no equipment checkout)</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setDemoRole("supervisor")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                demoRole === "supervisor" 
                  ? "border-purple-500 bg-purple-500/20" 
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="font-bold text-white">Supervisor</div>
                  <div className="text-xs text-slate-400">Resource allocation & crew oversight</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setDemoRole("operations_manager")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                demoRole === "operations_manager" 
                  ? "border-rose-400 bg-rose-400/20" 
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-rose-400" />
                <div>
                  <div className="font-bold text-white">Operations Manager</div>
                  <div className="text-xs text-slate-400">Full system control & oversight</div>
                </div>
              </div>
            </button>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDemoRoleDialog(false);
                setDemoMode(false);
                setDemoRole("");
              }}
              className="border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={startDemoMode}
              disabled={!demoRole}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
            >
              Start Demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot PIN Dialog */}
      <Dialog open={showForgotPinDialog} onOpenChange={setShowForgotPinDialog}>
        <DialogContent className="bg-slate-900 border-purple-500/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2 text-xl">
              <HelpCircle className="h-6 w-6" />
              Forgot Your PIN?
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              No problem - here's how to reset it
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Your Supervisor
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                Your supervisor or operations manager can reset your PIN from their dashboard.
              </p>
              <ol className="text-sm text-slate-400 space-y-2 ml-4 list-decimal">
                <li>Find your supervisor or operations manager</li>
                <li>Ask them to reset your PIN</li>
                <li>They'll give you a temporary PIN</li>
                <li>You'll be asked to set a new PIN on your next login</li>
              </ol>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-400" />
                Need More Help?
              </h3>
              <p className="text-sm text-slate-400">
                If your supervisor isn't available, contact the system administrator for assistance.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowForgotPinDialog(false)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sarah Welcome & Instructions Modal */}
      <Dialog open={showSarahWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowSarahWelcome(false);
          setLocation("/operations-manager");
        }
      }}>
        <DialogContent className="bg-slate-900 border-amber-400 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-6 w-6" />
              Welcome, Sarah
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              You're now logged in as Operations Manager with full system access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Your Access Level
              </h3>
              <p className="text-sm text-slate-300">
                As an Operations Manager, you have full access to all system features including driver management, resource allocation, performance analytics, and administrative controls.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Key Features
              </h3>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• <strong>Operations Dashboard</strong> - Real-time system monitoring and metrics</li>
                <li>• <strong>Crew Manager</strong> - Manage drivers, assign vehicles, and track performance</li>
                <li>• <strong>Resource Allocation</strong> - Coordinate routes and resource distribution</li>
                <li>• <strong>Performance Reports</strong> - Access comprehensive analytics and employee reviews</li>
                <li>• <strong>Safety Incident Tracking</strong> - Monitor and respond to safety events</li>
                <li>• <strong>CRM System</strong> - Manage customer relationships and sales</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Quick Start
              </h3>
              <ol className="text-sm text-slate-300 space-y-1 ml-2">
                <li>1. Start in the <strong>Operations Dashboard</strong> to see live system status</li>
                <li>2. Use the <strong>Crew Manager</strong> to view and manage all drivers</li>
                <li>3. Check <strong>Performance Reports</strong> for analytics and insights</li>
                <li>4. Monitor <strong>Safety Incidents</strong> for any urgent matters</li>
              </ol>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Admin Controls
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                You have access to admin features for managing the system at an enterprise level. Use these carefully and responsibly.
              </p>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• Create and manage shift codes for driver access</li>
                <li>• View and manage all users and roles</li>
                <li>• Access complete audit trails of all operations</li>
                <li>• Configure system-wide settings and policies</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowSarahWelcome(false);
                setLocation("/operations-manager");
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 h-auto"
            >
              Begin Operations Manager Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connor Welcome & Instructions Modal */}
      <Dialog open={showConnorWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowConnorWelcome(false);
          setLocation("/operations-manager");
        }
      }}>
        <DialogContent className="bg-slate-900 border-cyan-400 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-6 w-6" />
              Welcome, Connor
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              You're now logged in as Operations Manager with full system access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Your Access Level
              </h3>
              <p className="text-sm text-slate-300">
                As an Operations Manager, you have full access to all system features including driver management, resource allocation, performance analytics, and administrative controls.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Key Features
              </h3>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• <strong>Operations Dashboard</strong> - Real-time system monitoring and metrics</li>
                <li>• <strong>Crew Manager</strong> - Manage drivers, assign vehicles, and track performance</li>
                <li>• <strong>Resource Allocation</strong> - Coordinate routes and resource distribution</li>
                <li>• <strong>Performance Reports</strong> - Access comprehensive analytics and employee reviews</li>
                <li>• <strong>Safety Incident Tracking</strong> - Monitor and respond to safety events</li>
                <li>• <strong>CRM System</strong> - Manage customer relationships and sales</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Quick Start
              </h3>
              <ol className="text-sm text-slate-300 space-y-1 ml-2">
                <li>1. Start in the <strong>Operations Dashboard</strong> to see live system status</li>
                <li>2. Use the <strong>Crew Manager</strong> to view and manage all drivers</li>
                <li>3. Check <strong>Performance Reports</strong> for analytics and insights</li>
                <li>4. Monitor <strong>Safety Incidents</strong> for any urgent matters</li>
              </ol>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Admin Controls
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                You have access to admin features for managing the system at an enterprise level. Use these carefully and responsibly.
              </p>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• Create and manage shift codes for driver access</li>
                <li>• View and manage all users and roles</li>
                <li>• Access complete audit trails of all operations</li>
                <li>• Configure system-wide settings and policies</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowConnorWelcome(false);
                setLocation("/operations-manager");
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2 h-auto"
            >
              Begin Operations Manager Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARIEL (SAFETY REP) WELCOME MODAL */}
      <Dialog open={showArielWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowArielWelcome(false);
          localStorage.setItem("vanops_install_shown", "true");
          setLocation("/safety-dashboard");
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-2xl">Welcome, Ariel! 🛡️</DialogTitle>
            <DialogDescription className="text-blue-200">Safety Representative Role</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-blue-100 max-h-96 overflow-y-auto text-sm">
            <div className="bg-blue-900/40 p-3 rounded border border-blue-400">
              <h3 className="font-bold text-blue-300 mb-2">Your Primary Role</h3>
              <p>Monitor all safety incidents, speed violations, and communicate safety reminders to drivers across the entire facility.</p>
            </div>
            <div className="bg-green-900/40 p-3 rounded border border-green-400">
              <h3 className="font-bold text-green-300 mb-2">Key Responsibilities</h3>
              <ul className="space-y-1 ml-2">
                <li>✓ Track and analyze incident reports</li>
                <li>✓ Send safety messages to drivers</li>
                <li>✓ Monitor speed violations in real-time</li>
                <li>✓ Manage safety training topics</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowArielWelcome(false);
              localStorage.setItem("vanops_install_shown", "true");
              setLocation("/safety-dashboard");
            }} className="bg-blue-600 hover:bg-blue-700">
              Go to Safety Dashboard →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kathy Welcome & Instructions Modal */}
      <Dialog open={showKathyWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowKathyWelcome(false);
          setLocation("/operations-manager");
        }
      }}>
        <DialogContent className="bg-slate-900 border-pink-400 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-pink-400 flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-6 w-6" />
              Welcome, Kathy
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              You're now logged in as Operations Manager with full system access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
              <h3 className="font-bold text-pink-400 mb-2 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Your Access Level
              </h3>
              <p className="text-sm text-slate-300">
                As an Operations Manager, you have full access to all system features including driver management, resource allocation, performance analytics, and administrative controls.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Key Features
              </h3>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• <strong>Operations Dashboard</strong> - Real-time system monitoring and metrics</li>
                <li>• <strong>Crew Manager</strong> - Manage drivers, assign vehicles, and track performance</li>
                <li>• <strong>Resource Allocation</strong> - Coordinate routes and resource distribution</li>
                <li>• <strong>Performance Reports</strong> - Access comprehensive analytics and employee reviews</li>
                <li>• <strong>Safety Incident Tracking</strong> - Monitor and respond to safety events</li>
                <li>• <strong>CRM System</strong> - Manage customer relationships and sales</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Quick Start
              </h3>
              <ol className="text-sm text-slate-300 space-y-1 ml-2">
                <li>1. Start in the <strong>Operations Dashboard</strong> to see live system status</li>
                <li>2. Use the <strong>Crew Manager</strong> to view and manage all drivers</li>
                <li>3. Check <strong>Performance Reports</strong> for analytics and insights</li>
                <li>4. Monitor <strong>Safety Incidents</strong> for any urgent matters</li>
              </ol>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Admin Controls
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                You have access to admin features for managing the system at an enterprise level. Use these carefully and responsibly.
              </p>
              <ul className="text-sm text-slate-300 space-y-1 ml-2">
                <li>• Create and manage shift codes for driver access</li>
                <li>• View and manage all users and roles</li>
                <li>• Access complete audit trails of all operations</li>
                <li>• Configure system-wide settings and policies</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowKathyWelcome(false);
                setLocation("/operations-manager");
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 h-auto"
            >
              Begin Operations Manager Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STACY (PIN 111) - BETA TESTER - VIEW-ONLY SANDBOX MODE */}
      <Dialog open={showStacyWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowStacyWelcome(false);
          setLocation("/developer");
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-500 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-3xl font-bold">
              🔍 Hi Stacy! Beta Tester Access
            </DialogTitle>
            <DialogDescription className="text-cyan-200 mt-2 text-base">
              Full Application View-Only Sandbox Mode - Testing & Workflow Review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm">
            {/* Main Message */}
            <div className="bg-cyan-500/20 border-2 border-cyan-400 rounded-lg p-4">
              <p className="text-cyan-100 leading-relaxed">
                You have viewing power across the entire application. You can access and view all dashboards from Operations Manager down to Inventory Driver to test workflows and review the system flow. However, you cannot edit anything or save real data.
              </p>
            </div>

            {/* FULL ACCESS - VIEW ONLY */}
            <div className="bg-blue-900/40 border-2 border-blue-400 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-3 text-base">👁️ Full View Access (All Dashboards)</h3>
              <div className="grid grid-cols-2 gap-2 text-blue-100 text-sm">
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Operations Manager</p>
                  <p className="text-xs text-blue-200">Full system overview</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Supervisors</p>
                  <p className="text-xs text-blue-200">Resource allocation</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Van Drivers</p>
                  <p className="text-xs text-blue-200">Crew & routing</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Inventory Drivers</p>
                  <p className="text-xs text-blue-200">Scanner & lookup</p>
                </div>
              </div>
            </div>

            {/* NO EDITING WARNING */}
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2 text-base flex items-center gap-2">
                🚫 VIEW-ONLY MODE - NO EDITING
              </h3>
              <div className="bg-red-950/70 p-3 rounded border border-red-500 text-red-100 space-y-2">
                <p><strong>✗ Cannot Save Data</strong></p>
                <p className="text-sm">All edits are disabled. You can view everything but cannot modify or save anything.</p>
                <p><strong>✗ No Real Numbers</strong></p>
                <p className="text-sm">All operations run in sandbox. No real data is saved to the database.</p>
                <p><strong>✗ No Database Changes</strong></p>
                <p className="text-sm">Complete read-only access across all dashboards and workflows.</p>
              </div>
            </div>

            {/* SANDBOX MODE ENFORCED */}
            <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2 text-base">⚠️ SANDBOX MODE ALWAYS ACTIVE</h3>
              <p className="text-yellow-100">
                You are always in sandbox mode. This is a strict protection - nothing you view or interact with saves to our real database. You can safely explore all workflows, dashboards, and features.
              </p>
            </div>

            {/* WORKFLOW TESTING */}
            <div className="bg-green-900/40 border-2 border-green-400 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2 text-base">✓ What You Can Do</h3>
              <ul className="space-y-1 text-green-100 ml-2">
                <li>✓ Browse all dashboards and roles</li>
                <li>✓ View complete workflows and user flows</li>
                <li>✓ Test navigation and page transitions</li>
                <li>✓ Review feature availability by role</li>
                <li>✓ Understand system architecture</li>
                <li>✓ Provide feedback on UX and workflow</li>
              </ul>
            </div>

            {/* CANNOT DO */}
            <div className="bg-slate-800/70 border-2 border-slate-600 rounded-lg p-4">
              <h3 className="font-bold text-slate-300 mb-2 text-base">✗ What You Cannot Do</h3>
              <ul className="space-y-1 text-slate-200 ml-2">
                <li>✗ Create new users or drivers</li>
                <li>✗ Save work orders or assignments</li>
                <li>✗ Log performance data</li>
                <li>✗ Create incidents or reports</li>
                <li>✗ Modify any system settings</li>
                <li>✗ Delete or edit existing data</li>
              </ul>
            </div>

            {/* INSTRUCTIONS */}
            <div className="bg-indigo-900/40 border-2 border-indigo-400 rounded-lg p-4">
              <h3 className="font-bold text-indigo-300 mb-2 text-base">📋 How to Navigate</h3>
              <ol className="space-y-2 text-indigo-100 ml-2">
                <li><strong>1.</strong> Click the button below to access Developer Dashboard</li>
                <li><strong>2.</strong> You'll have access to switch between all roles and dashboards</li>
                <li><strong>3.</strong> Explore workflows and user flows freely</li>
                <li><strong>4.</strong> All interactions are view-only and sandboxed</li>
                <li><strong>5.</strong> No data is saved at any point</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => {
                setShowStacyWelcome(false);
                setLocation("/developer");
              }}
              className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold px-8 py-3 h-auto text-base"
            >
              Begin Viewing Dashboard 🔍
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RON ANDREWS (PIN 777) - BETA TESTER - VIEW-ONLY SANDBOX MODE */}
      <Dialog open={showRonWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowRonWelcome(false);
          setLocation("/developer");
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-orange-950 to-slate-900 border-orange-500 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-orange-400 text-3xl font-bold">
              🔍 Hi Ron! Beta Tester Access
            </DialogTitle>
            <DialogDescription className="text-orange-200 mt-2 text-base">
              Full Application View-Only Sandbox Mode - Testing & Workflow Review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm">
            {/* Main Message */}
            <div className="bg-orange-500/20 border-2 border-orange-400 rounded-lg p-4">
              <p className="text-orange-100 leading-relaxed">
                You have viewing power across the entire application. You can access and view all dashboards from Operations Manager down to Inventory Driver to test workflows and review the system flow. However, you cannot edit anything or save real data.
              </p>
            </div>

            {/* FULL ACCESS - VIEW ONLY */}
            <div className="bg-blue-900/40 border-2 border-blue-400 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-3 text-base">👁️ Full View Access (All Dashboards)</h3>
              <div className="grid grid-cols-2 gap-2 text-blue-100 text-sm">
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Operations Manager</p>
                  <p className="text-xs text-blue-200">Full system overview</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Supervisors</p>
                  <p className="text-xs text-blue-200">Resource allocation</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Van Drivers</p>
                  <p className="text-xs text-blue-200">Crew & routing</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Inventory Drivers</p>
                  <p className="text-xs text-blue-200">Scanner & lookup</p>
                </div>
              </div>
            </div>

            {/* NO EDITING WARNING */}
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2 text-base flex items-center gap-2">
                🚫 VIEW-ONLY MODE - NO EDITING
              </h3>
              <div className="bg-red-950/70 p-3 rounded border border-red-500 text-red-100 space-y-2">
                <p><strong>✗ Cannot Save Data</strong></p>
                <p className="text-sm">All edits are disabled. You can view everything but cannot modify or save anything.</p>
                <p><strong>✗ No Real Numbers</strong></p>
                <p className="text-sm">All operations run in sandbox. No real data is saved to the database.</p>
                <p><strong>✗ No Database Changes</strong></p>
                <p className="text-sm">Complete read-only access across all dashboards and workflows.</p>
              </div>
            </div>

            {/* SANDBOX MODE ENFORCED */}
            <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2 text-base">⚠️ SANDBOX MODE ALWAYS ACTIVE</h3>
              <p className="text-yellow-100">
                You are always in sandbox mode. This is a strict protection - nothing you view or interact with saves to our real database. You can safely explore all workflows, dashboards, and features.
              </p>
            </div>

            {/* WORKFLOW TESTING */}
            <div className="bg-green-900/40 border-2 border-green-400 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2 text-base">✓ What You Can Do</h3>
              <ul className="space-y-1 text-green-100 ml-2">
                <li>✓ Browse all dashboards and roles</li>
                <li>✓ View complete workflows and user flows</li>
                <li>✓ Test navigation and page transitions</li>
                <li>✓ Review feature availability by role</li>
                <li>✓ Understand system architecture</li>
                <li>✓ Provide feedback on UX and workflow</li>
              </ul>
            </div>

            {/* CANNOT DO */}
            <div className="bg-slate-800/70 border-2 border-slate-600 rounded-lg p-4">
              <h3 className="font-bold text-slate-300 mb-2 text-base">✗ What You Cannot Do</h3>
              <ul className="space-y-1 text-slate-200 ml-2">
                <li>✗ Create new users or drivers</li>
                <li>✗ Save work orders or assignments</li>
                <li>✗ Log performance data</li>
                <li>✗ Create incidents or reports</li>
                <li>✗ Modify any system settings</li>
                <li>✗ Delete or edit existing data</li>
              </ul>
            </div>

            {/* INSTRUCTIONS */}
            <div className="bg-indigo-900/40 border-2 border-indigo-400 rounded-lg p-4">
              <h3 className="font-bold text-indigo-300 mb-2 text-base">📋 How to Navigate</h3>
              <ol className="space-y-2 text-indigo-100 ml-2">
                <li><strong>1.</strong> Click the button below to access Developer Dashboard</li>
                <li><strong>2.</strong> You'll have access to switch between all roles and dashboards</li>
                <li><strong>3.</strong> Explore workflows and user flows freely</li>
                <li><strong>4.</strong> All interactions are view-only and sandboxed</li>
                <li><strong>5.</strong> No data is saved at any point</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => {
                setShowRonWelcome(false);
                setLocation("/developer");
              }}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold px-8 py-3 h-auto text-base"
            >
              Begin Viewing Dashboard 🔍
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHRIS (PIN 888) - BETA TESTER - VIEW-ONLY SANDBOX MODE */}
      <Dialog open={showChrisWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowChrisWelcome(false);
          setLocation("/developer");
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-teal-950 to-slate-900 border-teal-500 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-teal-400 text-3xl font-bold">
              🔍 Hi Chris! Beta Tester Access
            </DialogTitle>
            <DialogDescription className="text-teal-200 mt-2 text-base">
              Full Application View-Only Sandbox Mode - Testing & Workflow Review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm">
            <div className="bg-teal-500/20 border-2 border-teal-400 rounded-lg p-4">
              <p className="text-teal-100 leading-relaxed">
                You have viewing power across the entire application. You can access and view all dashboards from Operations Manager down to Inventory Driver to test workflows and review the system flow. However, you cannot edit anything or save real data.
              </p>
            </div>

            <div className="bg-blue-900/40 border-2 border-blue-400 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-3 text-base">👁️ Full View Access (All Dashboards)</h3>
              <div className="grid grid-cols-2 gap-2 text-blue-100 text-sm">
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Operations Manager</p>
                  <p className="text-xs text-blue-200">Full system overview</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Supervisors</p>
                  <p className="text-xs text-blue-200">Resource allocation</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Van Drivers</p>
                  <p className="text-xs text-blue-200">Crew & routing</p>
                </div>
                <div className="bg-blue-950/70 p-2 rounded border border-blue-500">
                  <p className="font-bold text-blue-300">Inventory Drivers</p>
                  <p className="text-xs text-blue-200">Scanner & lookup</p>
                </div>
              </div>
            </div>

            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2 text-base flex items-center gap-2">
                🚫 VIEW-ONLY MODE - NO EDITING
              </h3>
              <p className="text-red-100">All edits are disabled. You can view everything but cannot modify or save anything.</p>
            </div>

            <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2 text-base">⚠️ SANDBOX MODE ALWAYS ACTIVE</h3>
              <p className="text-yellow-100">
                You are always in sandbox mode. Nothing you view or interact with saves to our real database.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => {
                setShowChrisWelcome(false);
                setLocation("/developer");
              }}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold px-8 py-3 h-auto text-base"
            >
              Begin Viewing Dashboard 🔍
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TERESA WELCOME & SANDBOX MODE INSTRUCTIONS MODAL */}
      <Dialog open={showTeresaWelcome} onOpenChange={(open) => {
        if (!open) {
          setShowTeresaWelcome(false);
          setLocation("/resource-allocation");
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-purple-950 to-slate-900 border-purple-500 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-3xl font-bold">
              👋 Hi Teresa!
            </DialogTitle>
            <DialogDescription className="text-purple-200 mt-2 text-base">
              Welcome to Lot Ops Pro - Instructions for Supervisor Setup
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm">
            {/* Main Message */}
            <div className="bg-purple-500/20 border-2 border-purple-400 rounded-lg p-4">
              <p className="text-purple-100 leading-relaxed">
                I wanted to make this as easy as possible for you to learn the system. This message will walk you through everything step-by-step. Please let me know if you have any questions or if anything doesn't seem logical. Your feedback helps me make this better! 💬
              </p>
            </div>

            {/* CRITICAL: SANDBOX MODE WARNING */}
            <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2 text-base flex items-center gap-2">
                ⚠️ CRITICAL: SANDBOX MODE REQUIRED
              </h3>
              <p className="text-yellow-100 mb-3">
                <strong>DO NOT skip this step!</strong> You MUST enable Sandbox Mode to practice and explore the system without affecting our live database.
              </p>
              <div className="bg-yellow-950/70 p-3 rounded border border-yellow-500 text-yellow-100">
                <p className="mb-2"><strong>When you enter the app:</strong></p>
                <ol className="space-y-1 ml-3">
                  <li>1. You'll see a <strong>toggle for "Sandbox Mode"</strong></li>
                  <li>2. <strong>TURN IT ON</strong> (switch to enabled)</li>
                  <li>3. Choose which role to practice with</li>
                  <li>4. Practice and explore freely - <strong>no data is saved</strong></li>
                </ol>
              </div>
            </div>

            {/* Why Sandbox? */}
            <div className="bg-blue-900/40 border-2 border-blue-400 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2 text-base">🛡️ Why Sandbox Mode?</h3>
              <ul className="space-y-2 text-blue-100">
                <li><strong>✓ Full Capabilities:</strong> You get complete access to all supervisor features</li>
                <li><strong>✓ No Data Saved:</strong> Nothing you do in sandbox is saved to the database</li>
                <li><strong>✓ Safe to Explore:</strong> Click anywhere, try everything without worry</li>
                <li><strong>✓ Protected Database:</strong> Our real data stays clean and accurate</li>
              </ul>
            </div>

            {/* STRICT GATE WARNING */}
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2 text-base flex items-center gap-2">
                🔒 LIVE DATA PROTECTION GATE
              </h3>
              <p className="text-red-100 mb-3">
                <strong>This is a STRICT protection.</strong> The system has multiple layers to keep bogus test data OUT of our live database:
              </p>
              <div className="bg-red-950/70 p-3 rounded border border-red-500 text-red-100 space-y-2">
                <p><strong>✗ NO SANDBOX → NO LIVE DATA ACCESS</strong></p>
                <p className="text-sm">Even as a Supervisor or Manager, you cannot save to live database without Sandbox Mode disabled AND a valid shift number.</p>
                <p><strong>✓ LIVE DATA = SHIFT NUMBER REQUIRED</strong></p>
                <p className="text-sm">Only drivers with an assigned shift code from an Operations Manager can access and save live data. Supervisors and Managers stay in Sandbox.</p>
              </div>
            </div>

            {/* Your Practice Environment */}
            <div className="bg-green-900/40 border-2 border-green-400 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2 text-base">🎮 Your Practice Environment</h3>
              <p className="text-green-100 mb-2">
                With Sandbox Mode enabled, you'll have:
              </p>
              <ul className="space-y-1 text-green-100 ml-2">
                <li>✓ Crew management and driver assignment</li>
                <li>✓ Live performance tracking</li>
                <li>✓ Resource allocation and routing</li>
                <li>✓ Chat and messaging system</li>
                <li>✓ All dashboards and analytics</li>
                <li>✓ <strong>BUT: No data is saved to database</strong></li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/70 border-2 border-slate-600 rounded-lg p-4">
              <h3 className="font-bold text-slate-300 mb-2 text-base">📋 Step-by-Step Instructions</h3>
              <ol className="space-y-2 text-slate-200 ml-2">
                <li><strong>Step 1:</strong> Click the button below to proceed</li>
                <li><strong>Step 2:</strong> Look for the Sandbox Mode toggle in the upper section</li>
                <li><strong>Step 3:</strong> Switch it ON (enabled/active)</li>
                <li><strong>Step 4:</strong> Select "Supervisor" role to practice</li>
                <li><strong>Step 5:</strong> Explore the dashboard - try everything!</li>
                <li><strong>Step 6:</strong> When you're ready for live operations, contact Jason to set up your shift number</li>
              </ol>
            </div>

            {/* Questions */}
            <div className="bg-indigo-900/40 border-2 border-indigo-400 rounded-lg p-4">
              <p className="text-indigo-100">
                <strong>Questions or Issues?</strong> Let me know what's confusing or doesn't make sense. I want this to be as straightforward and logical as possible for you.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => {
                setShowTeresaWelcome(false);
                setLocation("/resource-allocation");
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold px-8 py-3 h-auto text-base"
            >
              Got It! Let's Start 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Install Prompt for Drivers */}
      {showInstallPrompt && (
        <InstallPrompt
          phoneLastFour={pin}
          onDismiss={() => {
            localStorage.setItem("vanops_install_shown", "true");
            setShowInstallPrompt(false);
            setLocation("/crew-manager");
          }}
        />
      )}


      {/* Footer */}
      <Footer />
    </div>
  );
}
