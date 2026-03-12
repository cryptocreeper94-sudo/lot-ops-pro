import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumButton } from "@/components/ui/premium-button";
import { Scan, MapPin, Send, MessageSquare, Map, Calendar, Navigation, Camera, CheckCircle, AlertCircle, Edit3, Truck, LogOut, HelpCircle, Info, Layers, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { WeeklyMapViewer } from "@/components/WeeklyMapViewer";
import { ActiveWeekBanner } from "@/components/ActiveWeekBanner";
// WeatherWidget and NotesWidget moved to global components in App.tsx
import { SafetyButton } from "@/components/SafetyButton";
import { LotSpotReporter } from "@/components/LotSpotReporter";
import { LotAvailabilityBoard } from "@/components/LotAvailabilityBoard";
import { TripCounter } from "@/components/TripCounter";
import { AppSuggestionsWidget } from "@/components/AppSuggestionsWidget";
import { MediaPlayer } from "@/components/MediaPlayer";
import { EasterEggPopup } from "@/components/EasterEggPopup";
import { formatLaneForDriver, type DriverRole } from "@/utils/laneFormatter";
import { isCorrectWeek } from "@/utils/weekValidator";
import { shouldForceDemoMode } from "@/utils/geofencing";
import { Footer } from "@/components/Footer";
import { QuickHelpPanel } from "@/components/ui/help-tooltip";
import { SandboxModeIndicator } from "@/components/SandboxModeIndicator";
import { SandboxHelpButton } from "@/components/SandboxHelpButton";
import { HelpButton } from "@/components/HelpButton";
import { getActiveRole, getCanonicalRole, setActiveRole } from "@/utils/roleManager";
import { CameraPreviewModal } from "@/components/CameraPreviewModal";
import { FloatingEmblem, FloatingWatermark, useBackgroundRemoval } from "@/components/FloatingEmblem";
import LaneMapper, { findNearestLane, getDirectionToLocation } from "@/components/LaneMapper";
import Tesseract from "tesseract.js";

type TicketType = 'sale_lane' | 'work_order' | 'routing' | 'sold' | 'unknown';

interface ScanResult {
  ticketType: TicketType;
  vin?: string;
  workOrder?: string;
  
  // Sale Lane specific
  saleWeek?: string;
  saleLane?: string;
  saleSpot?: string;
  
  // Vehicle info
  year?: string;
  make?: string;
  model?: string;
  mileage?: string;
  dealer?: string;
  
  // Routing specific
  nextDestination?: string;
  currentLocation?: string;
  
  // SOLD status
  isSold?: boolean;
  
  // GPS
  driverLocation?: {
    lat: number;
    lng: number;
  };
  
  alreadyAtDestination?: boolean;
  needsAdditionalScan?: boolean;
  found: boolean;
}

export default function Scanner() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showWeeklyMap, setShowWeeklyMap] = useState(false);
  const [showArenaStaging, setShowArenaStaging] = useState(false);
  const [showSandboxGuide, setShowSandboxGuide] = useState(false);
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [showManualMoveDialog, setShowManualMoveDialog] = useState(false);
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userRole, setUserRole] = useState<'driver' | 'inventory'>(() => getActiveRole());
  const [isTemporaryEmployee, setIsTemporaryEmployee] = useState(false);
  const [confirmMoveDialog, setConfirmMoveDialog] = useState(false);
  const [pendingScan, setPendingScan] = useState<ScanResult | null>(null);
  const [showWrongWeekDialog, setShowWrongWeekDialog] = useState(false);
  const [wrongWeekData, setWrongWeekData] = useState<{result: ScanResult; message: string} | null>(null);
  const [processedScanResult, setProcessedScanResult] = useState<ScanResult | null>(null);
  const [showLaneMapper, setShowLaneMapper] = useState(false);
  const [nearestLane, setNearestLane] = useState<string | null>(null);
  const [manualMove, setManualMove] = useState({
    workOrder: "",
    vin: "",
    destination: "",
    reason: "",
    notes: ""
  });
  const [manualEntry, setManualEntry] = useState({
    workOrder: "",
    vin: "",
    dealerCode: "",
    year: "",
    make: "",
    model: "",
    mileage: "",
    saleWeek: "",
    saleLane: "",
    saleSpot: "",
    currentLocation: "",
    nextDestination: "",
    isSold: false
  });
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const geofenceCheckedRef = useRef(false); // Track if geofence was already checked this session

  // FETCH EMPLOYEE TYPE AT LOAD TO GATE VAN FEATURES FOR TEMP WORKERS
  useEffect(() => {
    const fetchEmployeeType = async () => {
      try {
        const userStr = localStorage.getItem("vanops_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.employeeType === "temporary") {
            setIsTemporaryEmployee(true);
          }
        }
      } catch (err) {
        console.error("Error checking employee type:", err);
      }
    };
    fetchEmployeeType();
  }, []);

  // Get user role from session/localStorage + Check demo expiry
  useEffect(() => {
    // Check if demo session has expired
    const demoExpiry = localStorage.getItem("vanops_demo_expiry");
    const isDemoMode = localStorage.getItem("vanops_demo_mode") === "true";
    
    if (isDemoMode && demoExpiry) {
      const expiryTime = parseInt(demoExpiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        // Session expired - clear and redirect
        localStorage.removeItem("vanops_user");
        localStorage.removeItem("vanops_demo_mode");
        localStorage.removeItem("vanops_demo_expiry");
        localStorage.removeItem("vanops_pin");
        
        toast({
          title: "Demo Session Expired",
          description: "Your 30-minute demo session has ended. Please log in again.",
          variant: "destructive",
          duration: 5000,
        });
        
        window.location.href = "/";
        return;
      }
    }
    
    // CRITICAL: Detect and clear invalid role overrides for non-drivers
    const canonicalRole = getCanonicalRole();
    const activeRole = getActiveRole();
    
    // If override exists but canonical role is not 'driver', clear the override
    if (canonicalRole !== 'driver' && activeRole !== canonicalRole) {
      console.warn('Clearing invalid role override for non-driver persona');
      localStorage.removeItem('vanops_active_role');
      setUserRole(canonicalRole);
    } else {
      // Update user role using roleManager (checks override first)
      setUserRole(activeRole);
    }
    
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsTemporaryEmployee(user.employeeType === "temporary");
      } catch (e) {
        setIsTemporaryEmployee(false);
      }
    }
  }, [toast]);

  // Handle role switching
  const handleRoleSwitch = () => {
    const canonicalRole = getCanonicalRole();
    
    if (userRole === 'inventory') {
      // Switch to van driver mode
      const success = setActiveRole('driver', navigate);
      if (success) {
        toast({
          title: "Switched to Van Driver Mode",
          description: "You are now in Van Driver mode. Navigating to Crew Manager...",
          duration: 3000,
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Role switching is only available for van drivers.",
          variant: "destructive",
        });
      }
    } else {
      // Switch to inventory mode
      const success = setActiveRole('inventory', navigate);
      if (success) {
        toast({
          title: "Switched to Inventory Mode",
          description: "You are now in Inventory Scanner mode.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Role switching is only available for van drivers.",
          variant: "destructive",
        });
      }
    }
  };

  // Onboarding Tutorial - Auto-show for first 5 logins (or always for sandbox mode)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    if (isDemoMode) {
      // Always show onboarding for sandbox mode first entry
      const demoSandboxShown = localStorage.getItem('sandbox_inventory_onboarding_shown');
      return !demoSandboxShown;
    }
    const loginCount = parseInt(localStorage.getItem('onboarding_inventory_count') || "0");
    return loginCount < 5;
  });

  // Mark onboarding as shown for sandbox
  useEffect(() => {
    if (showOnboarding) {
      const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
      if (isDemoMode && !localStorage.getItem('sandbox_inventory_onboarding_shown')) {
        // Will be set when onboarding closes
      }
    }
  }, [showOnboarding]);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show prompt if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPwaPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPwaPrompt(false);
    } else {
      // Show prompt after 2 seconds if not installed
      setTimeout(() => {
        if (!localStorage.getItem('pwa_prompt_dismissed')) {
          setShowPwaPrompt(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      // For iOS or if prompt not available
      toast({
        title: "Add to Home Screen",
        description: "Tap the Share button and select 'Add to Home Screen'",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPwaPrompt(false);
      toast({
        title: "✓ App Installed!",
        description: "Lot Ops Pro is now on your home screen.",
      });
    }
    
    setDeferredPrompt(null);
  };

  const dismissPwaPrompt = () => {
    setShowPwaPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Request GPS permission on load - CONTINUOUS TRACKING with watchPosition
  useEffect(() => {
    let watchId: number | null = null;
    
    if (navigator.geolocation) {
      // Use watchPosition for continuous GPS updates
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          setGpsPermission('granted');
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(loc);
          
          // GPS GEOFENCING - Only check once per session using ref
          if (!geofenceCheckedRef.current) {
            geofenceCheckedRef.current = true;
            const geofenceCheck = await shouldForceDemoMode();
            
            if (geofenceCheck.forceDemoMode) {
              // Auto-enable Demo Mode for users outside facility
              const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
              
              if (!isDemoMode) {
                localStorage.setItem('vanops_demo_mode', 'true');
                toast({
                  title: "Demo Mode Activated",
                  description: geofenceCheck.reason,
                  variant: "destructive",
                  duration: 15000,
                });
                
                // Reload to apply Demo Mode
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }
            } else {
              toast({
                title: "GPS Connected",
                description: "Location tracking active for routing.",
              });
            }
          }
        },
        (error) => {
          console.error('GPS error:', error);
          setGpsPermission('denied');
          
          // GPS denied = Force Demo Mode for safety
          const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
          if (!isDemoMode) {
            localStorage.setItem('vanops_demo_mode', 'true');
          }
          
          // Show prominent alert
          toast({
            title: "GPS Required - Demo Mode Active",
            description: "Please enable location access in your browser settings. Demo Mode only until GPS is enabled.",
            variant: "destructive",
            duration: 10000,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000 // Allow cached positions up to 5 seconds old
        }
      );
    }
    
    // Cleanup: stop watching position when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Update nearest lane whenever location changes
  useEffect(() => {
    if (currentLocation) {
      const nearest = findNearestLane(currentLocation.lat, currentLocation.lng);
      setNearestLane(nearest);
    }
  }, [currentLocation]);

  // Handle lane mapper close - refresh nearest lane after new lanes are saved
  const handleLaneMapperClose = () => {
    setShowLaneMapper(false);
    // Refresh nearest lane detection after mapping
    if (currentLocation) {
      const nearest = findNearestLane(currentLocation.lat, currentLocation.lng);
      setNearestLane(nearest);
    }
  };

  // OCR Processing handler (runs during capture, shows progress)
  // This does ALL processing: OCR + parseTicket() and stores the final ScanResult
  const handleOCRProcessing = async (imageData: string): Promise<void> => {
    setIsScanning(true);
    setProcessedScanResult(null); // Reset previous result
    
    try {
      const worker = await Tesseract.createWorker('eng');
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      
      // Store the text for display/debugging
      setScanInput(text);
      
      // Parse the ticket immediately and store the final result
      const result = parseTicket(text);
      setProcessedScanResult(result);
      
    } catch (error) {
      console.error('OCR processing error:', error);
      setProcessedScanResult(null);
      throw error;
    }
  };

  // Camera modal confirmation handler (runs after user confirms)
  // This ONLY uses pre-processed results from handleOCRProcessing
  const handleCameraOCR = async (imageData: string) => {
    try {
      // Use the pre-processed result from handleOCRProcessing
      const result = processedScanResult;
      
      if (!result || !result.found) {
        toast({
          title: "Scan Failed",
          description: "Could not read ticket. Try again with better lighting.",
          variant: "destructive"
        });
        // Don't close modal on failure - let user retry
        setIsScanning(false);
        return;
      }
      
      // WEEK VALIDATION - Block wrong week moves
      const weekCheck = isCorrectWeek(result.saleWeek);
      if (!weekCheck.isValid && result.saleWeek) {
        setWrongWeekData({ result, message: weekCheck.message });
        setShowWrongWeekDialog(true);
        setIsScanning(false);
        // Don't close modal yet - dialog will handle it
        return;
      }
      
      // ROLE-BASED SAVING LOGIC
      if (userRole === 'driver') {
        // VAN DRIVERS: Always save all scans automatically
        await saveMoveToDatabase(result);
        setScanResult(result);
        showScanToast(result);
      } else {
        // INVENTORY DRIVERS: Show info only, ask if they want to save
        setPendingScan(result);
        setScanResult(result);
        setConfirmMoveDialog(true);
        showScanToast(result);
      }
      
      // Close modal AFTER all state updates complete
      setShowCameraPreview(false);
      
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "Scan Error",
        description: "OCR processing failed. Please retry or use manual entry.",
        variant: "destructive"
      });
      // Don't close modal on error - let user retry
    } finally {
      setIsScanning(false);
    }
  };

  const parseTicket = (text: string): ScanResult => {
    const cleanText = text.replace(/,/g, '');
    const upperText = text.toUpperCase();
    
    let result: ScanResult = {
      ticketType: 'unknown',
      found: false,
      driverLocation: currentLocation || undefined
    };
    
    // PRIORITY 1: Check for BIG "S" (SOLD marker)
    // Look for standalone "S" that's likely handwritten (not part of other words)
    const soldMatch = text.match(/\b[S5]\b/i) || 
                     text.match(/^[S5]$/m) ||
                     upperText.includes('SOLD');
    
    if (soldMatch) {
      result.isSold = true;
      result.ticketType = 'sold';
      result.nextDestination = 'SOLD - Lots 801-805';
      result.found = true;
    }
    
    // Extract VIN (17 characters)
    const vinMatch = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
    if (vinMatch) {
      result.vin = vinMatch[1].toUpperCase();
      result.found = true;
    }
    
    // Extract Work Order (7+ digits)
    const workOrderMatch = text.match(/\b(\d{7,8})\b/);
    if (workOrderMatch) {
      result.workOrder = workOrderMatch[1];
    }
    
    // Extract Dealer (3-4 uppercase letters)
    const dealerMatch = text.match(/\b([A-Z]{3,4})\b/);
    if (dealerMatch && dealerMatch[1] !== 'SOLD') {
      result.dealer = dealerMatch[1];
    }
    
    // Extract Year
    const yearMatch = cleanText.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      result.year = yearMatch[0];
    }
    
    // Extract Make/Model
    const makeModelMatch = text.match(/(NISSAN|TOYOTA|HONDA|FORD|CHEVY|BMW|MERCEDES|AUDI|VW|KIA|HYUNDAI|MAZDA|SUBARU|LEXUS)\s+([A-Z0-9\s]+?)(?=\s+(?:FWD|AWD|4WD|RWD|VIN|$))/i);
    if (makeModelMatch) {
      result.make = makeModelMatch[1];
      result.model = makeModelMatch[2].trim();
    }
    
    // If SOLD, we're done - skip other parsing
    if (result.isSold) {
      return result;
    }
    
    // Check for Sale Lane format first
    const saleWeekMatch = text.match(/Sale\s+\d{4}\s+(\d{1,2})/i);
    const laneSpotMatch = text.match(/(\d{1,2}):(\d{1,3})/);
    
    if (saleWeekMatch || laneSpotMatch) {
      result.ticketType = 'sale_lane';
      result.saleWeek = saleWeekMatch ? saleWeekMatch[1] : undefined;
      result.saleLane = laneSpotMatch ? laneSpotMatch[1] : undefined;
      result.saleSpot = laneSpotMatch ? laneSpotMatch[2] : undefined;
      result.found = true;
      
      // Extract mileage for sale tickets
      const mileageMatch = cleanText.match(/\b(\d{1,3})\s*(\d{3})\b/);
      if (mileageMatch) {
        result.mileage = `${mileageMatch[1]}${mileageMatch[2]}`;
      }
      
      return result;
    }
    
    // Check for Routing Codes - Smart routing with minimal info
    const routingCodes: Record<string, string> = {
      'DTL': 'Detail',
      'DETL': 'Detail',
      'DETAIL': 'Detail',
      'DSC': 'Disclosure (Lot 257)',
      'DISC': 'Disclosure (Lot 257)',
      'REG': 'Registration (Lot 227)',
      'CERT': 'Certification (Lot 255)',
      'CERTIFICATION': 'Certification (Lot 255)',
      'INV': 'Inventory',
      'INVENTORY': 'Inventory',
      'VIP': 'VIP Lot',
      'LANE': 'Sale Lane'
    };
    
    // Look for any routing code
    for (const [code, destination] of Object.entries(routingCodes)) {
      if (upperText.includes(code)) {
        result.ticketType = 'routing';
        result.nextDestination = destination;
        result.found = true;
        result.alreadyAtDestination = false;
        return result;
      }
    }
    
    // Work Order Ticket (most common - 95% of scans)
    if (result.workOrder) {
      result.ticketType = 'work_order';
      result.found = true;
      
      // Try to find destination on work order
      if (laneSpotMatch) {
        // Has lane:spot on work order
        result.saleLane = laneSpotMatch[1];
        result.saleSpot = laneSpotMatch[2];
      } else {
        // No destination found - default to inventory
        result.nextDestination = 'Inventory';
        result.needsAdditionalScan = false;
      }
    }
    
    return result;
  };

  const handleManualEntry = () => {
    // Build scan result from manual entry
    const result: ScanResult = {
      found: true,
      ticketType: manualEntry.saleLane ? 'sale_lane' : 'work_order',
      workOrder: manualEntry.workOrder || undefined,
      vin: manualEntry.vin || undefined,
      dealer: manualEntry.dealerCode || undefined,
      year: manualEntry.year || undefined,
      make: manualEntry.make || undefined,
      model: manualEntry.model || undefined,
      mileage: manualEntry.mileage || undefined,
      saleWeek: manualEntry.saleWeek || undefined,
      saleLane: manualEntry.saleLane || undefined,
      saleSpot: manualEntry.saleSpot || undefined,
      currentLocation: manualEntry.currentLocation || undefined,
      nextDestination: manualEntry.nextDestination || (manualEntry.isSold ? 'SOLD - Lots 801-805' : undefined),
      isSold: manualEntry.isSold,
      driverLocation: currentLocation || undefined
    };

    setScanResult(result);
    setShowManualEntryDialog(false);
    
    toast({
      title: "✓ Manual Entry Saved",
      description: manualEntry.isSold ? "SOLD vehicle recorded" : "Vehicle info recorded",
    });

    // Reset form
    setManualEntry({
      workOrder: "",
      vin: "",
      dealerCode: "",
      year: "",
      make: "",
      model: "",
      mileage: "",
      saleWeek: "",
      saleLane: "",
      saleSpot: "",
      currentLocation: "",
      nextDestination: "",
      isSold: false
    });
  };

  const handleManualMove = async () => {
    if (!manualMove.destination || !manualMove.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination and reason.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Log manual move to database - ALWAYS SAVE (user explicitly filled form)
      await fetch('/api/moves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: manualMove.vin || 'MANUAL',
          driverNumber: userRole === 'driver' ? 'van-driver' : 'inventory',
          fromLocation: 'manual-entry',
          toLocation: manualMove.destination,
          moveType: 'manual',
          gpsLatitude: currentLocation?.lat?.toString(),
          gpsLongitude: currentLocation?.lng?.toString(),
        })
      });

      toast({
        title: "Manual Move Recorded",
        description: `${manualMove.workOrder || manualMove.vin || 'Vehicle'} → ${manualMove.destination}`,
      });

      // Reset form
      setManualMove({
        workOrder: "",
        vin: "",
        destination: "",
        reason: "",
        notes: ""
      });
      setShowManualMoveDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record manual move.",
        variant: "destructive"
      });
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setIsScanning(true);
    
    // Simulate OCR processing delay
    setTimeout(async () => {
      const result = parseTicket(scanInput);
      
      if (!result.found) {
        toast({
          title: "Scan Failed",
          description: "Could not read ticket information. Try again.",
          variant: "destructive"
        });
        setIsScanning(false);
        return;
      }

      // WEEK VALIDATION - Block wrong week moves
      const weekCheck = isCorrectWeek(result.saleWeek);
      if (!weekCheck.isValid && result.saleWeek) {
        setWrongWeekData({ result, message: weekCheck.message });
        setShowWrongWeekDialog(true);
        setIsScanning(false);
        return; // Block the scan
      }

      // ROLE-BASED SAVING LOGIC
      if (userRole === 'driver') {
        // VAN DRIVERS: Always save all scans automatically
        await saveMoveToDatabase(result);
        setScanResult(result);
        showScanToast(result);
      } else {
        // INVENTORY DRIVERS: Show info only, ask if they want to save
        setPendingScan(result);
        setScanResult(result);
        setConfirmMoveDialog(true);
        showScanToast(result);
      }
      
      setIsScanning(false);
    }, 800);
  };

  const showScanToast = (result: ScanResult) => {
    const driverRole: DriverRole = userRole;
    
    if (result.isSold) {
      toast({ 
        title: "⚠️ SOLD VEHICLE", 
        description: "Route to SOLD Lots 801-805",
        variant: "default"
      });
    } else if (result.ticketType === 'sale_lane' && result.saleLane && result.saleSpot) {
      const formattedLane = formatLaneForDriver(`Lane ${result.saleLane}`, driverRole);
      toast({ 
        title: "Sale Lane Ticket", 
        description: `Destination: ${formattedLane}, Spot ${result.saleSpot}` 
      });
    } else if (result.ticketType === 'routing' && result.nextDestination) {
      const formattedDest = formatLaneForDriver(result.nextDestination, driverRole);
      if (result.alreadyAtDestination) {
        toast({ 
          title: "Already at Destination", 
          description: `Vehicle is already at ${formattedDest}`,
          variant: "default"
        });
      } else {
        toast({ 
          title: "Routing Ticket", 
          description: `Next: ${formattedDest}` 
        });
      }
    } else if (result.ticketType === 'work_order') {
      if (result.saleLane) {
        const formattedLane = formatLaneForDriver(`Lane ${result.saleLane}`, driverRole);
        toast({ 
          title: "Work Order Scanned", 
          description: `${formattedLane}, Spot ${result.saleSpot}`
        });
      } else if (result.nextDestination) {
        const formattedDest = formatLaneForDriver(result.nextDestination, driverRole);
        toast({ 
          title: "Work Order Scanned", 
          description: formattedDest
        });
      } else {
        // No routing found - fallback message
        toast({ 
          title: "Scan Complete - No Routing", 
          description: "Look for Sale Lane sticker on window",
          variant: "default"
        });
      }
    } else {
      // Unknown ticket type or no routing - show fallback
      toast({ 
        title: "Scan Complete", 
        description: "Look for Sale Lane sticker on window",
        variant: "default"
      });
    }
  };

  const saveMoveToDatabase = async (scan: ScanResult) => {
    try {
      const userStr = localStorage.getItem("vanops_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const driverName = user?.name || `Driver ${user?.driverNumber}`;
      
      // Save the move
      const toLocation = scan.nextDestination || scan.saleLane || 'unknown';
      await fetch('/api/moves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: scan.vin || 'UNKNOWN',
          driverNumber: userRole === 'driver' ? 'van-driver' : 'inventory',
          fromLocation: scan.currentLocation,
          toLocation,
          moveType: 'bulk',
          gpsLatitude: currentLocation?.lat?.toString(),
          gpsLongitude: currentLocation?.lng?.toString(),
        })
      });

      // EXOTIC CAR KEY TRACKING - Auto-detect moves to Lot 180 or 190
      const isExoticLot = toLocation.includes('180') || toLocation.includes('190');
      if (isExoticLot && scan.workOrder) {
        try {
          // Get supervisor's key delivery preference
          const keyDeliveryPreference = localStorage.getItem('exoticKeyDeliveryPreference') || 'clean_side_desk';
          
          // Create exotic key tracking entry
          await fetch('/api/exotic-key-tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workOrder: scan.workOrder,
              vin: scan.vin || null,
              lotNumber: toLocation.includes('180') ? '180' : '190',
              assignedBy: 'Supervisor', // Will be updated when supervisor assignment system is built
              keyDeliveryLocation: keyDeliveryPreference,
              status: 'pending'
            })
          });

          // Send automatic message to supervisor
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromId: user?.driverNumber || 'system',
              fromName: driverName,
              fromRole: userRole,
              toId: 'supervisor',
              toRole: 'supervisor',
              content: `🔑 EXOTIC DELIVERED: Work Order ${scan.workOrder} delivered to Lot ${toLocation.includes('180') ? '180' : '190'}. Driver taking key to ${keyDeliveryPreference === 'clean_side_desk' ? 'Clean Side Supervisor Desk' : 'Assigning Supervisor'}.`,
              isOfficial: true
            })
          });

          // Show exotic key alert to driver
          toast({
            title: "🔑 EXOTIC CAR - Key Security Protocol",
            description: `Work Order ${scan.workOrder} - Remove key and give to van driver`,
            duration: 8000,
            variant: "default"
          });
        } catch (error) {
          console.error('Failed to create exotic key tracking:', error);
        }
      }

      // AUTO-CAPTURE GPS WAYPOINT at destination (if GPS available)
      if (currentLocation && (scan.nextDestination || scan.saleLane)) {
        try {
          // Extract section/row/spot from scan result
          let section = '';
          let row = '';
          let spot = '';
          let locationType = 'inventory';
          
          // Sale lane destination (e.g., "Lane 43, Spot 185")
          if (scan.saleLane && scan.saleSpot) {
            section = scan.saleLane;
            spot = scan.saleSpot;
            locationType = 'sale_lane';
          } 
          // Inventory destination (e.g., "Section 515")
          else if (scan.nextDestination) {
            const sectionMatch = scan.nextDestination.match(/(\d{3})/);
            if (sectionMatch) {
              section = sectionMatch[1];
            }
          }
          
          // Only save if we have a valid section
          if (section) {
            await fetch('/api/gps-waypoints', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                section,
                row: row || undefined,
                spot: spot || undefined,
                latitude: currentLocation.lat.toString(),
                longitude: currentLocation.lng.toString(),
                capturedBy: driverName,
                workOrder: scan.workOrder || undefined,
                locationType,
              })
            });
          }
        } catch (gpsError) {
          console.error('Failed to save GPS waypoint:', gpsError);
          // Don't show error to user - move was still saved successfully
        }
      }

      // AUTO-CHECK: If this work order matches any assignment list item, mark it complete
      if (scan.workOrder && userRole === 'driver') {
        try {
          // Check all work orders for this driver
          const ordersRes = await fetch(`/api/work-orders?assignedTo=${encodeURIComponent(driverName)}`);
          if (ordersRes.ok) {
            const orders = await ordersRes.json();
            
            // For each order, check if any items match this work order number
            for (const order of orders) {
              const itemsRes = await fetch(`/api/work-orders/${order.id}/items`);
              if (itemsRes.ok) {
                const items = await itemsRes.json();
                const matchingItem = items.find((item: any) => 
                  item.vin === scan.workOrder && item.status === 'pending'
                );
                
                if (matchingItem) {
                  // Auto-complete this item
                  await fetch(`/api/work-order-items/${matchingItem.id}/complete`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completedBy: driverName }),
                  });
                  
                  toast({
                    title: "✓ Assignment Complete",
                    description: `Work Order ${scan.workOrder} checked off your list`,
                    duration: 2000,
                  });
                  break; // Only check off one item
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to auto-check assignment:', error);
          // Don't show error to user - move was still saved successfully
        }
      }
    } catch (error) {
      console.error('Failed to save move:', error);
    }
  };

  const handleConfirmMove = async () => {
    if (pendingScan) {
      await saveMoveToDatabase(pendingScan);
      toast({
        title: "Move Saved",
        description: "Vehicle move has been logged to database",
      });
    }
    setConfirmMoveDialog(false);
    setPendingScan(null);
  };

  const handleCancelMove = () => {
    setConfirmMoveDialog(false);
    setPendingScan(null);
    toast({
      title: "Info Only",
      description: "Scan not saved - just for reference",
    });
  };

  const handleGetDirections = () => {
    if (!scanResult) return;
    
    if (gpsPermission !== 'granted') {
      toast({
        title: "Location Required",
        description: "Please enable location services to get directions.",
        variant: "destructive"
      });
      return;
    }

    let destination = "";
    if (scanResult.isSold) {
      destination = "SOLD Lots 801-805";
    } else if (scanResult.saleLane && scanResult.saleSpot) {
      destination = `Lane ${scanResult.saleLane}, Spot ${scanResult.saleSpot}`;
    } else if (scanResult.nextDestination) {
      destination = scanResult.nextDestination;
    }

    toast({
      title: "Routing Active",
      description: `Navigating to ${destination}`,
    });
  };

  return (
    <div className="min-h-screen dashboard-premium p-2 scrollbar-premium">
      <NavigationControl variant="back" fallbackRoute="/mode-selection" />
      {/* Sandbox Indicator */}
      {localStorage.getItem("vanops_demo_mode") === "true" && (
        <div className="max-w-2xl mx-auto mb-2">
          <SandboxModeIndicator />
        </div>
      )}
      
      {/* Premium Header */}
      <div className="max-w-2xl mx-auto mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gradient-cyan">Scanner</h1>
            <p className="text-slate-400 text-xs">Scan tickets or enter VIN</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {getCanonicalRole() === 'driver' && (
              <PremiumButton 
                variant="glass"
                size="sm"
                onClick={handleRoleSwitch}
                className="text-cyan-400 border-cyan-600/50"
                icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
                data-testid="button-switch-role"
              >
                Van Mode
              </PremiumButton>
            )}
            {localStorage.getItem("vanops_demo_mode") === "true" && (
              <SandboxHelpButton role="driver" page="scanner" size="sm" />
            )}
            <PremiumButton 
              variant="glass"
              size="sm"
              className="text-purple-400 border-purple-600/50"
              onClick={() => setShowArenaStaging(true)}
              icon={<Layers className="h-3.5 w-3.5" />}
              data-testid="button-arena-staging"
            >
              Arena
            </PremiumButton>
            <PremiumButton 
              variant="glass"
              size="sm"
              onClick={() => setShowWeeklyMap(true)}
              icon={<Calendar className="h-3.5 w-3.5" />}
              data-testid="button-this-weeks-map"
            >
              Map
            </PremiumButton>
            <PremiumButton 
              variant="glass"
              size="sm"
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              data-testid="button-messages"
            >
              Msgs
            </PremiumButton>
            
            {!isTemporaryEmployee && (
              <PremiumButton 
                variant="glass"
                size="sm"
                onClick={() => setShowOnboarding(true)}
                className="text-blue-400 border-blue-600/50"
                icon={<HelpCircle className="h-3.5 w-3.5" />}
                data-testid="button-help"
              >
                Help
              </PremiumButton>
            )}
            
            <PremiumButton 
              variant="danger"
              size="sm"
              onClick={async () => {
                if (confirm("Log out from your shift?")) {
                  await fetch('/api/logout', { method: 'Post' });
                  window.location.href = '/';
                }
              }}
              icon={<LogOut className="h-3.5 w-3.5" />}
              data-testid="button-logout"
            >
              Out
            </PremiumButton>
          </div>
        </div>
        {/* Compact Status Row */}
        <div className="flex items-center gap-2 text-[10px]">
          <ActiveWeekBanner />
          
          {gpsPermission === 'granted' ? (
            <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-600/20 h-5 px-1.5 text-[9px]">
              <MapPin className="h-2.5 w-2.5 mr-0.5" />
              GPS
            </Badge>
          ) : gpsPermission === 'denied' ? (
            <Badge variant="outline" className="bg-red-900/20 text-red-500 border-red-600/20 h-5 px-1.5 text-[9px]">
              <MapPin className="h-2.5 w-2.5 mr-0.5" />
              No GPS
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-600/20 h-5 px-1.5 text-[9px]">
              <MapPin className="h-2.5 w-2.5 mr-0.5" />
              GPS...
            </Badge>
          )}
        </div>
        
        {/* Trip Counter - Compact */}
        <div className="max-w-2xl mx-auto -mt-1">
          <TripCounter driverNumber="inventory" isActive={true} />
        </div>
      </div>

      {/* Premium Bento Grid Layout */}
      <div className="max-w-2xl mx-auto">
        <BentoGrid columns={2} gap="md" className="mb-4">
          {/* Main Scanner Tile - Hero Size */}
          <BentoTile
            size="hero"
            variant="glow"
            sparkle={true}
            icon={<Scan className="h-5 w-5" />}
            title="Scan Ticket"
            description="📸 Camera scan • Or type Work Order #"
            data-testid="tile-scanner"
          >
            <div className="space-y-3 mt-2">
              {/* PRIMARY ACTION: Scan Button - Big and prominent */}
              <PremiumButton 
                variant="gradient"
                size="lg"
                className="w-full h-14"
                onClick={() => setShowCameraPreview(true)}
                loading={isScanning}
                icon={<Camera className="h-6 w-6" />}
                shine={true}
                data-testid="button-scan-camera"
              >
                {isScanning ? "Scanning..." : "Scan Now"}
              </PremiumButton>

              {/* SECONDARY: Manual input row */}
              <form onSubmit={handleScan} className="flex gap-2">
                <Input
                  placeholder="Type WO#..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-10 text-xs uppercase flex-1"
                  data-testid="input-scan"
                />
                <PremiumButton 
                  type="submit"
                  variant="glass"
                  size="md"
                  disabled={isScanning || !scanInput.trim()}
                  icon={<Scan className="h-4 w-4" />}
                  data-testid="button-manual-scan"
                >
                  Go
                </PremiumButton>
              </form>

              {/* WORKFLOW ROW: Left-to-right action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <PremiumButton 
                  variant="glass"
                  size="sm"
                  className="text-blue-400 border-blue-600/50"
                  onClick={() => setShowManualEntryDialog(true)}
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  data-testid="button-manual-entry"
                >
                  New Entry
                </PremiumButton>
                <PremiumButton 
                  variant="glass"
                  size="sm"
                  className="text-amber-400 border-amber-600/50"
                  onClick={() => setShowManualMoveDialog(true)}
                  icon={<Truck className="h-3.5 w-3.5" />}
                  data-testid="button-manual-move"
                >
                  Move
                </PremiumButton>
              </div>
            </div>
          </BentoTile>

          {/* Quick Help Tile */}
          <BentoTile
            size="md"
            variant="glass"
            icon={<HelpCircle className="h-4 w-4" />}
            title="Quick Guide"
            data-testid="tile-quick-guide"
          >
            <div className="space-y-1.5 text-[10px] text-slate-300">
              <p>📸 <span className="text-white">CAMERA:</span> Best for work orders</p>
              <p>⌨️ <span className="text-white">MANUAL:</span> Type WO# if camera fails</p>
              <p>✍️ <span className="text-white">NEW ENTRY:</span> Create records</p>
              <p>🚚 <span className="text-white">MOVE:</span> Log vehicle moves</p>
            </div>
          </BentoTile>

          {/* Scan Priority Tile */}
          <BentoTile
            size="md"
            variant="gradient"
            icon={<Info className="h-4 w-4" />}
            title="Scan Priority"
            data-testid="tile-scan-priority"
          >
            <div className="space-y-1 text-[10px]">
              <p className="text-red-400 font-semibold">🔴 Pink "S" = SOLD (801-805)</p>
              <p className="text-blue-300">📋 Work Order</p>
              <p className="text-green-300">🛣️ Sale Lane</p>
              <p className="text-amber-300">📍 Routing</p>
            </div>
          </BentoTile>
        </BentoGrid>

        {/* LOT AVAILABILITY - Color-coded inventory lot status */}
        <div className="mb-4">
          <LotAvailabilityBoard />
        </div>

        {/* GPS LANE MAPPER - For supervisors/managers to map lane coordinates */}
        <div className="max-w-2xl mx-auto mb-4">
          <PremiumButton
            variant="glass"
            size="sm"
            className="w-full text-cyan-400 border-cyan-600/50"
            onClick={() => setShowLaneMapper(true)}
            icon={<Navigation className="h-4 w-4" />}
            data-testid="button-open-lane-mapper"
          >
            GPS Lane Mapper - Mark Lane Locations
          </PremiumButton>
          {nearestLane && (
            <p className="text-center text-cyan-400 text-xs mt-2">
              <MapPin className="h-3 w-3 inline mr-1" />
              You are near: <span className="font-bold">{nearestLane}</span>
            </p>
          )}
        </div>

        {/* SCAN RESULT - Premium BentoTile */}
        {scanResult && scanResult.found && (
          <BentoTile
            size="wide"
            variant={scanResult.isSold ? "premium" : "glow"}
            sparkle={scanResult.isSold}
            className={`mb-4 ${scanResult.isSold ? 'border-red-500/50' : ''}`}
            data-testid="tile-scan-result"
          >
            {/* BIG DESTINATION DISPLAY - Most important info first */}
            {(() => {
              const hasDestination = scanResult.isSold || scanResult.saleLane || scanResult.nextDestination;
              const destinationText = scanResult.isSold 
                ? 'SOLD Lots 801-805' 
                : scanResult.saleLane 
                  ? `Lane ${scanResult.saleLane}, Spot ${scanResult.saleSpot}` 
                  : scanResult.nextDestination || null;
              
              return hasDestination ? (
                <div className={`p-4 rounded-xl mb-3 text-center ${
                  scanResult.isSold 
                    ? 'bg-red-900/40 border-2 border-red-500' 
                    : 'bg-green-900/40 border-2 border-green-500'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${scanResult.isSold ? 'text-red-300' : 'text-green-300'}`}>
                    {scanResult.isSold ? 'SOLD VEHICLE' : 'DESTINATION'}
                  </p>
                  <p className={`text-2xl font-bold ${scanResult.isSold ? 'text-red-400' : 'text-green-400'}`} data-testid="text-destination">
                    {destinationText}
                  </p>
                  {scanResult.saleWeek && (
                    <p className="text-white/70 text-sm mt-1">Week {scanResult.saleWeek}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl mb-3 text-center bg-amber-900/40 border-2 border-amber-500">
                  <p className="text-amber-300 text-xs font-medium mb-1">NO ROUTING FOUND</p>
                  <p className="text-amber-400 text-xl font-bold" data-testid="text-no-destination">
                    Look for Sale Lane Sticker
                  </p>
                  <p className="text-white/60 text-xs mt-2">
                    Check window for lane/spot sticker, or ask supervisor
                  </p>
                </div>
              );
            })()}
            
            {/* COMPACT HEADER */}
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className={`h-5 w-5 ${scanResult.isSold ? 'text-red-400' : 'text-primary'}`} />
              <h3 className="text-white text-base font-semibold">
                {scanResult.isSold ? 'SOLD Vehicle' : 'Scan Complete'}
              </h3>
              {scanResult.workOrder && (
                <span className="text-slate-500 text-xs font-mono ml-auto">#{scanResult.workOrder}</span>
              )}
            </div>
            
            {/* DIRECTIONAL ROUTING - Show direction and distance to destination */}
            {currentLocation && (scanResult.saleLane || scanResult.nextDestination) && (() => {
              const destName = scanResult.saleLane ? `Lane ${scanResult.saleLane}` : (scanResult.nextDestination || '');
              const routing = getDirectionToLocation(currentLocation.lat, currentLocation.lng, destName);
              if (routing && routing.found) {
                return (
                  <div className="p-3 rounded-xl mb-3 bg-purple-900/40 border-2 border-purple-500" data-testid="routing-directions">
                    <div className="flex items-center justify-center gap-3">
                      <Navigation className="h-6 w-6 text-purple-400" />
                      <div className="text-center">
                        <p className="text-purple-300 text-xs font-medium">HEAD</p>
                        <p className="text-purple-400 text-xl font-bold">{routing.direction}</p>
                        <p className="text-white/70 text-sm">{routing.distance}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* CURRENT LOCATION - Show GPS-based lane if available */}
            {currentLocation && (
              <div className="p-2 rounded-lg mb-3 bg-blue-900/30 border border-blue-600/30">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-xs">Your Location:</span>
                  {nearestLane ? (
                    <span className="text-cyan-400 text-sm font-bold" data-testid="text-nearest-lane">
                      Near {nearestLane}
                    </span>
                  ) : (
                    <span className="text-white text-sm font-medium">
                      GPS Active ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* COMPACT VEHICLE INFO */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              {scanResult.workOrder && (
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-500">WO:</span>
                  <span className="text-white ml-1 font-mono">{scanResult.workOrder}</span>
                </div>
              )}
              {scanResult.vin && (
                <div className="bg-slate-800/50 rounded-lg p-2 col-span-2">
                  <span className="text-slate-500">VIN:</span>
                  <span className="text-white ml-1 font-mono text-[10px]">{scanResult.vin}</span>
                </div>
              )}
              {scanResult.year && (
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-500">Year:</span>
                  <span className="text-white ml-1">{scanResult.year}</span>
                </div>
              )}
              {scanResult.mileage && (
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-500">Miles:</span>
                  <span className="text-white ml-1">{scanResult.mileage}</span>
                </div>
              )}
              {scanResult.make && (
                <div className="bg-slate-800/50 rounded-lg p-2 col-span-2">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="text-white ml-1">{scanResult.year} {scanResult.make} {scanResult.model}</span>
                </div>
              )}
              {scanResult.dealer && (
                <div className="bg-slate-800/50 rounded-lg p-2 col-span-2">
                  <span className="text-slate-500">Dealer:</span>
                  <span className="text-white ml-1">{scanResult.dealer}</span>
                </div>
              )}
            </div>

            {/* COMPACT ACTION BUTTONS */}
            <div className="space-y-2 pt-3 border-t border-slate-700/50">
              <p className="text-center text-[10px] text-slate-400 italic">
                If incorrect, edit or discard
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <PremiumButton 
                  onClick={() => {
                    setManualEntry({
                      workOrder: scanResult.workOrder || "",
                      vin: scanResult.vin || "",
                      dealerCode: scanResult.dealer || "",
                      year: scanResult.year || "",
                      make: scanResult.make || "",
                      model: scanResult.model || "",
                      mileage: scanResult.mileage || "",
                      saleWeek: scanResult.saleWeek || "",
                      saleLane: scanResult.saleLane || "",
                      saleSpot: scanResult.saleSpot || "",
                      currentLocation: scanResult.currentLocation || "",
                      nextDestination: scanResult.nextDestination || "",
                      isSold: scanResult.isSold || false
                    });
                    setShowManualEntryDialog(true);
                    setScanResult(null);
                  }}
                  variant="glass"
                  size="sm"
                  icon={<Edit3 className="h-3.5 w-3.5" />}
                  data-testid="button-edit-delivery"
                >
                  Edit
                </PremiumButton>
                
                <PremiumButton 
                  onClick={() => {
                    toast({
                      title: "Saved",
                      description: `WO ${scanResult.workOrder || 'N/A'}`,
                      duration: 2000,
                    });
                    setScanResult(null);
                    setScanInput("");
                  }}
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle className="h-3.5 w-3.5" />}
                  data-testid="button-save-automatic"
                >
                  Save
                </PremiumButton>
              </div>
              
              <PremiumButton 
                variant="glass"
                size="sm"
                className="w-full text-slate-400 hover:text-white"
                onClick={() => {
                  setScanResult(null);
                  setScanInput("");
                }}
                data-testid="button-scan-another"
              >
                Discard
              </PremiumButton>
            </div>
          </BentoTile>
        )}
      </div>

      <WeeklyMapViewer open={showWeeklyMap} onClose={() => setShowWeeklyMap(false)} />
      
      {/* MANUAL ENTRY DIALOG - Complete Ticket Details */}
      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
        <DialogContent className="bg-slate-900 border-blue-600 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-500" />
              {manualEntry.workOrder ? 'Edit Scanned Data' : 'Manual Ticket Entry'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              {manualEntry.workOrder 
                ? '✏️ Review and edit the scanned information below. Manual changes override OCR data.' 
                : '📝 Enter all vehicle information manually when ticket is unreadable.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {/* SOLD Checkbox */}
              <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                <input
                  type="checkbox"
                  id="manual-sold"
                  checked={manualEntry.isSold}
                  onChange={(e) => setManualEntry({...manualEntry, isSold: e.target.checked})}
                  className="w-5 h-5"
                />
                <Label htmlFor="manual-sold" className="text-white font-bold cursor-pointer">
                  🚨 Mark as SOLD (Routes to 801-805)
                </Label>
              </div>

              {/* Work Order & VIN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Work Order #</Label>
                  <Input
                    placeholder="e.g. 8422107"
                    value={manualEntry.workOrder}
                    onChange={(e) => setManualEntry({...manualEntry, workOrder: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">VIN (Full or Last 6)</Label>
                  <Input
                    placeholder="e.g. 1HGBH41..."
                    value={manualEntry.vin}
                    onChange={(e) => setManualEntry({...manualEntry, vin: e.target.value.toUpperCase()})}
                    className="bg-slate-800 border-slate-700 text-white uppercase"
                  />
                </div>
              </div>

              {/* Dealer Code */}
              <div className="space-y-2">
                <Label className="text-white">Dealer Code</Label>
                <Input
                  placeholder="e.g. ACME123, FORD45"
                  value={manualEntry.dealerCode}
                  onChange={(e) => setManualEntry({...manualEntry, dealerCode: e.target.value.toUpperCase()})}
                  className="bg-slate-800 border-slate-700 text-white uppercase"
                />
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Year</Label>
                  <Input
                    placeholder="2023"
                    value={manualEntry.year}
                    onChange={(e) => setManualEntry({...manualEntry, year: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Make</Label>
                  <Input
                    placeholder="Ford"
                    value={manualEntry.make}
                    onChange={(e) => setManualEntry({...manualEntry, make: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Model</Label>
                  <Input
                    placeholder="F-150"
                    value={manualEntry.model}
                    onChange={(e) => setManualEntry({...manualEntry, model: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Mileage */}
              <div className="space-y-2">
                <Label className="text-white">Mileage</Label>
                <Input
                  placeholder="e.g. 45000"
                  value={manualEntry.mileage}
                  onChange={(e) => setManualEntry({...manualEntry, mileage: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Sale Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Sale Week</Label>
                  <Input
                    placeholder="48"
                    value={manualEntry.saleWeek}
                    onChange={(e) => setManualEntry({...manualEntry, saleWeek: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Lane #</Label>
                  <Input
                    placeholder="42"
                    value={manualEntry.saleLane}
                    onChange={(e) => setManualEntry({...manualEntry, saleLane: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Spot #</Label>
                  <Input
                    placeholder="113"
                    value={manualEntry.saleSpot}
                    onChange={(e) => setManualEntry({...manualEntry, saleSpot: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Routing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Current Location</Label>
                  <Input
                    placeholder="e.g. Chute, 515"
                    value={manualEntry.currentLocation}
                    onChange={(e) => setManualEntry({...manualEntry, currentLocation: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Next Destination *</Label>
                  <Input
                    placeholder="e.g. Lane 42, Inventory"
                    value={manualEntry.nextDestination}
                    onChange={(e) => setManualEntry({...manualEntry, nextDestination: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <p className="text-[10px] text-yellow-400">
                    ⚠️ If left blank, vehicle defaults to Inventory
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowManualEntryDialog(false)}
              className="border-slate-700 text-slate-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManualEntry}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-save-manual-entry"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANUAL MOVE DIALOG */}
      <Dialog open={showManualMoveDialog} onOpenChange={setShowManualMoveDialog}>
        <DialogContent className="bg-slate-900 border-amber-600">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" />
              Manual Move Entry
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Record a one-off vehicle move that doesn't follow standard routing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Work Order or VIN */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Work Order #</Label>
                <Input
                  placeholder="e.g. 842210"
                  value={manualMove.workOrder}
                  onChange={(e) => setManualMove({...manualMove, workOrder: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="input-manual-workorder"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">VIN (last 6)</Label>
                <Input
                  placeholder="e.g. 123456"
                  value={manualMove.vin}
                  onChange={(e) => setManualMove({...manualMove, vin: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white uppercase"
                  data-testid="input-manual-vin"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label className="text-white">Destination *</Label>
              <Input
                placeholder="e.g. Lane 42, Lot 515, Sold 803, etc."
                value={manualMove.destination}
                onChange={(e) => setManualMove({...manualMove, destination: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                data-testid="input-manual-destination"
                required
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-white">Reason *</Label>
              <Select value={manualMove.reason} onValueChange={(v) => setManualMove({...manualMove, reason: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-manual-reason">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="wrong_spot">Car in Wrong Spot</SelectItem>
                  <SelectItem value="wrong_lane">Car in Wrong Lane</SelectItem>
                  <SelectItem value="inventory">Inventory Move</SelectItem>
                  <SelectItem value="sold">Sold Car (Priority)</SelectItem>
                  <SelectItem value="detail">Detail/Reconditioning</SelectItem>
                  <SelectItem value="damage">Damage/Safety Issue</SelectItem>
                  <SelectItem value="special_request">Special Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional Notes */}
            <div className="space-y-2">
              <Label className="text-white">Notes (Optional)</Label>
              <Textarea
                placeholder="Additional details..."
                value={manualMove.notes}
                onChange={(e) => setManualMove({...manualMove, notes: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white min-h-20"
                data-testid="input-manual-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowManualMoveDialog(false)}
              className="border-slate-700 text-slate-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManualMove}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-save-manual-move"
            >
              <Truck className="h-4 w-4 mr-2" />
              Record Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVENTORY DRIVER: CONFIRM MOVE DIALOG */}
      <Dialog open={confirmMoveDialog} onOpenChange={setConfirmMoveDialog}>
        <DialogContent className="bg-gradient-to-br from-amber-950 to-amber-900 border-amber-500">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-400" />
              Save This Move?
            </DialogTitle>
            <DialogDescription className="text-amber-200 text-base">
              Do you need to move this vehicle, or just checking info?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-900/50 p-4 rounded-lg">
              <p className="text-white font-semibold mb-2">Scanned Information:</p>
              {pendingScan?.vin && (
                <p className="text-amber-100 text-sm">VIN: {pendingScan.vin}</p>
              )}
              {pendingScan?.workOrder && (
                <p className="text-amber-100 text-sm">Work Order: {pendingScan.workOrder}</p>
              )}
              {pendingScan?.nextDestination && (
                <p className="text-amber-100 text-sm">Destination: {pendingScan.nextDestination}</p>
              )}
              {pendingScan?.saleLane && (
                <p className="text-amber-100 text-sm">Lane {pendingScan.saleLane}:{pendingScan.saleSpot}</p>
              )}
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
              <p className="text-blue-200 text-xs leading-relaxed">
                💡 <span className="font-semibold">Tip:</span> Only save if you're actually moving the car. Random scans for info don't need to be saved.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelMove}
              className="border-amber-400 text-amber-200 hover:bg-amber-900"
              data-testid="button-info-only"
            >
              Just Looking - Don't Save
            </Button>
            <Button 
              onClick={handleConfirmMove}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              data-testid="button-save-move"
            >
              <Truck className="h-4 w-4 mr-2" />
              Yes, Save This Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PWA INSTALL PROMPT */}
      {showPwaPrompt && (
        <Dialog open={showPwaPrompt} onOpenChange={setShowPwaPrompt}>
          <DialogContent className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-500">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-400" />
                Add Lot Ops Pro to Home Screen
              </DialogTitle>
              <DialogDescription className="text-blue-200 text-base">
                Install the app for quick access and offline capability
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-blue-900/50 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Quick Launch</p>
                    <p className="text-blue-200 text-sm">Tap the icon on your home screen to open instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">Works Offline</p>
                    <p className="text-blue-200 text-sm">Continue working even without internet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold">No Browser Bar</p>
                    <p className="text-blue-200 text-sm">Full-screen app experience</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-blue-300 text-center">
                You can always remove it later from your home screen
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={dismissPwaPrompt}
                className="border-blue-400 text-blue-200 hover:bg-blue-900"
              >
                Not Now
              </Button>
              <Button 
                onClick={handleInstallPwa}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                data-testid="button-install-pwa"
              >
                <Truck className="h-4 w-4 mr-2" />
                Add to Home Screen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* WRONG WEEK ALERT DIALOG */}
      <Dialog open={showWrongWeekDialog} onOpenChange={setShowWrongWeekDialog}>
        <DialogContent className="bg-gradient-to-br from-red-950 to-red-900 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-400 animate-pulse" />
              WRONG SALE WEEK!
            </DialogTitle>
            <DialogDescription className="text-red-200 text-lg font-semibold">
              {wrongWeekData?.message}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-900/60 border-2 border-red-400 p-4 rounded-lg">
              <p className="text-white font-bold text-lg mb-3">⚠️ DO NOT MOVE THIS VEHICLE TO SALE LANE</p>
              
              {wrongWeekData?.result && (
                <div className="space-y-2 text-red-100">
                  {wrongWeekData.result.workOrder && (
                    <p className="text-sm">Work Order: <span className="font-mono font-bold">{wrongWeekData.result.workOrder}</span></p>
                  )}
                  {wrongWeekData.result.vin && (
                    <p className="text-sm">VIN: <span className="font-mono">{wrongWeekData.result.vin}</span></p>
                  )}
                  {wrongWeekData.result.saleLane && (
                    <p className="text-sm">Scanned Destination: <span className="font-bold">Lane {wrongWeekData.result.saleLane}, Spot {wrongWeekData.result.saleSpot}</span></p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-900/40 border border-blue-400 p-4 rounded-lg">
              <p className="text-blue-200 text-sm font-semibold mb-2">📋 What to do:</p>
              <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
                <li>Leave the vehicle where it is, OR</li>
                <li>Move it to <span className="font-bold text-white">INVENTORY</span> for proper staging</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowWrongWeekDialog(false);
                setWrongWeekData(null);
                setScanInput("");
              }}
              className="border-red-400 text-red-200 hover:bg-red-900 w-full sm:w-auto"
              data-testid="button-cancel-move"
            >
              Don't Move - Leave It
            </Button>
            <Button 
              onClick={async () => {
                // Route to inventory instead
                if (wrongWeekData?.result) {
                  const inventoryResult = {
                    ...wrongWeekData.result,
                    nextDestination: "Inventory",
                    saleLane: undefined,
                    saleSpot: undefined,
                  };
                  await saveMoveToDatabase(inventoryResult);
                  toast({
                    title: "✓ Moved to Inventory",
                    description: "Vehicle routed correctly for wrong sale week",
                  });
                }
                setShowWrongWeekDialog(false);
                setWrongWeekData(null);
                setScanInput("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full sm:w-auto"
              data-testid="button-move-inventory"
            >
              <Truck className="h-4 w-4 mr-2" />
              Move to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Preview Modal for OCR */}
      <CameraPreviewModal
        isOpen={showCameraPreview}
        mode="ocr"
        title="Scan Ticket"
        description="Align sticker within frame and capture"
        onClose={() => setShowCameraPreview(false)}
        onCapture={handleCameraOCR}
        onProcessing={handleOCRProcessing}
        showScanFrame={true}
      />

      {/* Notes and Weather moved to global FloatingNotepad and FloatingWeatherButton in App.tsx */}
      <SafetyButton />
      
      {/* Lot Spot Reporter - Report empty spots in inventory lots */}
      <LotSpotReporter 
        reporterName={(() => {
          const userStr = localStorage.getItem("vanops_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              return user.name || `Driver ${user.driverNumber}`;
            } catch { return "Inventory Driver"; }
          }
          return "Inventory Driver";
        })()}
        reporterRole="inventory_driver"
      />
      
      {/* News and Media - Hidden by default, accessible in Settings if needed */}
      {/* <NewsButton /> */}
      {/* <MediaPlayer /> */}
      
      {/* Easter Egg Popup - Random driver bios */}
      <EasterEggPopup currentDriverNumber="inventory" />
      
      {/* App Suggestions Widget */}
      <AppSuggestionsWidget 
        driverNumber="inventory" 
        driverName="Inventory Driver" 
      />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        role="inventory" 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      {/* Help Center */}
      <HelpButton role={userRole === 'driver' ? 'van_driver' : 'inventory_driver'} variant="floating" size="md" />
      
      {/* GPS Lane Mapper Modal */}
      <LaneMapper 
        isOpen={showLaneMapper} 
        onClose={handleLaneMapperClose} 
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
