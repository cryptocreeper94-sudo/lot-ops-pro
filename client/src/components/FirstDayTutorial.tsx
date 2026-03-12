import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Coffee, 
  LogOut,
  Camera,
  MessageSquare,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface FirstDayTutorialProps {
  role: "van_driver" | "inventory_driver";
  userName: string;
  onComplete: () => void;
}

export function FirstDayTutorial({ role, userName, onComplete }: FirstDayTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const vanDriverSteps = [
    {
      title: "Welcome to Your First Day!",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Hey {userName}! Welcome to the team. This quick tutorial will walk you through a typical shift 
            from start to finish. It takes about 2 minutes.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Don't worry:</span> You can always access help guides 
              from your dashboard anytime you need a refresher.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Clock In",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            When you arrive for your shift, the first thing you'll do is <strong>clock in</strong>.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
            <h4 className="font-semibold text-blue-900">⏰ Clock-In Timing:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li><strong>3:25 PM</strong> - Earliest you can clock in</li>
              <li><strong>3:25-3:35 PM</strong> - On-time window (you're good!)</li>
              <li><strong>After 3:35 PM</strong> - Marked as late</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 space-y-2">
            <h4 className="font-semibold text-green-900">How to clock in:</h4>
            <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
              <li>Look for the "Start Shift" button on your dashboard</li>
              <li>Tap it once during the on-time window</li>
              <li>You'll see a confirmation message</li>
            </ol>
          </div>
          <p className="text-xs text-slate-600 italic">
            The app tracks your time automatically from this point forward.
          </p>
        </div>
      )
    },
    {
      title: "Step 2: Check Your Route",
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            After clocking in, check the <strong>GPS Map</strong> to see where you need to pick up 
            and drop off vehicles.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
            <h4 className="font-semibold text-blue-900">What you'll see:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Your current location (blue dot)</li>
              <li>Pickup locations (work orders waiting for you)</li>
              <li>Drop-off locations (where vehicles need to go)</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            The map updates in real-time as you move around the lot.
          </p>
        </div>
      )
    },
    {
      title: "Step 3: Log Your Trips",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            As you complete each vehicle move, use the <strong>Trip Counter</strong> to log it.
          </p>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-2">
            <h4 className="font-semibold text-purple-900">How to log a trip:</h4>
            <ol className="list-decimal list-inside text-sm text-purple-800 space-y-1">
              <li>Tap the floating "+" button</li>
              <li>Confirm the vehicle details</li>
              <li>The app tracks distance and time automatically</li>
            </ol>
          </div>
          <p className="text-xs text-slate-600 italic">
            This builds your daily stats: MPH, trips completed, efficiency score, and bonus eligibility.
          </p>
        </div>
      )
    },
    {
      title: "Step 4: Take Your Break",
      icon: Coffee,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Your supervisor will announce break times (usually around 5:00 PM). When it's time, 
            tap the <strong>"Start Break"</strong> button.
          </p>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-2">
            <h4 className="font-semibold text-orange-900">Break timer:</h4>
            <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
              <li>The app starts a timer automatically</li>
              <li>You can see how much break time you have left</li>
              <li>Tap "End Break" when you're ready to resume</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            Break times are logged in your attendance record.
          </p>
        </div>
      )
    },
    {
      title: "Step 5: Clock Out",
      icon: LogOut,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            At the end of your shift (12:00 AM), <strong>clock out</strong> to complete your workday.
          </p>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-2">
            <h4 className="font-semibold text-orange-900 flex items-center gap-2">
              ⚠️ Important: Lockout Window
            </h4>
            <p className="text-sm text-orange-800">
              <strong>You CANNOT clock out between 11:45 PM and 12:00 AM.</strong> The system is locked during 
              this 15-minute window. Wait until midnight to clock out.
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-900">What happens when you clock out:</h4>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Your shift is marked complete</li>
              <li>Daily performance stats are finalized</li>
              <li>You can review your efficiency score and bonus potential</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            Tomorrow, the cycle starts again with Clock In!
          </p>
        </div>
      )
    },
    {
      title: "Other Features You'll Use",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Beyond your daily shift cycle, here are a few other helpful features:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messaging
              </h4>
              <p className="text-xs text-blue-800 mt-1">
                Chat with supervisors, report issues, ask questions
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <h4 className="font-semibold text-sm text-red-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Reports
              </h4>
              <p className="text-xs text-red-800 mt-1">
                Report accidents, damage, or safety concerns with photos
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 italic">
            These are accessible from the floating buttons on your dashboard.
          </p>
        </div>
      )
    },
    {
      title: "You're All Set!",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            That's the complete shift cycle! Remember: <strong>Clock In → Work → Break → Clock Out</strong>. 
            The app will guide you through each step.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Quick Recap:</h4>
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              <li>Start your shift by clocking in</li>
              <li>Check GPS map for routes</li>
              <li>Log each trip you complete</li>
              <li>Take break when supervisor announces</li>
              <li>Clock out at end of shift</li>
            </ol>
          </div>
          <p className="text-center text-sm font-semibold text-blue-900 mt-4">
            Welcome to the team! Let's get started. 🚀
          </p>
        </div>
      )
    }
  ];

  const inventoryDriverSteps = [
    {
      title: "Welcome to Your First Day!",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Hey {userName}! Welcome to the team. This quick tutorial will walk you through a typical shift 
            from start to finish. It takes about 2 minutes.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Don't worry:</span> You can always access help guides 
              from your dashboard anytime you need a refresher.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Clock In",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            When you arrive for your shift, the first thing you'll do is <strong>clock in</strong>.
          </p>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 space-y-2">
            <h4 className="font-semibold text-green-900">How to clock in:</h4>
            <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
              <li>Look for the "Start Shift" button on your dashboard</li>
              <li>Tap it once</li>
              <li>You'll see a confirmation message</li>
            </ol>
          </div>
          <p className="text-xs text-slate-600 italic">
            The app tracks your time automatically from this point forward.
          </p>
        </div>
      )
    },
    {
      title: "Step 2: Start Scanning",
      icon: Camera,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            After clocking in, open the <strong>Camera Scanner</strong> to start processing vehicles.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
            <h4 className="font-semibold text-blue-900">How the scanner works:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Point your camera at the VIN barcode or sticker</li>
              <li>The app reads it automatically (OCR technology)</li>
              <li>Verify the details and save</li>
            </ol>
          </div>
          <p className="text-xs text-slate-600 italic">
            You can also enter VINs and lot codes manually if needed.
          </p>
        </div>
      )
    },
    {
      title: "Step 3: Process Vehicles",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Continue scanning and logging vehicles throughout your shift. The app keeps track of your productivity.
          </p>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-2">
            <h4 className="font-semibold text-purple-900">What gets tracked:</h4>
            <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
              <li>Total vehicles scanned</li>
              <li>Accuracy rate (correct vs. errors)</li>
              <li>Efficiency score</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            Higher accuracy and productivity = better performance reviews and bonuses.
          </p>
        </div>
      )
    },
    {
      title: "Step 4: Take Your Break",
      icon: Coffee,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Your supervisor will announce break times. When it's time, tap the <strong>"Start Break"</strong> button.
          </p>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-2">
            <h4 className="font-semibold text-orange-900">Break timer:</h4>
            <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
              <li>The app starts a timer automatically</li>
              <li>You can see how much break time you have left</li>
              <li>Tap "End Break" when you're ready to resume</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            Break times are logged in your attendance record.
          </p>
        </div>
      )
    },
    {
      title: "Step 5: Clock Out",
      icon: LogOut,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            At the end of your shift, <strong>clock out</strong> to complete your workday.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-900">What happens when you clock out:</h4>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Your shift is marked complete</li>
              <li>Daily scan counts are finalized</li>
              <li>You can review your performance stats</li>
            </ul>
          </div>
          <p className="text-xs text-slate-600 italic">
            Tomorrow, the cycle starts again with Clock In!
          </p>
        </div>
      )
    },
    {
      title: "Other Features You'll Use",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Beyond your daily shift cycle, here are a few other helpful features:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messaging
              </h4>
              <p className="text-xs text-blue-800 mt-1">
                Chat with supervisors, report issues, ask questions
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <h4 className="font-semibold text-sm text-red-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Reports
              </h4>
              <p className="text-xs text-red-800 mt-1">
                Report damage or safety concerns with photos
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 italic">
            These are accessible from the floating buttons on your dashboard.
          </p>
        </div>
      )
    },
    {
      title: "You're All Set!",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            That's the complete shift cycle! Remember: <strong>Clock In → Scan → Break → Clock Out</strong>. 
            The app will guide you through each step.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Quick Recap:</h4>
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              <li>Start your shift by clocking in</li>
              <li>Open the camera scanner</li>
              <li>Scan vehicles throughout your shift</li>
              <li>Take break when supervisor announces</li>
              <li>Clock out at end of shift</li>
            </ol>
          </div>
          <p className="text-center text-sm font-semibold text-blue-900 mt-4">
            Welcome to the team! Let's get started. 🚀
          </p>
        </div>
      )
    }
  ];

  const steps = role === "van_driver" ? vanDriverSteps : inventoryDriverSteps;
  const totalSteps = steps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);
    onComplete();
  };

  if (!showTutorial) return null;

  return (
    <Dialog open={showTutorial} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              First Day Guide
            </Badge>
            <Badge variant="outline">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <IconComponent className="h-6 w-6 text-blue-600" />
            </div>
            {currentStepData.title}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                data-testid="button-tutorial-back"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleComplete}
              data-testid="button-tutorial-skip"
            >
              Skip Tutorial
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-tutorial-next"
            >
              {currentStep < totalSteps - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              ) : (
                <>
                  Let's Go!
                  <CheckCircle2 className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
