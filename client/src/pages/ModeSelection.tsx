import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Truck, 
  Package, 
  Clock, 
  Wrench,
  Sparkles,
  ChevronRight,
  User,
  Trophy,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BetaWelcomeModal } from "@/components/BetaWelcomeModal";
import { WeeklyMapViewer } from "@/components/WeeklyMapViewer";
import { ActiveWeekBanner } from "@/components/ActiveWeekBanner";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { WelcomeTrigger } from "@/components/WelcomeTrigger";
import { Footer } from "@/components/Footer";
import { NavigationControl } from "@/components/NavigationControl";
import { SafetyButton } from "@/components/SafetyButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DriverRole {
  id: string;
  title: string;
  description: string;
  icon: typeof Truck;
  route: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
}

const DRIVER_ROLES: DriverRole[] = [
  {
    id: "van",
    title: "Van Driver",
    description: "Standard lot moves & quota tracking",
    icon: Truck,
    route: "/driver-dashboard?mode=bulk",
    gradient: "from-blue-600/20 via-blue-700/10 to-indigo-800/20",
    borderColor: "border-blue-500/40",
    iconBg: "bg-blue-500/20 text-blue-400"
  },
  {
    id: "inventory",
    title: "Inventory Driver",
    description: "Scan & organize vehicle inventory",
    icon: Package,
    route: "/scanner",
    gradient: "from-emerald-600/20 via-emerald-700/10 to-teal-800/20",
    borderColor: "border-emerald-500/40",
    iconBg: "bg-emerald-500/20 text-emerald-400"
  },
  {
    id: "temporary",
    title: "Temporary Driver",
    description: "Daily assignments & training mode",
    icon: Clock,
    route: "/driver-dashboard?mode=training",
    gradient: "from-amber-600/20 via-amber-700/10 to-orange-800/20",
    borderColor: "border-amber-500/40",
    iconBg: "bg-amber-500/20 text-amber-400"
  },
  {
    id: "maintenance",
    title: "Maintenance Truck",
    description: "Equipment & facility support",
    icon: Wrench,
    route: "/driver-dashboard?mode=maintenance",
    gradient: "from-purple-600/20 via-purple-700/10 to-violet-800/20",
    borderColor: "border-purple-500/40",
    iconBg: "bg-purple-500/20 text-purple-400"
  }
];

export default function ModeSelection() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [showWeeklyMap, setShowWeeklyMap] = useState(false);

  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleRoleSelect = (role: DriverRole) => {
    toast({
      title: `${role.title} Mode`,
      description: `Starting ${role.title.toLowerCase()} workflow...`,
    });
    setLocation(role.route);
  };

  return (
    <div className="min-h-screen dashboard-premium p-4 pb-24 relative scrollbar-premium page-enter">
      <WelcomeTrigger userName={user?.name} userRole={user?.role} />
      <NavigationControl variant="back" fallbackRoute="/" />
      <DemoModeBanner />
      
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900 via-transparent to-transparent" />

      <div className="w-full max-w-lg mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center space-y-2 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <span 
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Select Your Role
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Choose your assigned workflow for today</p>
        </motion.div>

        {/* Driver Profile Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card 
              className="p-4 bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border-slate-700/50 backdrop-blur-sm cursor-pointer hover-elevate"
              onClick={() => setLocation("/driver-profile")}
              data-testid="card-driver-profile"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'D'}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{user.name || 'Driver'}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-amber-400" />
                    <span>Top Performer</span>
                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-300">
                      #{user.driverNumber || '001'}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Driver Role Selection - Premium Bento Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Driver Roles
          </h2>
          
          {/* 2x2 Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            {DRIVER_ROLES.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Card
                  className={`relative p-4 h-[140px] cursor-pointer overflow-hidden bg-gradient-to-br ${role.gradient} ${role.borderColor} border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                  onClick={() => handleRoleSelect(role)}
                  data-testid={`tile-${role.id}-driver`}
                >
                  {/* Sparkle effect */}
                  <div className="absolute top-2 right-2 opacity-60">
                    <Sparkles className="h-3 w-3 text-white/40" />
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${role.iconBg} flex items-center justify-center mb-3`}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="font-semibold text-white text-sm mb-1">{role.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-tight">{role.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Week Banner */}
        <ActiveWeekBanner />

        {/* Quick Actions Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              <Card 
                className="shrink-0 w-36 p-3 bg-slate-800/50 border-slate-700/50 cursor-pointer hover-elevate"
                onClick={() => setShowWeeklyMap(true)}
                data-testid="quick-action-map"
              >
                <div className="text-xs font-medium text-white mb-1">Weekly Map</div>
                <div className="text-[10px] text-slate-400">View lot layout</div>
              </Card>
              
              <Card 
                className="shrink-0 w-36 p-3 bg-slate-800/50 border-slate-700/50 cursor-pointer hover-elevate"
                onClick={() => setLocation("/my-activity")}
                data-testid="quick-action-activity"
              >
                <div className="text-xs font-medium text-white mb-1">My Activity</div>
                <div className="text-[10px] text-slate-400">View your stats</div>
              </Card>
              
              <Card 
                className="shrink-0 w-36 p-3 bg-slate-800/50 border-slate-700/50 cursor-pointer hover-elevate"
                onClick={() => setLocation("/ev-charging")}
                data-testid="quick-action-ev"
              >
                <div className="text-xs font-medium text-white mb-1">EV Charging</div>
                <div className="text-[10px] text-slate-400">Track EV stations</div>
              </Card>
              
              <Card 
                className="shrink-0 w-36 p-3 bg-red-900/30 border-red-500/30 cursor-pointer hover-elevate"
                onClick={() => {
                  localStorage.removeItem("vanops_user");
                  setLocation("/");
                }}
                data-testid="quick-action-signout"
              >
                <div className="text-xs font-medium text-red-300 mb-1 flex items-center gap-1">
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </div>
                <div className="text-[10px] text-red-400/70">End session</div>
              </Card>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
      </div>

      {/* Modals */}
      <BetaWelcomeModal />
      <WeeklyMapViewer open={showWeeklyMap} onClose={() => setShowWeeklyMap(false)} />
      
      <SafetyButton />
      <Footer />
    </div>
  );
}
