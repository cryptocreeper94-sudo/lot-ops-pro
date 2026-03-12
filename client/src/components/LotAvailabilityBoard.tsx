import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BentoTile } from "@/components/ui/bento-grid";
import { PremiumButton } from "@/components/ui/premium-button";
import { Warehouse, RefreshCw, MapPin, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface LotReport {
  section: string;
  availableSpots: number;
  timestamp: string;
  reportedBy: string;
  reportedByRole: string;
}

export function LotAvailabilityBoard() {
  const [reports, setReports] = useState<Record<string, LotReport>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLatestReports();
    const interval = setInterval(loadLatestReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLatestReports = async () => {
    try {
      const res = await fetch("/api/lot-reports?limit=100");
      if (res.ok) {
        const data = await res.json();
        const latest: Record<string, LotReport> = {};
        for (const report of data) {
          if (!latest[report.section] || new Date(report.timestamp) > new Date(latest[report.section].timestamp)) {
            latest[report.section] = report;
          }
        }
        setReports(latest);
      }
    } catch (error) {
      console.error("Failed to load lot reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLatestReports();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const allLots = ["501", "502", "503", "504", "505", "513", "514", "515", "516", "517", "518"];

  const getStatusConfig = (spots: number | null) => {
    if (spots === null) return { 
      bg: "from-slate-700 to-slate-800", 
      border: "border-slate-600",
      glow: "",
      text: "No Data",
      message: "Tap to report",
      icon: MapPin
    };
    if (spots === 0) return { 
      bg: "from-red-600 to-red-700", 
      border: "border-red-500",
      glow: "shadow-red-500/30 shadow-lg",
      text: "FULL",
      message: "Don't go here",
      icon: AlertTriangle
    };
    if (spots <= 2) return { 
      bg: "from-orange-500 to-orange-600", 
      border: "border-orange-400",
      glow: "shadow-orange-500/20 shadow-md",
      text: "ALMOST FULL",
      message: "Couple spots",
      icon: AlertTriangle
    };
    if (spots <= 4) return { 
      bg: "from-yellow-500 to-yellow-600", 
      border: "border-yellow-400",
      glow: "shadow-yellow-500/20 shadow-md",
      text: "FEW SPOTS",
      message: "A few left",
      icon: Clock
    };
    return { 
      bg: "from-green-500 to-green-600", 
      border: "border-green-400",
      glow: "shadow-green-500/30 shadow-lg",
      text: "OPEN",
      message: "Bring it here",
      icon: CheckCircle2
    };
  };

  const reportCount = Object.keys(reports).length;

  return (
    <BentoTile
      size="wide"
      variant="premium"
      sparkle={reportCount > 0}
      icon={<Warehouse className="h-5 w-5" />}
      title="Live Lot Availability"
      description="Real-time inventory lot status from driver reports"
      badge={reportCount > 0 ? `${reportCount} ACTIVE` : "AWAITING REPORTS"}
      action={
        <PremiumButton
          variant="glass"
          size="sm"
          onClick={handleRefresh}
          icon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          data-testid="button-refresh-availability"
        >
          Refresh
        </PremiumButton>
      }
      data-testid="tile-lot-availability"
    >
      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {allLots.map((lot) => {
              const report = reports[lot];
              const spots = report?.availableSpots ?? null;
              const config = getStatusConfig(spots);
              const StatusIcon = config.icon;

              return (
                <div 
                  key={lot} 
                  className="text-center group"
                  data-testid={`lot-availability-${lot}`}
                >
                  <div 
                    className={`
                      bg-gradient-to-br ${config.bg} 
                      rounded-xl p-2 sm:p-3
                      border ${config.border}
                      ${config.glow}
                      transition-all duration-300 
                      hover:scale-105 hover:shadow-xl
                      cursor-pointer
                      relative overflow-hidden
                    `}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <StatusIcon className="h-3 w-3 text-white/80" />
                      </div>
                      
                      <div className="font-bold text-white text-xs sm:text-sm">
                        {lot}
                      </div>
                      
                      <div className="text-white text-xl sm:text-2xl font-black drop-shadow-lg">
                        {spots !== null ? spots : "?"}
                      </div>
                      
                      <div className="text-[9px] sm:text-[10px] text-white/90 font-semibold uppercase tracking-wide">
                        {config.text}
                      </div>
                      
                      <div className="text-[8px] sm:text-[9px] text-white/70 font-medium mt-0.5 hidden sm:block">
                        {config.message}
                      </div>
                      
                      {report && (
                        <div className="text-[8px] text-white/50 mt-1 flex items-center justify-center gap-1">
                          <Clock className="h-2 w-2" />
                          {new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>

                    {spots !== null && spots >= 5 && (
                      <div className="absolute top-1 right-1">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Open (5+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Few (3-4)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Low (1-2)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Full (0)
            </span>
          </div>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Auto-refresh 30s
          </span>
        </div>
      </div>
    </BentoTile>
  );
}
