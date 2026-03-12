import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle, Coffee, LogOut } from "lucide-react";

interface ShiftProgressTimelineProps {
  currentStatus: "not_started" | "clocked_in" | "on_break" | "clocked_out";
  clockInTime?: string;
  breakTime?: string;
  clockOutTime?: string;
  shiftEndTime?: string;
}

export function ShiftProgressTimeline({ 
  currentStatus, 
  clockInTime, 
  breakTime, 
  clockOutTime,
  shiftEndTime = "12:00 AM"
}: ShiftProgressTimelineProps) {
  const steps = [
    {
      id: "clock_in",
      label: "Clock In",
      icon: Clock,
      time: clockInTime || "3:25-3:35 PM (on-time window)",
      completed: currentStatus !== "not_started",
      active: currentStatus === "clocked_in" && !breakTime,
    },
    {
      id: "active_work",
      label: "Active Work",
      icon: CheckCircle2,
      time: "In progress",
      completed: currentStatus === "on_break" || currentStatus === "clocked_out",
      active: currentStatus === "clocked_in" && !breakTime,
    },
    {
      id: "break",
      label: "Break",
      icon: Coffee,
      time: breakTime || "Supervisor will announce",
      completed: currentStatus === "clocked_out" && !!breakTime,
      active: currentStatus === "on_break",
    },
    {
      id: "clock_out",
      label: "Clock Out",
      icon: LogOut,
      time: clockOutTime || "12:00 AM (lockout: 11:45-12:00)",
      completed: currentStatus === "clocked_out",
      active: false,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Your Shift Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${step.completed ? 'bg-green-500 text-white' : 
                      step.active ? 'bg-blue-500 text-white animate-pulse' : 
                      'bg-slate-200 text-slate-400'}
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${
                        step.active ? 'text-blue-900' : 
                        step.completed ? 'text-green-900' : 
                        'text-slate-600'
                      }`}>
                        {step.label}
                      </h4>
                      {step.active && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          You are here
                        </Badge>
                      )}
                      {step.completed && !step.active && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {step.time}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={`
                    absolute left-5 top-10 w-0.5 h-6
                    ${step.completed ? 'bg-green-300' : 'bg-slate-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Tip */}
        <div className="mt-4 bg-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">💡 Tip:</span> Follow this timeline through your shift. 
            The app will guide you to each next step automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
