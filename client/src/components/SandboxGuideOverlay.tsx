import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Lightbulb, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionButton?: string;
  targetElement?: string; // CSS selector for highlighting
  type: "tip" | "action" | "warning" | "success";
  autoNext?: boolean; // Auto-advance after 5 seconds
}

interface SandboxGuideOverlayProps {
  role: string;
  page: string;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: (stepId: string) => void;
}

const roleGuides: Record<string, Record<string, GuideStep[]>> = {
  driver: {
    scanner: [
      {
        id: "scanner-1",
        title: "📱 Welcome to Sandbox Driver Mode",
        description: "You're in a simulated environment. Practice scanning cars, receiving messages, and completing work without affecting real data.",
        type: "tip",
        autoNext: false,
      },
      {
        id: "scanner-2",
        title: "🎯 Scan a Car Ticket",
        description: "Try scanning a Work Order, Sale Lane, or Routing ticket using the scanner. This reads the car's location and destination.",
        action: "Scan any barcode or work order number",
        actionButton: "I've Scanned a Car",
        type: "action",
      },
      {
        id: "scanner-3",
        title: "✅ Car Detected!",
        description: "Great! The system found the car. You'll see its location (lot/row), current position, and where to move it next.",
        type: "success",
        autoNext: true,
      },
      {
        id: "scanner-4",
        title: "🛣️ GPS Navigation",
        description: "Tap 'Navigate' to get turn-by-turn directions to pick up or drop off the car. The map shows real-time distance.",
        action: "Click Navigate to see GPS directions",
        actionButton: "I'm Following GPS",
        type: "action",
      },
      {
        id: "scanner-5",
        title: "💬 Receive Messages",
        description: "Supervisors send you work orders and updates via Messages. In sandbox, you'll get simulated messages showing real workflows.",
        type: "tip",
        autoNext: true,
      },
      {
        id: "scanner-6",
        title: "✨ You're Ready!",
        description: "You now understand the driver workflow: Scan → Navigate → Move Car → Complete. Ready to go live?",
        type: "success",
        autoNext: false,
      },
    ],
    "crew-manager": [
      {
        id: "crew-1",
        title: "👥 Crew Manager Setup",
        description: "Start each shift by selecting your van number and crew members. This tracks who's working today.",
        type: "tip",
        autoNext: false,
      },
      {
        id: "crew-2",
        title: "🚗 Select Your Van",
        description: "Choose your assigned van from the list. Each van has its own performance tracking.",
        action: "Click on a van to select it",
        actionButton: "Van Selected",
        type: "action",
      },
    ],
  },
  supervisor: {
    "resource-allocation": [
      {
        id: "supervisor-1",
        title: "👨‍💼 Welcome, Supervisor!",
        description: "You oversee drivers, create work orders, and monitor performance. This sandbox lets you practice everything.",
        type: "tip",
        autoNext: false,
      },
      {
        id: "supervisor-2",
        title: "📋 Create a Work Order",
        description: "Scan cars with the smart scanner to auto-create work orders. Assign them to drivers and track completion.",
        action: "Navigate to the Work Orders section",
        actionButton: "Found Work Orders",
        type: "action",
      },
      {
        id: "supervisor-3",
        title: "🗺️ Monitor Drivers",
        description: "See all drivers on the map with real-time GPS locations. Simulated drivers will move across your screen.",
        type: "tip",
        autoNext: true,
      },
      {
        id: "supervisor-4",
        title: "📊 Analytics Dashboard",
        description: "View performance metrics, completion rates, and efficiency. Charts show trends and AI recommendations.",
        action: "Check the Analytics tab",
        actionButton: "Viewing Analytics",
        type: "action",
      },
      {
        id: "supervisor-5",
        title: "💬 Send Messages",
        description: "Message drivers with assignments, updates, or urgent requests. In sandbox, drivers auto-respond!",
        action: "Send a message to a driver",
        actionButton: "Message Sent",
        type: "action",
      },
      {
        id: "supervisor-6",
        title: "🎓 Master the Workflow",
        description: "You now understand: Create Orders → Assign → Monitor → Track Completion. You're a pro supervisor!",
        type: "success",
        autoNext: false,
      },
    ],
  },
  operations_manager: {
    "operations-manager": [
      {
        id: "ops-1",
        title: "🏢 Operations Manager Dashboard",
        description: "Full system control. Manage facilities, employees, shifts, and all supervisory functions. This is complete oversight.",
        type: "tip",
        autoNext: false,
      },
      {
        id: "ops-2",
        title: "⚙️ Facility Configuration",
        description: "Set up lots, lanes, zones, and capacity limits. This is your foundation for operations.",
        action: "Check the Facility Config tab",
        actionButton: "Facilities Configured",
        type: "action",
      },
      {
        id: "ops-3",
        title: "👥 Employee Management",
        description: "Add, edit, and manage all employees. Assign roles, change PINs for security, and track designations.",
        type: "tip",
        autoNext: true,
      },
      {
        id: "ops-4",
        title: "📅 Shift Management",
        description: "Create schedules, manage breaks, and set work hours. Control the entire daily operation.",
        action: "Review the Shifts tab",
        actionButton: "Shifts Reviewed",
        type: "action",
      },
      {
        id: "ops-5",
        title: "🚀 Full Command",
        description: "You're ready to manage the entire operation! You have complete oversight of all systems.",
        type: "success",
        autoNext: false,
      },
    ],
  },
};

const getIcon = (type: GuideStep["type"]) => {
  switch (type) {
    case "tip":
      return <Lightbulb className="h-5 w-5 text-blue-400" />;
    case "action":
      return <Zap className="h-5 w-5 text-yellow-400" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-orange-400" />;
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
  }
};

export function SandboxGuideOverlay({ role, page, isOpen, onClose, onActionComplete }: SandboxGuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps = roleGuides[role]?.[page] || [];
  const activeStep = steps[currentStep];

  useEffect(() => {
    if (!activeStep?.autoNext) return;

    const timer = setTimeout(() => {
      handleNextStep();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStep, activeStep?.autoNext]);

  const handleNextStep = () => {
    if (activeStep?.id) {
      setCompletedSteps([...completedSteps, activeStep.id]);
      onActionComplete?.(activeStep.id);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!activeStep) return null;

  return (
    <Dialog open={isOpen && steps.length > 0} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-blue-950 to-slate-900 border-blue-500 max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {getIcon(activeStep.type)}
              <div>
                <DialogTitle className="text-white text-lg">{activeStep.title}</DialogTitle>
                <DialogDescription className="text-blue-200 mt-2">{activeStep.description}</DialogDescription>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
        </DialogHeader>

        {activeStep.action && (
          <Card className="bg-blue-900/30 border-blue-500/50 p-4">
            <p className="text-sm text-blue-200 font-semibold mb-2">💡 Next Step:</p>
            <p className="text-sm text-blue-100">{activeStep.action}</p>
          </Card>
        )}

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="border-blue-400 text-blue-200 hover:bg-blue-900"
          >
            Previous
          </Button>
          <div className="flex-1" />
          {activeStep.actionButton ? (
            <Button
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {activeStep.actionButton}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              Next Step
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
