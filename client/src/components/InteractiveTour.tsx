import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LotBuddy } from "./LotBuddy";
import { X, ArrowRight, ArrowLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  action?: "click" | "hover" | "none";
  nextDelay?: number;
  highlightPadding?: number;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  return (
    <TourContext.Provider value={{
      isActive,
      currentStep,
      steps,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipTour
    }}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
}

function TourOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        const padding = step.highlightPadding || 8;
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        
        let x = rect.left + rect.width / 2;
        let y = rect.top;

        switch (step.position || "bottom") {
          case "top":
            y = rect.top - tooltipHeight - 20;
            break;
          case "bottom":
            y = rect.bottom + 20;
            break;
          case "left":
            x = rect.left - tooltipWidth - 20;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case "right":
            x = rect.right + 20;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
        }

        x = Math.max(20, Math.min(x, window.innerWidth - tooltipWidth - 20));
        y = Math.max(20, Math.min(y, window.innerHeight - tooltipHeight - 20));

        setTooltipPosition({ x, y });

        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isActive, step, currentStep]);

  useEffect(() => {
    if (!isActive || !step) return;

    const target = document.querySelector(step.target);
    if (target && step.action === "click") {
      const handleClick = () => {
        setTimeout(() => {
          nextStep();
        }, step.nextDelay || 500);
      };
      target.addEventListener("click", handleClick);
      return () => target.removeEventListener("click", handleClick);
    }
  }, [isActive, step, nextStep]);

  if (!isActive || !step) return null;

  const padding = step.highlightPadding || 8;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        {targetRect && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={targetRect.left - padding}
                    y={targetRect.top - padding}
                    width={targetRect.width + padding * 2}
                    height={targetRect.height + padding * 2}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.7)"
                mask="url(#spotlight-mask)"
              />
            </svg>

            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: targetRect.left - padding,
                top: targetRect.top - padding,
                width: targetRect.width + padding * 2,
                height: targetRect.height + padding * 2,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-full h-full rounded-lg border-2 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.5)] animate-pulse" />
              
              {step.action === "click" && (
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    Click here
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        <motion.div
          className="absolute pointer-events-auto"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 flex items-center gap-3">
              <LotBuddy expression="pointing" size="sm" animated />
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{step.title}</div>
                <div className="text-white/80 text-xs">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              <button
                onClick={skipTour}
                className="text-white/80 hover:text-white transition-colors"
                data-testid="button-skip-tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-slate-600 text-sm">{step.content}</p>
            </div>

            <div className="p-3 pt-0 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-slate-500"
                data-testid="button-tour-prev"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div className="flex-1 flex justify-center gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentStep ? "bg-orange-500 w-3" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              {step.action === "click" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextStep}
                  className="text-slate-500"
                  data-testid="button-tour-skip-action"
                >
                  Skip
                  <SkipForward className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  data-testid="button-tour-next"
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const driverTourSteps: TourStep[] = [
  {
    id: "nav-menu",
    target: "[data-testid='button-nav-menu']",
    title: "Navigation Menu",
    content: "Access all your tools from here - assignments, scanner, messages, and more.",
    position: "bottom",
    action: "none"
  },
  {
    id: "quota-display",
    target: "[data-testid='text-quota-display']",
    title: "Your Daily Quota",
    content: "Track your progress here. The number shows how many vehicles you've moved today.",
    position: "bottom",
    action: "none"
  },
  {
    id: "assignment-list",
    target: "[data-testid='card-assignment-list']",
    title: "Your Assignments",
    content: "This is your work list. Tap any vehicle to see pickup and delivery locations.",
    position: "top",
    action: "none"
  },
  {
    id: "gps-button",
    target: "[data-testid='button-gps-navigate']",
    title: "GPS Navigation",
    content: "Tap this to get turn-by-turn directions to your next pickup or delivery.",
    position: "left",
    action: "none"
  }
];

export const supervisorTourSteps: TourStep[] = [
  {
    id: "driver-list",
    target: "[data-testid='card-driver-list']",
    title: "Active Drivers",
    content: "See all your drivers at a glance. Green means on schedule, yellow means running behind.",
    position: "right",
    action: "none"
  },
  {
    id: "lane-assignments",
    target: "[data-testid='card-lane-assignments']",
    title: "Lane Assignments",
    content: "Assign drivers to specific lanes or zones. Drag and drop to reassign quickly.",
    position: "bottom",
    action: "none"
  },
  {
    id: "alerts-panel",
    target: "[data-testid='card-alerts-panel']",
    title: "Real-Time Alerts",
    content: "Important notifications appear here - safety concerns, delays, and urgent messages.",
    position: "left",
    action: "none"
  }
];

export const operationsManagerTourSteps: TourStep[] = [
  {
    id: "lot-overview",
    target: "[data-testid='card-lot-overview']",
    title: "Lot Overview",
    content: "See capacity, utilization, and vehicle distribution across all zones.",
    position: "bottom",
    action: "none"
  },
  {
    id: "ai-suggestions",
    target: "[data-testid='card-ai-suggestions']",
    title: "AI Optimization",
    content: "Our AI analyzes lot conditions and suggests improvements to traffic flow and efficiency.",
    position: "left",
    action: "none"
  },
  {
    id: "performance-metrics",
    target: "[data-testid='card-performance-metrics']",
    title: "Performance Dashboard",
    content: "Track key metrics - quota completion, average move times, and crew efficiency.",
    position: "top",
    action: "none"
  }
];

export const inventoryTourSteps: TourStep[] = [
  {
    id: "scanner-button",
    target: "[data-testid='button-open-scanner']",
    title: "OCR Scanner",
    content: "Point your camera at a VIN or work order number to automatically scan and log it.",
    position: "bottom",
    action: "none"
  },
  {
    id: "routing-codes",
    target: "[data-testid='select-routing-code']",
    title: "Routing Codes",
    content: "Select where this vehicle needs to go - Detail, Disclosure, Registration, etc.",
    position: "right",
    action: "none"
  },
  {
    id: "location-input",
    target: "[data-testid='input-location']",
    title: "Log Location",
    content: "Enter the lot and row number where you found or placed the vehicle.",
    position: "bottom",
    action: "none"
  }
];

export function getTourStepsForRole(role: string): TourStep[] {
  switch (role) {
    case "driver":
      return driverTourSteps;
    case "supervisor":
      return supervisorTourSteps;
    case "operations_manager":
      return operationsManagerTourSteps;
    case "inventory":
      return inventoryTourSteps;
    default:
      return operationsManagerTourSteps;
  }
}
