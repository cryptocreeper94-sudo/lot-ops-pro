import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Users, Zap } from "lucide-react";

interface DriverMetrics {
  driverNumber: string;
  driverName: string;
  role: "van_driver" | "inventory_driver";
  movesPerHour: number;
  totalMovesShift: number;
  efficiency: number;
  lastActive: string;
  scanParticipation: number;
}

interface PerformanceDashboardProps {
  supervisorId?: number;
}

export function PerformanceDashboard({ supervisorId }: PerformanceDashboardProps) {
  const [drivers, setDrivers] = useState<DriverMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [participationRate, setParticipationRate] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/performance/driver-metrics");
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.drivers);
          setParticipationRate(data.participationRate);
        }
      } catch (err) {
        console.error("Failed to fetch driver metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const vanDrivers = drivers.filter(d => d.role === "van_driver");
  const inventoryDrivers = drivers.filter(d => d.role === "inventory_driver");

  const avgVanMPH = vanDrivers.length > 0 
    ? (vanDrivers.reduce((sum, d) => sum + d.movesPerHour, 0) / vanDrivers.length).toFixed(1)
    : 0;

  const avgInventoryMPH = inventoryDrivers.length > 0
    ? (inventoryDrivers.reduce((sum, d) => sum + d.movesPerHour, 0) / inventoryDrivers.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {participationRate < 90 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Full participation required for accurate metrics.</strong> Currently {participationRate.toFixed(0)}% of drivers are actively logging moves.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Van Drivers
            </CardTitle>
            <CardDescription className="text-xs">Current shift performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">{avgVanMPH}</div>
            <p className="text-xs text-blue-700">Avg Moves Per Hour</p>
            <p className="text-xs text-blue-600">{vanDrivers.length} drivers active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Inventory Drivers
            </CardTitle>
            <CardDescription className="text-xs">Current shift performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-green-600">{avgInventoryMPH}</div>
            <p className="text-xs text-green-700">Avg Moves Per Hour</p>
            <p className="text-xs text-green-600">{inventoryDrivers.length} drivers active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              System Health
            </CardTitle>
            <CardDescription className="text-xs">Data quality indicator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">{participationRate.toFixed(0)}%</div>
            <p className="text-xs text-purple-700">Participation Rate</p>
            <Badge variant={participationRate >= 90 ? "default" : "secondary"} className="text-xs">
              {participationRate >= 90 ? "✓ Full Data" : "⚠️ Partial"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {vanDrivers.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Van Driver Details</CardTitle>
            <CardDescription>Real-time metrics for each driver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vanDrivers.map(driver => (
                <div key={driver.driverNumber} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{driver.driverName}</p>
                    <p className="text-xs text-slate-500">#{driver.driverNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{driver.movesPerHour}</div>
                    <p className="text-xs text-slate-600">{driver.totalMovesShift} total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {inventoryDrivers.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Inventory Driver Details</CardTitle>
            <CardDescription>Real-time metrics for each driver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryDrivers.map(driver => (
                <div key={driver.driverNumber} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{driver.driverName}</p>
                    <p className="text-xs text-slate-500">#{driver.driverNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold text-green-600">{driver.movesPerHour}</div>
                    <p className="text-xs text-slate-600">{driver.totalMovesShift} total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
