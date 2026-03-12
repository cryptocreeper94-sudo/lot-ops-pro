import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "wouter";
import { SandboxWelcome } from "./SandboxWelcome";
import { useTour, getTourStepsForRole } from "./InteractiveTour";

interface SandboxModeContextType {
  isSandboxMode: boolean;
  setSandboxMode: (enabled: boolean) => void;
  triggerWelcome: () => void;
  checkPendingWelcome: () => void;
}

const SandboxModeContext = createContext<SandboxModeContextType | null>(null);

export function useSandboxMode() {
  const context = useContext(SandboxModeContext);
  if (!context) {
    throw new Error("useSandboxMode must be used within SandboxModeProvider");
  }
  return context;
}

interface SandboxModeProviderProps {
  children: ReactNode;
}

export function SandboxModeProvider({ children }: SandboxModeProviderProps) {
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ name: string; role: string } | null>(null);
  const [location] = useLocation();
  const [_, setLocationNav] = useLocation();
  const { startTour } = useTour();

  const checkPendingWelcome = useCallback(() => {
    const demoMode = localStorage.getItem("vanops_demo_mode");
    setIsSandboxMode(demoMode === "true");
    
    const pendingWelcome = localStorage.getItem("vanops_pending_sandbox_welcome");
    if (pendingWelcome) {
      try {
        const data = JSON.parse(pendingWelcome);
        localStorage.removeItem("vanops_pending_sandbox_welcome");
        setWelcomeData(data);
        setShowWelcome(true);
      } catch (e) {
        console.error("Failed to parse pending welcome:", e);
        localStorage.removeItem("vanops_pending_sandbox_welcome");
      }
    }
  }, []);

  useEffect(() => {
    const demoMode = localStorage.getItem("vanops_demo_mode");
    setIsSandboxMode(demoMode === "true");
  }, []);

  useEffect(() => {
    if (location !== "/") {
      const timer = setTimeout(() => {
        checkPendingWelcome();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location, checkPendingWelcome]);

  const setSandboxMode = (enabled: boolean) => {
    setIsSandboxMode(enabled);
    localStorage.setItem("vanops_demo_mode", enabled ? "true" : "false");
  };

  const triggerWelcome = () => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setWelcomeData({ name: user.name, role: user.role });
        setShowWelcome(true);
      } catch (e) {
        console.error("Failed to parse user for welcome:", e);
      }
    }
  };

  const handleStartTour = () => {
    if (welcomeData) {
      localStorage.setItem(`vanops_sandbox_welcome_seen_${welcomeData.name}`, "true");
      setShowWelcome(false);
      const steps = getTourStepsForRole(welcomeData.role);
      setTimeout(() => startTour(steps), 300);
    }
  };

  const handleSkipToGuide = () => {
    if (welcomeData) {
      localStorage.setItem(`vanops_sandbox_welcome_seen_${welcomeData.name}`, "true");
    }
    setShowWelcome(false);
  };

  const handleClose = () => {
    if (welcomeData) {
      localStorage.setItem(`vanops_sandbox_welcome_seen_${welcomeData.name}`, "true");
    }
    setShowWelcome(false);
  };

  return (
    <SandboxModeContext.Provider value={{ isSandboxMode, setSandboxMode, triggerWelcome, checkPendingWelcome }}>
      {children}
      
      {welcomeData && (
        <SandboxWelcome
          isOpen={showWelcome}
          onClose={handleClose}
          userName={welcomeData.name}
          userRole={welcomeData.role}
          onStartTour={handleStartTour}
          onSkipToGuide={handleSkipToGuide}
        />
      )}
    </SandboxModeContext.Provider>
  );
}
