import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Clock,
  CheckCircle2,
  Zap
} from "lucide-react";

interface QuickStartGuideProps {
  role: "operations_manager" | "supervisor" | "van_driver" | "inventory_driver" | "safety_advisor";
  onTaskClick?: (taskId: string) => void;
}

export function QuickStartGuide({ role, onTaskClick }: QuickStartGuideProps) {
  const guides = {
    operations_manager: {
      title: "Quick Start Guide",
      subtitle: "Your top 4 tasks to get started",
      tasks: [
        {
          id: "view_team",
          icon: Users,
          title: "View Your Team",
          description: "Check active drivers, crews, and shift schedules",
          action: "Go to Team tab",
          color: "bg-blue-100 text-blue-700 border-blue-200"
        },
        {
          id: "check_messages",
          icon: MessageSquare,
          title: "Check Messages",
          description: "See driver communications and send updates",
          action: "Open Messages tab",
          color: "bg-purple-100 text-purple-700 border-purple-200"
        },
        {
          id: "view_reports",
          icon: BarChart3,
          title: "Performance Reports",
          description: "Review daily, weekly, and monthly performance stats",
          action: "Go to Reports tab",
          color: "bg-green-100 text-green-700 border-green-200"
        },
        {
          id: "manage_shifts",
          icon: Clock,
          title: "Shift Management",
          description: "Configure schedules, track attendance, manage breaks",
          action: "Open Shift Manager",
          color: "bg-orange-100 text-orange-700 border-orange-200"
        }
      ]
    },
    supervisor: {
      title: "Quick Start Guide",
      subtitle: "Your top 4 tasks to get started",
      tasks: [
        {
          id: "message_drivers",
          icon: MessageSquare,
          title: "Message Drivers",
          description: "Send instructions and check driver status",
          action: "Open Messages",
          color: "bg-purple-100 text-purple-700 border-purple-200"
        },
        {
          id: "view_crew",
          icon: Users,
          title: "View Your Crew",
          description: "Check who's active and their current performance",
          action: "Go to Team tab",
          color: "bg-blue-100 text-blue-700 border-blue-200"
        },
        {
          id: "track_performance",
          icon: BarChart3,
          title: "Track Performance",
          description: "Monitor daily stats and identify issues",
          action: "Go to Reports",
          color: "bg-green-100 text-green-700 border-green-200"
        },
        {
          id: "override_breaks",
          icon: Clock,
          title: "Override Controls",
          description: "Adjust breaks, fix clock-ins, update records",
          action: "Use Override Tools",
          color: "bg-orange-100 text-orange-700 border-orange-200"
        }
      ]
    },
    van_driver: {
      title: "Quick Start Guide",
      subtitle: "Your top 3 tasks for each shift",
      tasks: [
        {
          id: "start_shift",
          icon: Clock,
          title: "Start Your Shift",
          description: "Clock in and activate your route tracking",
          action: "Tap 'Start Shift'",
          color: "bg-green-100 text-green-700 border-green-200"
        },
        {
          id: "check_route",
          icon: Zap,
          title: "Check Your Route",
          description: "View pickup and drop-off locations on the map",
          action: "Open GPS Map",
          color: "bg-blue-100 text-blue-700 border-blue-200"
        },
        {
          id: "log_trips",
          icon: CheckCircle2,
          title: "Log Your Trips",
          description: "Record each vehicle move as you complete them",
          action: "Use Trip Counter",
          color: "bg-purple-100 text-purple-700 border-purple-200"
        }
      ]
    },
    inventory_driver: {
      title: "Quick Start Guide",
      subtitle: "Your top 3 tasks for each shift",
      tasks: [
        {
          id: "start_shift",
          icon: Clock,
          title: "Start Your Shift",
          description: "Clock in and get ready to scan",
          action: "Tap 'Start Shift'",
          color: "bg-green-100 text-green-700 border-green-200"
        },
        {
          id: "use_scanner",
          icon: Zap,
          title: "Use OCR Scanner",
          description: "Scan VINs and lot codes with your phone camera",
          action: "Open Scanner",
          color: "bg-blue-100 text-blue-700 border-blue-200"
        },
        {
          id: "report_safety",
          icon: CheckCircle2,
          title: "Report Issues",
          description: "Document safety concerns or vehicle damage",
          action: "Safety Report Button",
          color: "bg-orange-100 text-orange-700 border-orange-200"
        }
      ]
    },
    safety_advisor: {
      title: "Quick Start Guide",
      subtitle: "Your top 4 tasks to get started",
      tasks: [
        {
          id: "review_incidents",
          icon: BarChart3,
          title: "Review Incidents",
          description: "Check recent safety reports and violations",
          action: "Go to Reports tab",
          color: "bg-red-100 text-red-700 border-red-200"
        },
        {
          id: "speed_monitoring",
          icon: Zap,
          title: "Speed Monitoring",
          description: "Track driver speed violations and patterns",
          action: "View Speed Stats",
          color: "bg-orange-100 text-orange-700 border-orange-200"
        },
        {
          id: "message_team",
          icon: MessageSquare,
          title: "Message Team",
          description: "Send safety updates and reminders",
          action: "Open Messages",
          color: "bg-purple-100 text-purple-700 border-purple-200"
        },
        {
          id: "view_analytics",
          icon: BarChart3,
          title: "Safety Analytics",
          description: "Review trends and identify high-risk areas",
          action: "Go to Analytics",
          color: "bg-green-100 text-green-700 border-green-200"
        }
      ]
    }
  };

  const guide = guides[role];

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-600" />
              {guide.title}
            </CardTitle>
            <p className="text-xs text-slate-600 mt-1">{guide.subtitle}</p>
          </div>
          <Badge variant="outline" className="bg-white border-cyan-300 text-cyan-700">
            Start Here
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guide.tasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <div
                key={task.id}
                className={`${task.color} rounded-lg p-3 border transition-all hover:shadow-md cursor-pointer`}
                onClick={() => onTaskClick?.(task.id)}
                data-testid={`quickstart-${task.id}`}
              >
                <div className="flex items-start gap-2">
                  <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                    <p className="text-xs opacity-80 leading-relaxed mb-2">
                      {task.description}
                    </p>
                    <div className="text-xs font-medium opacity-90">
                      → {task.action}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
