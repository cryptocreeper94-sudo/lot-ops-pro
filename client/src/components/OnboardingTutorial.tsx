import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Camera, Users, TrendingUp, Navigation, ClipboardList, BarChart3 } from "lucide-react";

interface OnboardingTutorialProps {
  role: "supervisor" | "driver" | "inventory" | "operations";
  isOpen: boolean;
  onClose: () => void;
}

const tutorialContent = {
  operations: {
    title: "Welcome, Operations Manager!",
    subtitle: "Full system control and oversight",
    icon: <BarChart3 className="h-12 w-12 text-purple-400" />,
    sections: [
      {
        icon: <Users className="h-6 w-6 text-blue-400" />,
        title: "Shift Instructions",
        description: "Create daily shift instructions for the Supervisor. They'll see your recap when they log in each day. Two-way communication keeps everyone aligned."
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-green-400" />,
        title: "Email System",
        description: "Send company-wide emails to all staff or specific groups. Order supplies, contact vendors, or communicate important updates. Email history stored in database."
      },
      {
        icon: <CheckCircle2 className="h-6 w-6 text-purple-400" />,
        title: "PIN Management",
        description: "Change PINs for everyone below you: Supervisor, Safety Advisor, and all drivers. Emergency access for situations like employee termination."
      },
      {
        icon: <BarChart3 className="h-6 w-6 text-yellow-400" />,
        title: "Full Visibility",
        description: "Access all system data, break logs, performance metrics, and safety incidents. Override any Supervisor actions when needed."
      }
    ],
    tips: [
      "You can override any Supervisor decisions - you're the highest authority",
      "Shift instructions help keep Supervisor informed of priorities and changes",
      "Email system is ready for SendGrid/AWS SES integration when configured"
    ]
  },
  supervisor: {
    title: "Welcome, Lot Supervisor!",
    subtitle: "Complete overview of Lot Ops Pro management tools",
    icon: <BarChart3 className="h-12 w-12 text-blue-400" />,
    sections: [
      {
        icon: <ClipboardList className="h-6 w-6 text-green-400" />,
        title: "Create Work Orders",
        description: "Use the smart scanner to photograph car stickers and auto-create work orders. Assign them to drivers and track completion in real-time."
      },
      {
        icon: <Users className="h-6 w-6 text-blue-400" />,
        title: "Monitor Driver Activity",
        description: "View all active drivers, their current status, and location. GPS tracking shows exactly where drivers are during non-quota work."
      },
      {
        icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
        title: "Analytics Dashboard",
        description: "Access professional reports with charts, trends, and AI-powered insights. Export to CSV/Excel or generate PDF reports for meetings."
      },
      {
        icon: <Camera className="h-6 w-6 text-yellow-400" />,
        title: "Smart Scanner",
        description: "Scan any car sticker (Work Order, Routing, Sale Lane) to instantly capture VIN, location codes, and all vehicle data. Works independently without Manheim database - routing based on readable stickers. Full barcode integration planned for Version 2.0!"
      }
    ],
    tips: [
      "The system tracks all metrics automatically - moves per hour, completion rates, downtime",
      "Use the messaging system to communicate with drivers instantly",
      "AI insights provide actionable recommendations for improving operations"
    ]
  },
  driver: {
    title: "Welcome, Van Driver!",
    subtitle: "Your autonomous routing and performance tracking system",
    icon: <Navigation className="h-12 w-12 text-green-400" />,
    sections: [
      {
        icon: <Camera className="h-6 w-6 text-blue-400" />,
        title: "Smart Scanner",
        description: "Point your camera at any car sticker to instantly read VIN, work order, routing codes, and destination. No typing needed!"
      },
      {
        icon: <Navigation className="h-6 w-6 text-green-400" />,
        title: "GPS Navigation",
        description: "Get turn-by-turn guidance to vehicle pickup locations and drop-off zones. Real-time distance countdown to destination."
      },
      {
        icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
        title: "Performance Tracking",
        description: "Monitor your moves per hour (4.5 MPH target), quota progress, and bonus earnings. Weekly and monthly stats keep you informed."
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-yellow-400" />,
        title: "Work Orders",
        description: "View assigned work orders from Teresa. Scan cars to mark items complete and track your progress in real-time."
      }
    ],
    tips: [
      "Start each shift in Crew Manager - select your van and crew members",
      "Use Bulk Move for quota work, EV Ops for electric vehicles, Crunch Mode for non-quota tasks",
      "Break tracking ensures compliance - clock in/out for lunch and breaks"
    ]
  },
  inventory: {
    title: "Welcome, Inventory Driver!",
    subtitle: "Your powerful car scanning and lookup system",
    icon: <Camera className="h-12 w-12 text-yellow-400" />,
    sections: [
      {
        icon: <Camera className="h-6 w-6 text-blue-400" />,
        title: "Smart Scanner",
        description: "Scan any sticker on any car - Work Order tags, Routing stickers, or Sale Lane labels. OCR reads all printed text automatically."
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-green-400" />,
        title: "Vehicle Lookup",
        description: "Search by VIN to instantly see vehicle details, current location, next destination, work order info, and sale week/lane."
      },
      {
        icon: <Navigation className="h-6 w-6 text-purple-400" />,
        title: "Location Tracking",
        description: "Every scan updates the vehicle's GPS location and movement history. Find cars easily with stored coordinates."
      },
      {
        icon: <TrendingUp className="h-6 w-6 text-yellow-400" />,
        title: "Pickup Requests",
        description: "Send pickup requests to van drivers when cars need to be moved. Real-time status updates keep everyone coordinated."
      }
    ],
    tips: [
      "System works offline - scans process on your phone, sync when connected",
      "Scan routing stickers to see where cars go next (DSC→257, REG→227, etc.)",
      "Sale Lane stickers show week (1-52) and lane assignments for auction day"
    ]
  }
};

export function OnboardingTutorial({ role, isOpen, onClose }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const content = tutorialContent[role];
  const totalSteps = content.sections.length + 1; // sections + tips page

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    onClose();
    const currentCount = parseInt(localStorage.getItem(`onboarding_${role}_count`) || "0");
    localStorage.setItem(`onboarding_${role}_count`, String(currentCount + 1));
  };
  
  const handleComplete = () => {
    onClose();
    const currentCount = parseInt(localStorage.getItem(`onboarding_${role}_count`) || "0");
    localStorage.setItem(`onboarding_${role}_count`, String(currentCount + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-blue-900 border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">{content.icon}</div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white truncate">{content.title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-300">{content.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {currentStep < content.sections.length ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex-shrink-0">{content.sections[currentStep].icon}</div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                    {content.sections[currentStep].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {content.sections[currentStep].description}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1.5 justify-center">
                {content.sections.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-6 bg-blue-400"
                        : idx < currentStep
                        ? "w-1.5 bg-green-400"
                        : "w-1.5 bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {content.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/10 rounded-lg p-3 border border-white/20">
                    <span className="text-blue-400 font-bold text-sm flex-shrink-0">•</span>
                    <span className="text-xs sm:text-sm text-slate-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white text-sm h-9"
            data-testid="button-skip-tutorial"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2 items-center justify-between sm:justify-end">
            <span className="text-slate-400 text-xs sm:text-sm">
              {currentStep + 1} / {totalSteps}
            </span>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 h-9 text-sm"
              data-testid="button-next-tutorial"
            >
              {currentStep < totalSteps - 1 ? "Next" : "Get Started"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
