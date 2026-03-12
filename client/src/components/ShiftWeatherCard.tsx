import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  CalendarIcon,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Timer,
  Car,
  Activity,
  User,
  ClipboardList,
  StickyNote,
  History,
  Play,
  Square,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftWeatherLog {
  id: number;
  userId: string;
  userName: string;
  userRole: string;
  userPhoneLast4?: string;
  date: string;
  dayOfWeek: string;
  shiftType: string;
  clockInTime: string;
  clockOutTime?: string;
  shiftStatus: string;
  assignedRole?: string;
  assignedCrew?: string;
  assignedVanDriver?: string;
  assignedLots?: string;
  assignedZone?: string;
  assignmentNotes?: string;
  weatherTemp?: string;
  weatherTempHigh?: string;
  weatherTempLow?: string;
  weatherCondition?: string;
  weatherIcon?: string;
  weatherHumidity?: string;
  weatherWindSpeed?: string;
  weatherWindDirection?: string;
  weatherPrecipitation?: string;
  weatherSunrise?: string;
  weatherSunset?: string;
  weatherAlert?: string;
  locationName?: string;
  totalMoves?: number;
  totalHoursWorked?: string;
  totalMilesDriven?: string;
  avgMovesPerHour?: string;
  efficiencyScore?: number;
  quotaTarget?: number;
  quotaAchieved?: boolean;
  breakDurationMinutes?: number;
  lunchDurationMinutes?: number;
  overtimeMinutes?: number;
  incidentsCount?: number;
  shiftNotes?: string;
  supervisorNotes?: string;
  reviewedBySupervisor?: boolean;
  isSandboxEntry?: boolean;
  createdAt: string;
}

interface ShiftWeatherCardProps {
  userId?: string;
  userName?: string;
  userRole?: string;
  compact?: boolean;
  showClockIn?: boolean;
  onShiftStart?: (log: ShiftWeatherLog) => void;
  onShiftEnd?: (log: ShiftWeatherLog) => void;
}

const getWeatherIcon = (condition?: string) => {
  if (!condition) return <Cloud className="h-6 w-6 text-gray-400" />;
  const lower = condition.toLowerCase();
  if (lower.includes("clear") || lower.includes("sunny")) return <Sun className="h-6 w-6 text-yellow-400" />;
  if (lower.includes("rain") || lower.includes("shower")) return <CloudRain className="h-6 w-6 text-blue-400" />;
  if (lower.includes("snow")) return <CloudSnow className="h-6 w-6 text-blue-200" />;
  if (lower.includes("thunder") || lower.includes("storm")) return <CloudLightning className="h-6 w-6 text-purple-400" />;
  return <Cloud className="h-6 w-6 text-gray-400" />;
};

const getShiftTypeBadge = (shiftType: string) => {
  switch (shiftType) {
    case "first_shift":
      return <Badge className="bg-blue-600 text-white">1st Shift</Badge>;
    case "second_shift":
      return <Badge className="bg-purple-600 text-white">2nd Shift</Badge>;
    case "saturday_shift":
      return <Badge className="bg-orange-600 text-white">Saturday</Badge>;
    default:
      return <Badge variant="outline">{shiftType}</Badge>;
  }
};

interface PublicWeather {
  temp: string;
  tempHigh: string;
  tempLow: string;
  condition: string;
  icon: string;
  humidity: string;
  windSpeed: string;
  windDirection: string;
  precipitation: string;
  uvIndex: string;
  sunrise: string;
  sunset: string;
  locationName: string;
  latitude: string;
  longitude: string;
  timestamp: string;
}

export function ShiftWeatherCard({
  userId,
  userName,
  userRole,
  compact = false,
  showClockIn = true,
  onShiftStart,
  onShiftEnd
}: ShiftWeatherCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [searchDate, setSearchDate] = useState<Date>();
  const [selectedLog, setSelectedLog] = useState<ShiftWeatherLog | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const dayOfWeek = format(new Date(), "EEEE");

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setGpsError(null);
        },
        (error) => {
          console.log("GPS error:", error.message);
          setGpsError("GPS unavailable");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGpsError("GPS not supported");
    }
  }, []);

  // Load saved weather preference from localStorage
  useEffect(() => {
    const savedZip = localStorage.getItem('weatherZipcode');
    if (savedZip) {
      setZipcode(savedZip);
      setSearchZip(savedZip);
    }
  }, []);

  // Save weather preference to localStorage and database when changed
  const saveWeatherPreference = async (zip: string, locationName: string) => {
    localStorage.setItem('weatherZipcode', zip);
    localStorage.setItem('weatherLocationName', locationName);
    
    // Save to database if user is logged in
    if (userId) {
      try {
        await fetch('/api/user-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            weatherZipcode: zip,
            weatherLocationName: locationName
          })
        });
      } catch (error) {
        console.log('Could not save weather preference to database');
      }
    }
  };

  // Public weather query - works for anyone, no login required
  const { data: publicWeather, isLoading: loadingPublicWeather, refetch: refetchWeather } = useQuery<PublicWeather>({
    queryKey: ["/api/weather", searchZip, gpsCoords?.lat, gpsCoords?.lon],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchZip) {
        params.append("zipcode", searchZip);
      } else if (gpsCoords) {
        params.append("lat", String(gpsCoords.lat));
        params.append("lon", String(gpsCoords.lon));
      }
      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      // Save location preference when weather is fetched
      if (searchZip && data.locationName) {
        saveWeatherPreference(searchZip, data.locationName);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const { data: todayLog, isLoading: loadingToday } = useQuery<ShiftWeatherLog>({
    queryKey: ["/api/shift-logs", { date: today, userId }],
    queryFn: async () => {
      const params = new URLSearchParams({ date: today });
      if (userId) params.append("userId", userId);
      const res = await fetch(`/api/shift-logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch shift log");
      const logs = await res.json();
      return logs.find((log: ShiftWeatherLog) => log.userId === userId) || null;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: shiftHistory = [] } = useQuery<ShiftWeatherLog[]>({
    queryKey: ["/api/shift-logs/history", userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      const res = await fetch(`/api/shift-logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch shift history");
      return res.json();
    },
    enabled: !!userId && showHistory,
  });

  const { data: searchResults = [] } = useQuery<ShiftWeatherLog[]>({
    queryKey: ["/api/shift-logs/search", searchDate],
    queryFn: async () => {
      if (!searchDate) return [];
      const dateStr = format(searchDate, "yyyy-MM-dd");
      const res = await fetch(`/api/shift-logs?date=${dateStr}`);
      if (!res.ok) throw new Error("Failed to search shifts");
      return res.json();
    },
    enabled: !!searchDate,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !userName || !userRole) {
        throw new Error("User information required to clock in");
      }
      if (!gpsCoords) {
        throw new Error("GPS_REQUIRED");
      }
      const res = await fetch("/api/shift-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName,
          userRole,
          date: today,
          dayOfWeek,
          shiftType: new Date().getHours() < 12 ? "first_shift" : "second_shift",
          clockInTime: new Date().toISOString(),
          latitude: String(gpsCoords.lat),
          longitude: String(gpsCoords.lon),
          locationName: publicWeather?.locationName || "Current Location"
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.code === "GPS_REQUIRED") {
          throw new Error("GPS_REQUIRED");
        }
        throw new Error("Failed to clock in");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-logs"] });
      toast({ title: "Clocked In", description: "Your shift has started. Weather conditions captured." });
      onShiftStart?.(data);
    },
    onError: (error: Error) => {
      if (error.message === "GPS_REQUIRED") {
        toast({ 
          title: "GPS Required", 
          description: "Please enable GPS location to clock in and log your shift.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: "Failed to clock in. Please try again.", variant: "destructive" });
      }
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (logId: number) => {
      const res = await fetch(`/api/shift-logs/${logId}/clock-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clockOutTime: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to clock out");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-logs"] });
      toast({ title: "Clocked Out", description: `Shift completed. Total hours: ${data.totalHoursWorked || "Calculating..."}` });
      onShiftEnd?.(data);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to clock out. Please try again.", variant: "destructive" });
    },
  });

  const renderWeatherSection = (log: ShiftWeatherLog) => (
    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg">
      <div className="flex items-center gap-2">
        {getWeatherIcon(log.weatherCondition)}
        <div>
          <p className="font-bold text-lg text-white">{log.weatherTemp || "--"}</p>
          <p className="text-xs text-blue-200">{log.weatherCondition || "Unknown"}</p>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <p className="text-blue-300">High</p>
          <p className="font-medium text-white">{log.weatherTempHigh || "--"}</p>
        </div>
        <div>
          <p className="text-blue-300">Low</p>
          <p className="font-medium text-white">{log.weatherTempLow || "--"}</p>
        </div>
        <div>
          <p className="text-blue-300">Wind</p>
          <p className="font-medium text-white">{log.weatherWindSpeed || "--"}</p>
        </div>
      </div>
    </div>
  );

  const renderMetrics = (log: ShiftWeatherLog) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
      <div className="bg-slate-800/50 rounded-lg p-2">
        <Car className="h-4 w-4 mx-auto text-green-400 mb-1" />
        <p className="text-lg font-bold text-white">{log.totalMoves || 0}</p>
        <p className="text-[10px] text-slate-400">Moves</p>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-2">
        <Timer className="h-4 w-4 mx-auto text-blue-400 mb-1" />
        <p className="text-lg font-bold text-white">{log.totalHoursWorked || "--"}</p>
        <p className="text-[10px] text-slate-400">Hours</p>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-2">
        <Activity className="h-4 w-4 mx-auto text-yellow-400 mb-1" />
        <p className="text-lg font-bold text-white">{log.avgMovesPerHour || "--"}</p>
        <p className="text-[10px] text-slate-400">MPH</p>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-2">
        <CheckCircle2 className={cn("h-4 w-4 mx-auto mb-1", log.quotaAchieved ? "text-green-400" : "text-slate-500")} />
        <p className="text-lg font-bold text-white">{log.efficiencyScore || "--"}%</p>
        <p className="text-[10px] text-slate-400">Efficiency</p>
      </div>
    </div>
  );

  const renderAssignment = (log: ShiftWeatherLog) => (
    <div className="bg-slate-800/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <ClipboardList className="h-4 w-4 text-purple-400" />
        <span className="text-slate-300">Assignment</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {log.assignedRole && (
          <div>
            <span className="text-slate-400">Role: </span>
            <span className="text-white font-medium">{log.assignedRole}</span>
          </div>
        )}
        {log.assignedCrew && (
          <div>
            <span className="text-slate-400">Crew: </span>
            <span className="text-white font-medium">{log.assignedCrew}</span>
          </div>
        )}
        {log.assignedLots && (
          <div>
            <span className="text-slate-400">Lots: </span>
            <span className="text-white font-medium">{log.assignedLots}</span>
          </div>
        )}
        {log.assignedZone && (
          <div>
            <span className="text-slate-400">Zone: </span>
            <span className="text-white font-medium">{log.assignedZone}</span>
          </div>
        )}
      </div>
      {log.assignmentNotes && (
        <p className="text-xs text-slate-400 italic">{log.assignmentNotes}</p>
      )}
    </div>
  );

  const renderNotes = (log: ShiftWeatherLog) => {
    if (!log.shiftNotes && !log.supervisorNotes) return null;
    return (
      <div className="bg-slate-800/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <StickyNote className="h-4 w-4 text-yellow-400" />
          <span className="text-slate-300">Notes</span>
        </div>
        {log.shiftNotes && (
          <p className="text-xs text-slate-300">{log.shiftNotes}</p>
        )}
        {log.supervisorNotes && (
          <div className="pt-2 border-t border-slate-700">
            <p className="text-[10px] text-slate-400 mb-1">Supervisor Notes:</p>
            <p className="text-xs text-yellow-200">{log.supervisorNotes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderShiftLogDetail = (log: ShiftWeatherLog) => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{log.dayOfWeek}, {log.date}</h3>
          <div className="flex items-center gap-2 mt-1">
            {getShiftTypeBadge(log.shiftType)}
            <Badge variant={log.shiftStatus === "completed" ? "default" : "secondary"}>
              {log.shiftStatus === "completed" ? "Completed" : "Active"}
            </Badge>
            {log.isSandboxEntry && <Badge variant="outline" className="text-purple-400 border-purple-400">Sandbox</Badge>}
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-400">Clock In</p>
          <p className="font-medium text-white">
            {log.clockInTime ? format(parseISO(log.clockInTime), "h:mm a") : "--"}
          </p>
          {log.clockOutTime && (
            <>
              <p className="text-slate-400 mt-1">Clock Out</p>
              <p className="font-medium text-white">{format(parseISO(log.clockOutTime), "h:mm a")}</p>
            </>
          )}
        </div>
      </div>

      {/* Weather */}
      {renderWeatherSection(log)}

      {/* Metrics */}
      {renderMetrics(log)}

      {/* Assignment */}
      {(log.assignedRole || log.assignedCrew || log.assignedLots) && renderAssignment(log)}

      {/* Notes */}
      {renderNotes(log)}

      {/* Location */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin className="h-3 w-3" />
        <span>{log.locationName || "Unknown Location"}</span>
      </div>
    </div>
  );

  // Helper to render public weather (for anyone, no login required)
  const renderPublicWeather = () => {
    if (loadingPublicWeather) {
      return (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
        </div>
      );
    }
    if (!publicWeather) return null;
    return (
      <div className="flex items-center gap-4 p-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg">
        <div className="flex items-center gap-2">
          {getWeatherIcon(publicWeather.condition)}
          <div>
            <p className="font-bold text-lg text-white">{publicWeather.temp}</p>
            <p className="text-xs text-blue-200">{publicWeather.condition}</p>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-3 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <Thermometer className="h-3 w-3 text-orange-400" />
            <span>H: {publicWeather.tempHigh} / L: {publicWeather.tempLow}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Wind className="h-3 w-3 text-cyan-400" />
            <span>{publicWeather.windSpeed} {publicWeather.windDirection}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Droplets className="h-3 w-3 text-blue-400" />
            <span>{publicWeather.humidity}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <MapPin className="h-3 w-3 text-green-400" />
            <span className="truncate">{publicWeather.locationName}</span>
          </div>
        </div>
      </div>
    );
  };

  // Compact view for embedding in dashboards
  if (compact) {
    // Show weather for anyone (with zipcode lookup) - no login required for viewing
    if (!userId) {
      return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{dayOfWeek} Weather</span>
              </div>
              {gpsCoords ? (
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  GPS Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                  No GPS
                </Badge>
              )}
            </div>
            
            {renderPublicWeather()}
            
            {/* Zipcode search */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter zipcode..."
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                className="h-8 text-xs bg-slate-800 border-slate-600"
                data-testid="input-zipcode"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSearchZip(zipcode)}
                className="h-8 px-3"
                data-testid="button-search-weather"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-xs text-center text-slate-400">
              Log in with GPS to track shifts
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
        <CardContent className="p-3">
          {loadingToday ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
            </div>
          ) : todayLog ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">{dayOfWeek}</span>
                  {getShiftTypeBadge(todayLog.shiftType)}
                </div>
                {todayLog.shiftStatus === "active" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => clockOutMutation.mutate(todayLog.id)}
                    disabled={clockOutMutation.isPending}
                    className="h-7 text-xs"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Clock Out
                  </Button>
                )}
              </div>
              {renderWeatherSection(todayLog)}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  <History className="h-3 w-3 mr-1" />
                  View History
                </Button>
                {todayLog.totalMoves !== undefined && (
                  <span className="text-xs text-slate-400">
                    {todayLog.totalMoves} moves today
                  </span>
                )}
              </div>
            </div>
          ) : showClockIn ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400 mb-3">No active shift today</p>
              <Button
                onClick={() => clockInMutation.mutate()}
                disabled={clockInMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Shift
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">No shift logged today</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="mt-2 text-xs text-blue-400"
              >
                <History className="h-3 w-3 mr-1" />
                View Past Shifts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <>
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-white">Shift Tracker</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingToday ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : todayLog ? (
            <>
              {renderShiftLogDetail(todayLog)}
              {todayLog.shiftStatus === "active" && (
                <Button
                  onClick={() => clockOutMutation.mutate(todayLog.id)}
                  disabled={clockOutMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              )}
            </>
          ) : showClockIn ? (
            <div className="text-center py-8">
              <Sun className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Ready to Start Your Shift?</p>
              <p className="text-sm text-slate-400 mb-4">
                {dayOfWeek}, {format(new Date(), "MMMM d, yyyy")}
              </p>
              <Button
                onClick={() => clockInMutation.mutate()}
                disabled={clockInMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Shift
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-lg font-medium text-white mb-2">No Shift Today</p>
              <p className="text-sm text-slate-400">Check the history to view past shifts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <History className="h-5 w-5 text-blue-400" />
              Shift History
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Search and view past shift records with weather conditions
            </DialogDescription>
          </DialogHeader>

          {/* Date Search */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal border-slate-600",
                    !searchDate && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, "PPP") : "Search by date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={setSearchDate}
                  initialFocus
                  className="bg-slate-800"
                />
              </PopoverContent>
            </Popover>
            {searchDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchDate(undefined)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {(searchDate ? searchResults : shiftHistory).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No shifts found</p>
                </div>
              ) : (
                (searchDate ? searchResults : shiftHistory).map((log) => (
                  <Card
                    key={log.id}
                    className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{log.dayOfWeek}</span>
                            <span className="text-sm text-slate-400">{log.date}</span>
                            {getShiftTypeBadge(log.shiftType)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              {getWeatherIcon(log.weatherCondition)}
                              {log.weatherTemp}
                            </span>
                            <span>{log.totalMoves || 0} moves</span>
                            <span>{log.totalHoursWorked || "--"} hrs</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Selected Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Shift Details</DialogTitle>
            <DialogDescription className="sr-only">View complete details for the selected shift</DialogDescription>
          </DialogHeader>
          {selectedLog && renderShiftLogDetail(selectedLog)}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShiftWeatherCard;
