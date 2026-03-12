import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import AuctionManager from "@/pages/AuctionManager";
import Login from "@/pages/Login";
import PrinterConnect from "@/pages/PrinterConnect";
import CrewManager from "@/pages/CrewManager";
import ModeSelection from "@/pages/ModeSelection";
import ResourceAllocation from "@/pages/ResourceAllocation";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import DriverProfile from "@/pages/DriverProfile";
import HelpGuide from "@/pages/HelpGuide";
import Scanner from "@/pages/Scanner";
import Analytics from "@/pages/Analytics";
import LaneConfiguration from "@/pages/LaneConfiguration";
import CrewSetup from "@/pages/CrewSetup";
import ConfigurationWizard from "@/pages/ConfigurationWizard";
import Pricing from "@/pages/Pricing";
import Checkout from "@/pages/Checkout";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import FranchiseOffer from "@/pages/FranchiseOffer";
import HandoffTemplate from "@/pages/HandoffTemplate";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Investors from "@/pages/Investors";
import TeresaMessage from "@/pages/TeresaMessage";
import WeeklyMaps from "@/pages/WeeklyMaps";
import SafetyReport from "@/pages/SafetyReport";
import EvChargingTracker from "@/pages/EvChargingTracker";
import SafetyDashboard from "@/pages/SafetyDashboard";
import OperationsManager from "@/pages/OperationsManager";
import ServiceDriverDashboard from "@/pages/ServiceDriverDashboard";
import WebResearch from "@/pages/WebResearch";
import FutureFeatures from "@/pages/FutureFeatures";
import CompanyResources from "@/pages/CompanyResources";
import Settings from "@/pages/Settings";
import ChangePinRequired from "@/pages/ChangePinRequired";
import SystemWorkflow from "@/pages/SystemWorkflow";
import SalesDashboard from "@/pages/SalesDashboard";
import SalesForceAssignment from "@/pages/SalesForceAssignment";
import BusinessCardManager from "@/pages/BusinessCardManager";
import AssetTracking from "@/pages/AssetTracking";
import CustomerHallmarkManager from "@/pages/CustomerHallmarkManager";
import FacilityReference from "@/pages/FacilityReference";
import PinTrackingDashboard from "@/pages/PinTrackingDashboard";
import Slideshow from "@/pages/Slideshow";
import BadgeSuccess from "@/pages/BadgeSuccess";
import MyActivity from "@/pages/MyActivity";
import Customize from "@/pages/Customize";
import DriverSandbox from "@/pages/DriverSandbox";
import SupervisorSandbox from "@/pages/SupervisorSandbox";
import EmployeePortal from "@/pages/EmployeePortal";
import EmployeeFiles from "@/pages/EmployeeFiles";
import { ProjectStatusModal } from "@/components/ProjectStatusModal";
import { AiAssistant } from "@/components/AiAssistant";
import { GlobalWatermark } from "@/components/GlobalWatermark";
import { MascotProvider } from "@/components/MascotGuideContext";
import { MascotGuideOverlay } from "@/components/MascotGuideOverlay";
import { LotBuddyPopup } from "@/components/LotBuddyPopup";
import { FirstTimeOnboarding } from "@/components/PageWorkflowGuide";
import { TourProvider } from "@/components/InteractiveTour";
import { SandboxModeProvider } from "@/components/SandboxModeProvider";
import { PopupGameProvider } from "@/components/TeamAvatarPopupGame";
import { LotBuddyProvider } from "@/contexts/LotBuddyContext";
import { LotBuddyAvatarPopup } from "@/components/LotBuddyAvatarPopup";
import { FloatingScene } from "@/components/FloatingScene";
import FloatingWeatherButton from "@/components/FloatingWeatherButton";
import { GlobalModeBar } from "@/components/GlobalModeBar";
import { FloatingNotepad } from "@/components/Notepad";
import { GlobalHeader } from "@/components/GlobalHeader";
import { CompactFooter } from "@/components/CompactFooter";
import { getFacilityMode, isBetaMode as checkIsBetaMode } from "@/hooks/useFacilityMode";

import VanRouting from "@/components/VanRouting";
import { LiveDriverMap } from "@/components/LiveDriverMap";
import { canAccessVanLocator } from "@/utils/roleManager";

function LiveMapPage() {
  const [_, setLocation] = useLocation();
  const hasAccess = canAccessVanLocator();
  
  useEffect(() => {
    if (!hasAccess) {
      setLocation("/dashboard");
    }
  }, [hasAccess, setLocation]);
  
  if (!hasAccess) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <LiveDriverMap />
    </div>
  );
}

function DriverDashboard() {
   return (
     <div className="min-h-screen bg-slate-50 p-4">
       <VanRouting />
     </div>
   );
}

function checkIsDeveloper(): boolean {
  try {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role === "developer" || user.pin === "0424";
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return false;
}

const facilityMode = getFacilityMode();
const isDeveloper = checkIsDeveloper();
const isBetaMode = checkIsBetaMode() && !isDeveloper;

// Developer auto-login redirect component
function DevAutoLoginRedirect() {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    const devAutoLogin = localStorage.getItem("vanops_dev_autologin");
    const storedUser = localStorage.getItem("vanops_user");
    if (devAutoLogin === "true" && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "developer") {
          setLocation("/developer");
        }
      } catch (e) {
        localStorage.removeItem("vanops_dev_autologin");
      }
    }
  }, [setLocation]);
  
  return <Login />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={DevAutoLoginRedirect} />
        <Route path="/slideshow" component={Slideshow} />
        <Route path="/change-pin-required" component={ChangePinRequired} />
      <Route path="/dashboard" component={ModeSelection} />
      
      {/* Driver Routes */}
      <Route path="/driver-dashboard" component={DriverDashboard} />
      <Route path="/driver-sandbox" component={DriverSandbox} />
      <Route path="/supervisor-sandbox" component={SupervisorSandbox} />
      <Route path="/crew-manager" component={CrewManager} />
      <Route path="/driver-profile" component={DriverProfile} />
      <Route path="/help" component={HelpGuide} />
      <Route path="/safety-report" component={SafetyReport} />
      <Route path="/ev-charging" component={EvChargingTracker} />
      
      {/* Inventory Routes */}
      <Route path="/scanner" component={Scanner} />
      
      {/* Developer Routes - Available for Operations Managers */}
      <Route path="/developer" component={DeveloperDashboard} />
      <Route path="/developer-dashboard" component={DeveloperDashboard} />
      <Route path="/teresa-message" component={TeresaMessage} />
      <Route path="/weekly-maps" component={WeeklyMaps} />
      <Route path="/system-workflow" component={SystemWorkflow} />
      
      {/* Shared Routes */}
      <Route path="/web-research" component={WebResearch} />
      <Route path="/future-features" component={FutureFeatures} />
      <Route path="/facility-reference" component={FacilityReference} />
      <Route path="/pin-tracking" component={PinTrackingDashboard} />
      
      {/* Safety Advisor Routes */}
      <Route path="/safety-dashboard" component={SafetyDashboard} />
      
      {/* Service Driver Routes */}
      <Route path="/service-driver" component={ServiceDriverDashboard} />
      
      {/* Live Driver Map */}
      <Route path="/live-map" component={LiveMapPage} />
      
      {/* Operations Manager Routes */}
      <Route path="/operations-manager" component={OperationsManager} />
      <Route path="/employee-files" component={EmployeeFiles} />
      
      {/* Supervisor Routes */}
      <Route path="/resource-allocation" component={ResourceAllocation} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/lane-config" component={LaneConfiguration} />
      <Route path="/crew-setup" component={CrewSetup} />
      <Route path="/company-resources" component={CompanyResources} />
      
      {/* Legacy/Other Routes */}
      <Route path="/auction-manager" component={AuctionManager} />
      <Route path="/printer-connect" component={PrinterConnect} />
      
      {/* About/Overview */}
      <Route path="/about" component={About} />
      
      {/* Privacy Policy */}
      <Route path="/privacy" component={PrivacyPolicy} />
      
      {/* Terms of Service */}
      <Route path="/terms" component={TermsOfService} />
      
      {/* Investors - Hidden in Manheim Beta */}
      {!isBetaMode && <Route path="/investors" component={Investors} />}
      
      {/* Settings - Available to all roles */}
      <Route path="/settings" component={Settings} />
      
      {/* Customize - Theme and personalization */}
      <Route path="/customize" component={Customize} />
      
      {/* Employee Portal - News, Quick Links, Recognition */}
      <Route path="/employee-portal" component={EmployeePortal} />
      
      {/* Sales - CRM - Hidden in Manheim Beta */}
      {!isBetaMode && <Route path="/sales" component={SalesDashboard} />}
      {!isBetaMode && <Route path="/sales-force" component={SalesForceAssignment} />}
      {!isBetaMode && <Route path="/business-card" component={BusinessCardManager} />}
      
      {/* Admin & Developer - Asset Tracking */}
      <Route path="/asset-tracking" component={AssetTracking} />
      
      {/* Customer Hallmark & Serial Management */}
      <Route path="/hallmark-manager" component={CustomerHallmarkManager} />
      
      {/* Configuration Wizard - White-label setup */}
      <Route path="/configure" component={ConfigurationWizard} />
      
      {/* Pricing and Subscriptions */}
      {/* Public App Routes - Hidden in Manheim Beta */}
      {!isBetaMode && <Route path="/pricing" component={Pricing} />}
      {!isBetaMode && <Route path="/checkout/:status" component={Checkout} />}
      {!isBetaMode && <Route path="/subscription" component={SubscriptionManagement} />}
      {!isBetaMode && <Route path="/franchise" component={FranchiseOffer} />}
      <Route path="/handoff-template" component={HandoffTemplate} />
      
      {/* NFT Badge Payment Success Page */}
      <Route path="/badge-success" component={BadgeSuccess} />
      
      {/* Personal Activity Dashboard */}
      <Route path="/my-activity" component={MyActivity} />
      
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  // Get user info from localStorage to determine role
  const userStr = typeof window !== "undefined" ? localStorage.getItem("vanops_user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "guest";
  const userRole = user?.role || "driver";
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LotBuddyProvider>
        <MascotProvider>
          <TourProvider>
            <SandboxModeProvider>
              <PopupGameProvider defaultEnabled={false} defaultInterval={60000}>
              <TooltipProvider>
              <Toaster />
              {/* Global Header - Hamburger menu, version, blockchain certified */}
              <GlobalHeader />
              {/* Global Mode Bar - Emergency/Training/Maintenance status */}
              <GlobalModeBar />
              {/* ProjectStatusModal removed as requested */}
              <Router />
              
              {/* Global Floating Buttons - Appear on Every Screen */}
              {/* AI Assistant - Purple sparkle button */}
              <AiAssistant />
              
              {/* Lot Buddy Mascot Guide - Now accessed via hamburger menu Tutorials */}
              <MascotGuideOverlay />
              
              {/* Floating Scene - Garage (messaging) + Vehicle (AI) + Tree diorama - Hidden on login page */}
              {user && <FloatingScene />}
              
              {/* Pixar Buddy Avatar System - Popup only, button replaced by FloatingScene vehicle */}
              {user && <LotBuddyAvatarPopup />}
              
              {/* Premium Weather Widget - Dynamic icons with weather-based glows - Positions differently on login vs other pages */}
              <FloatingWeatherButton />
              
              {/* Floating Notepad - Quick notes for drivers/supervisors (only when logged in) */}
              {user && (userRole === "driver" || userRole === "supervisor" || userRole === "operations_manager") && (
                <FloatingNotepad />
              )}
              
              {/* First Time User Onboarding - "First time here? Start here!" */}
              <FirstTimeOnboarding />
              
              {/* Global Floating Watermark - Lot Ops Pro emblem on every page */}
              <GlobalWatermark />
              
              {/* Compact Footer - Darkwave Studios copyright */}
              <CompactFooter />
              </TooltipProvider>
              </PopupGameProvider>
            </SandboxModeProvider>
          </TourProvider>
        </MascotProvider>
        </LotBuddyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
