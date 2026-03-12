import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Users, Shield, MessageSquare, BarChart3, Settings, MapPin } from "lucide-react";

interface Capability {
  name: string;
  canDo: boolean;
  details: string;
}

interface CapabilityCategory {
  title: string;
  icon: any;
  color: string;
  capabilities: Capability[];
}

const SUPERVISOR_CAPABILITIES: CapabilityCategory[] = [
  {
    title: "Team Management",
    icon: Users,
    color: "blue",
    capabilities: [
      { name: "View All Driver Performance", canDo: true, details: "Real-time MPH, stats, leaderboards" },
      { name: "Send Messages to Drivers", canDo: true, details: "Individual or broadcast messages" },
      { name: "Override Break Timers", canDo: true, details: "Extend or end breaks early" },
      { name: "Assign Crew to Shifts", canDo: true, details: "Resource allocation dashboard" },
      { name: "Change Driver PINs", canDo: false, details: "Operations Manager only" },
      { name: "Create New Users", canDo: false, details: "Operations Manager or Developer" }
    ]
  },
  {
    title: "Performance & Reports",
    icon: BarChart3,
    color: "green",
    capabilities: [
      { name: "View Employee Reviews", canDo: true, details: "Daily, weekly, monthly reports" },
      { name: "Export Performance Data", canDo: true, details: "Download/print driver stats" },
      { name: "Edit Company News", canDo: true, details: "Update announcements" },
      { name: "Configure Shift Schedules", canDo: false, details: "Operations Manager only" },
      { name: "Generate Lifetime Reports", canDo: false, details: "Operations Manager only" },
      { name: "Access System Health Check", canDo: false, details: "Developer only" }
    ]
  },
  {
    title: "Safety & Incidents",
    icon: Shield,
    color: "red",
    capabilities: [
      { name: "View Safety Reports", canDo: true, details: "All incident reports" },
      { name: "Respond to Speed Violations", canDo: true, details: "Major violations (>10 mph)" },
      { name: "Review Incident Photos/Videos", canDo: true, details: "Full access to safety media" },
      { name: "Configure GPS Geofencing", canDo: false, details: "Developer only" },
      { name: "Delete Safety Records", canDo: false, details: "Permanent audit trail" }
    ]
  },
  {
    title: "Lot Configuration",
    icon: MapPin,
    color: "purple",
    capabilities: [
      { name: "Report Lot Spots Available", canDo: true, details: "Floating spot reporter" },
      { name: "Assign Overflow Locations", canDo: true, details: "When lots are full" },
      { name: "View Weekly Lane Maps", canDo: true, details: "Current and historical maps" },
      { name: "Upload New Lane Maps", canDo: false, details: "Operations Manager or Developer" },
      { name: "Edit Lot Capacity Limits", canDo: false, details: "Developer only" },
      { name: "Configure AI Suggestions", canDo: false, details: "Developer only" }
    ]
  },
  {
    title: "Messaging & Communication",
    icon: MessageSquare,
    color: "cyan",
    capabilities: [
      { name: "Send Official Messages", canDo: true, details: "Company-logged, tracked by management" },
      { name: "Send Private Messages", canDo: true, details: "Not stored long-term, privacy-first" },
      { name: "Message Other Supervisors", canDo: true, details: "Supervisor-to-supervisor chat" },
      { name: "View Private Message Content", canDo: false, details: "Sender/recipient only" },
      { name: "Delete Messages", canDo: false, details: "Automatic expiration only" }
    ]
  },
  {
    title: "System Settings",
    icon: Settings,
    color: "slate",
    capabilities: [
      { name: "Toggle Fun Pop-ups", canDo: true, details: "Enable/disable for their account" },
      { name: "Access Corporate Resources", canDo: true, details: "Cox hierarchy, benefits, etc." },
      { name: "View Privacy Policy", canDo: true, details: "Transparent data practices" },
      { name: "Change User Roles", canDo: false, details: "Operations Manager only" },
      { name: "Manage Terms of Service", canDo: false, details: "Developer only" },
      { name: "Access Version 2.0 Roadmap", canDo: false, details: "Operations Manager only" }
    ]
  }
];

export function SupervisorCapabilities() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Supervisor Capabilities Reference</h2>
          <p className="text-xs text-slate-500">Quick guide: What supervisors CAN and CANNOT do</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUPERVISOR_CAPABILITIES.map((category, idx) => {
          const Icon = category.icon;
          const canDoCount = category.capabilities.filter(c => c.canDo).length;
          const totalCount = category.capabilities.length;
          
          return (
            <Card key={idx} className="bg-white border-slate-200">
              <CardHeader className="pb-3 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`bg-${category.color}-100 p-1.5 rounded`}>
                      <Icon className={`h-4 w-4 text-${category.color}-600`} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {category.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {canDoCount}/{totalCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0">
                {category.capabilities.map((capability, capIdx) => (
                  <div 
                    key={capIdx}
                    className={`flex items-start gap-2 p-2 rounded ${
                      capability.canDo 
                        ? 'bg-green-50/50 border border-green-200/50' 
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {capability.canDo ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${
                        capability.canDo ? 'text-green-900' : 'text-slate-500'
                      }`}>
                        {capability.name}
                      </p>
                      <p className={`text-[10px] ${
                        capability.canDo ? 'text-green-700' : 'text-slate-400'
                      }`}>
                        {capability.details}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">
                Quick Delegation Guide
              </p>
              <ul className="text-[10px] text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Supervisors CAN handle:</strong> Day-to-day operations (messaging, performance reviews, safety responses, overflow assignments)</li>
                <li><strong>Operations Manager ONLY:</strong> System configuration (shift schedules, user roles, lane maps, business documentation)</li>
                <li><strong>Developer ONLY:</strong> Technical settings (lot capacity limits, AI configuration, system health, Terms of Service)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
