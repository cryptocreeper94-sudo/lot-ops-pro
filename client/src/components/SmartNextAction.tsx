import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, CheckCircle2, Lock, Clock } from "lucide-react";

interface SmartNextActionProps {
  currentStatus: "not_started" | "clocked_in" | "on_break" | "clocked_out";
  role: "van_driver" | "inventory_driver";
  onActionClick: (action: string) => void;
}

// Check if current time is in lockout window (11:45 PM - 12:00 AM)
const isInLockoutWindow = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 11:45 PM = 23:45 to midnight (0:00)
  if (hours === 23 && minutes >= 45) return true;
  if (hours === 0 && minutes === 0) return true;
  
  return false;
};

// Check clock-in timing status
const getClockInStatus = (): "too_early" | "on_time" | "late" | "way_late" => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Second shift times
  const earliestClockIn = 15 * 60 + 25; // 3:25 PM = 925 minutes
  const onTimeDeadline = 15 * 60 + 35; // 3:35 PM = 935 minutes
  
  if (totalMinutes < earliestClockIn) return "too_early";
  if (totalMinutes <= onTimeDeadline) return "on_time";
  if (totalMinutes <= onTimeDeadline + 15) return "late"; // Within 15 min of deadline
  return "way_late";
};

export function SmartNextAction({ currentStatus, role, onActionClick }: SmartNextActionProps) {
  const inLockout = isInLockoutWindow();
  const clockInStatus = getClockInStatus();
  
  const getNextAction = () => {
    if (currentStatus === "not_started") {
      let description = "Clock in to begin tracking your work";
      let color = "bg-gradient-to-r from-green-500 to-emerald-600";
      
      if (clockInStatus === "too_early") {
        description = "Too early! Clock-in starts at 3:25 PM";
        color = "bg-gradient-to-r from-orange-500 to-amber-600";
      } else if (clockInStatus === "on_time") {
        description = "On-time window (3:25-3:35 PM) - Clock in now!";
        color = "bg-gradient-to-r from-green-500 to-emerald-600";
      } else if (clockInStatus === "late") {
        description = "⚠️ Late! Clock in ASAP (deadline was 3:35 PM)";
        color = "bg-gradient-to-r from-orange-500 to-red-600";
      } else {
        description = "🚨 Very late - clock in immediately";
        color = "bg-gradient-to-r from-red-500 to-red-700";
      }
      
      return {
        title: "Start Your Shift",
        description,
        action: "clock_in",
        buttonText: clockInStatus === "too_early" ? "Too Early" : "Clock In Now",
        icon: "⏰",
        color
      };
    }

    if (currentStatus === "clocked_in") {
      if (role === "van_driver") {
        return {
          title: "Check Your Route",
          description: "View pickup and drop-off locations on the GPS map",
          action: "view_map",
          buttonText: "Open GPS Map",
          icon: "🗺️",
          color: "bg-gradient-to-r from-blue-500 to-cyan-600"
        };
      } else {
        return {
          title: "Start Scanning",
          description: "Use the camera to scan VINs and lot codes",
          action: "open_scanner",
          buttonText: "Open Scanner",
          icon: "📸",
          color: "bg-gradient-to-r from-blue-500 to-cyan-600"
        };
      }
    }

    if (currentStatus === "on_break") {
      return {
        title: "Break Time",
        description: "Rest up! Resume work when you're ready",
        action: "resume_work",
        buttonText: "End Break",
        icon: "☕",
        color: "bg-gradient-to-r from-orange-500 to-amber-600"
      };
    }

    if (currentStatus === "clocked_out") {
      return {
        title: "Shift Complete",
        description: "Great work today! Check your performance stats",
        action: "view_stats",
        buttonText: "View My Stats",
        icon: "🎯",
        color: "bg-gradient-to-r from-purple-500 to-indigo-600"
      };
    }

    return null;
  };

  const nextAction = getNextAction();
  if (!nextAction) return null;

  // Show lockout warning if trying to clock out during restricted window
  const showLockoutWarning = inLockout && currentStatus === "clocked_in" && !nextAction.action.includes("break");
  
  // Show clock-in timing warning
  const showClockInWarning = currentStatus === "not_started" && clockInStatus === "too_early";

  return (
    <div className="space-y-3">
      {showLockoutWarning && (
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm">Clock-Out Lockout Window</h4>
                <p className="text-white/90 text-xs mt-0.5">
                  You cannot clock out between 11:45 PM - 12:00 AM. Please wait until midnight.
                </p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showClockInWarning && (
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 border-0 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm">Clock-In Opens at 3:25 PM</h4>
                <p className="text-white/90 text-xs mt-0.5">
                  On-time window: 3:25-3:35 PM. After 3:35 PM you'll be marked late.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className={`${nextAction.color} border-0 shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl flex-shrink-0">
              {nextAction.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-white" />
                <h3 className="font-bold text-white text-sm">NEXT STEP</h3>
              </div>
              <h4 className="font-bold text-white text-lg leading-tight">
                {nextAction.title}
              </h4>
              <p className="text-white/90 text-xs mt-1">
                {nextAction.description}
              </p>
            </div>
            <Button
              onClick={() => onActionClick(nextAction.action)}
              disabled={(inLockout && nextAction.action === "clock_out") || (clockInStatus === "too_early" && nextAction.action === "clock_in")}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={`button-next-${nextAction.action}`}
            >
              {inLockout && nextAction.action === "clock_out" ? (
                <>
                  <Lock className="h-4 w-4 mr-1.5" />
                  Locked
                </>
              ) : clockInStatus === "too_early" && nextAction.action === "clock_in" ? (
                <>
                  <Clock className="h-4 w-4 mr-1.5" />
                  Too Early
                </>
              ) : (
                <>
                  {nextAction.buttonText}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
