import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LotBuddy } from "./LotBuddy";
import { PlayCircle, Rocket, BookOpen, Shield, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface SandboxWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  onStartTour: () => void;
  onSkipToGuide: () => void;
}

const roleDisplayNames: Record<string, string> = {
  driver: "Van Driver",
  inventory: "Inventory Driver",
  supervisor: "Supervisor",
  operations_manager: "Operations Manager",
  safety_advisor: "Safety Advisor",
  developer: "Beta Tester",
};

const roleWelcomeMessages: Record<string, string> = {
  driver: "You'll be moving vehicles across the lot with GPS guidance, tracking your quota, and communicating with supervisors in real-time.",
  inventory: "You'll be scanning vehicles, logging locations, and keeping our inventory accurate with the OCR camera system.",
  supervisor: "You'll manage driver assignments, monitor lot activity, and ensure smooth operations across all zones.",
  operations_manager: "You'll have full visibility into lot performance, AI-powered optimization suggestions, and comprehensive analytics.",
  safety_advisor: "You'll monitor driver safety, review incident reports, and ensure compliance across all operations.",
  developer: "You're testing our Manheim beta! Explore all features freely - nothing you do here will affect real operations.",
};

const roleFeatures: Record<string, string[]> = {
  driver: ["GPS-guided routing", "Real-time quota tracking", "Supervisor messaging", "Vehicle lookup"],
  inventory: ["OCR camera scanning", "VIN recognition", "Location logging", "Search & lookup"],
  supervisor: ["Driver assignments", "Real-time monitoring", "Lane management", "Performance alerts"],
  operations_manager: ["AI optimization", "Lot capacity analysis", "Performance reports", "Multi-zone overview"],
  safety_advisor: ["Incident monitoring", "Safety reports", "Compliance tracking", "Alert management"],
  developer: ["Full system access", "All features unlocked", "Analytics dashboard", "Feedback system"],
};

export function SandboxWelcome({ 
  isOpen, 
  onClose, 
  userName, 
  userRole, 
  onStartTour,
  onSkipToGuide 
}: SandboxWelcomeProps) {
  const [step, setStep] = useState(0);
  const [expression, setExpression] = useState<"waving" | "speaking" | "celebrating" | "pointing">("waving");

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setExpression("waving");
    }
  }, [isOpen]);

  useEffect(() => {
    const expressions: ("waving" | "speaking" | "celebrating" | "pointing")[] = ["waving", "speaking", "celebrating", "pointing"];
    setExpression(expressions[step] || "speaking");
  }, [step]);

  const displayRole = roleDisplayNames[userRole] || userRole;
  const welcomeMessage = roleWelcomeMessages[userRole] || "Explore all the features of Lot Ops Pro!";
  const features = roleFeatures[userRole] || ["Full access", "All features"];

  const steps = [
    {
      title: `Welcome to Sandbox Mode, ${userName}!`,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Hey there! I'm <span className="font-bold text-orange-600">Lot Buddy</span>, your guide to Lot Ops Pro.
          </p>
          <p className="text-slate-600">
            You're starting in <span className="font-bold text-emerald-600">Sandbox Mode</span> - a safe practice environment where you can explore everything without affecting real operations.
          </p>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Nothing you do here will affect real data!</span>
          </div>
        </div>
      )
    },
    {
      title: `Your Role: ${displayRole}`,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">{welcomeMessage}</p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Key features for your role:</p>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready!",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            When you feel confident with the sandbox, you can <span className="font-bold text-emerald-600">Go Live</span> to start working with real data.
          </p>
          <p className="text-slate-600">
            Your supervisor will provide the daily shift code when you're ready to switch.
          </p>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Rocket className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">Take as much time as you need to practice first!</span>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Explore?",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            I can show you around with an <span className="font-bold text-blue-600">interactive tour</span> - I'll point out where to click and what each feature does.
          </p>
          <p className="text-slate-600">
            Or if you prefer to explore on your own, you can always access the <span className="font-bold text-purple-600">How-To Guide</span> from the menu.
          </p>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-700">Tours take about 2-4 minutes based on your role</span>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/30 animate-pulse" />
            <div className="absolute bottom-4 left-12 w-8 h-8 rounded-full bg-white/20 animate-pulse delay-300" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <LotBuddy expression={expression} size="xl" animated />
            </motion.div>
            
            <div className="text-white">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold"
              >
                {steps[step].title}
              </motion.div>
              <div className="text-white/80 text-sm">Step {step + 1} of {steps.length}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 justify-center mt-4">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === step ? "bg-orange-500 w-6" : "bg-slate-300 hover:bg-slate-400"
                }`}
                data-testid={`button-step-indicator-${idx}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 gap-2">
          {step === steps.length - 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onSkipToGuide();
                  onClose();
                }}
                className="flex-1"
                data-testid="button-skip-to-guide"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Open Guide
              </Button>
              <Button
                onClick={() => {
                  onStartTour();
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                data-testid="button-start-tour"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Tour
              </Button>
            </>
          ) : (
            <>
              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                data-testid="button-next"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useSandboxWelcome() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ userName: string; userRole: string } | null>(null);

  const triggerWelcome = (userName: string, userRole: string) => {
    const hasSeenWelcome = localStorage.getItem("vanops_sandbox_welcome_seen");
    if (!hasSeenWelcome) {
      setWelcomeData({ userName, userRole });
      setShowWelcome(true);
    }
  };

  const markWelcomeSeen = () => {
    localStorage.setItem("vanops_sandbox_welcome_seen", "true");
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem("vanops_sandbox_welcome_seen");
  };

  return {
    showWelcome,
    welcomeData,
    triggerWelcome,
    markWelcomeSeen,
    resetWelcome,
    setShowWelcome
  };
}
