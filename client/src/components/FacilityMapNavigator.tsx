import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Navigation, Route, Maximize2, X, Satellite, Map as MapIcon, ZoomIn, ZoomOut, LocateFixed, Truck, Clock, Gauge, TrendingUp, Activity } from "lucide-react";

// Real Manheim Nashville GPS coordinates
const FACILITY_CENTER = {
  lat: 36.2038,
  lng: -86.4608
};

// Facility lot coordinates (simplified grid layout)
const LOT_LOCATIONS: Record<string, { x: number; y: number; label: string; zone: string }> = {
  // SALE LANES (top area)
  "210": { x: 15, y: 10, label: "210", zone: "Sale Lane" },
  "215": { x: 25, y: 10, label: "215", zone: "Sale Lane" },
  "225": { x: 35, y: 10, label: "225", zone: "Sale Lane" },
  "227": { x: 45, y: 10, label: "227", zone: "Sale Lane" },
  "235": { x: 55, y: 10, label: "235", zone: "Sale Lane" },
  "240": { x: 65, y: 10, label: "240", zone: "Sale Lane" },
  "257": { x: 75, y: 10, label: "257", zone: "Sale Lane" },
  
  // DIRTSIDE (middle-left)
  "325": { x: 15, y: 35, label: "325", zone: "Dirtside" },
  "326": { x: 25, y: 35, label: "326", zone: "Dirtside" },
  "330": { x: 35, y: 35, label: "330", zone: "Dirtside" },
  "372": { x: 45, y: 35, label: "372", zone: "Dirtside" },
  "365": { x: 55, y: 35, label: "365", zone: "Recycle" },
  
  // CLEANSIDE (middle-right)
  "400": { x: 65, y: 35, label: "400", zone: "Cleanside" },
  "400EV": { x: 65, y: 35, label: "400 EV", zone: "EV Charging" },
  "400E": { x: 65, y: 35, label: "400 EV", zone: "EV Charging" },
  "410": { x: 75, y: 35, label: "410", zone: "Cleanside" },
  "411": { x: 85, y: 35, label: "411", zone: "Cleanside" },
  
  // INVENTORY (bottom-left)
  "501": { x: 15, y: 60, label: "501", zone: "Inventory" },
  "502": { x: 25, y: 60, label: "502", zone: "Inventory" },
  "503": { x: 35, y: 60, label: "503", zone: "Inventory" },
  "513": { x: 15, y: 70, label: "513", zone: "Inventory" },
  "515": { x: 25, y: 70, label: "515", zone: "Inventory" },
  "517": { x: 35, y: 70, label: "517", zone: "Inventory" },
  "520": { x: 45, y: 70, label: "520", zone: "DLR Lot" },
  
  // THE CAGE (bottom-center)
  "591": { x: 55, y: 70, label: "591", zone: "Cage" },
  "595": { x: 65, y: 70, label: "595", zone: "Cage" },
  "599": { x: 75, y: 70, label: "599", zone: "Cage" },
  
  // OVERFLOW (bottom-right)
  "702": { x: 85, y: 60, label: "702", zone: "Overflow" },
  
  // POST-SALE (far right)
  "800": { x: 85, y: 45, label: "800", zone: "PSI" },
  "803": { x: 90, y: 50, label: "803", zone: "Storage" },
  "860": { x: 85, y: 55, label: "860", zone: "Repo" },
};

// Convert GPS coordinates to pixel position on the facility map
// Manheim Nashville facility bounds (approximate)
const FACILITY_BOUNDS = {
  north: 36.2068,  // +0.003 from center
  south: 36.2008,  // -0.003 from center
  east: -86.4568,  // +0.004 from center
  west: -86.4648   // -0.004 from center
};

function gpsToPixelPosition(lat: number, lng: number) {
  // Normalize GPS coordinates to 0-1 range
  const latNorm = (lat - FACILITY_BOUNDS.south) / (FACILITY_BOUNDS.north - FACILITY_BOUNDS.south);
  const lngNorm = (lng - FACILITY_BOUNDS.west) / (FACILITY_BOUNDS.east - FACILITY_BOUNDS.west);
  
  // Convert to percentage (0-100)
  const x = lngNorm * 100;
  const y = (1 - latNorm) * 100; // Invert Y because image coordinates go top-down
  
  return { x, y };
}

interface FacilityMapNavigatorProps {
  currentDriverLocation?: string;
  compactMode?: boolean;
}

export function FacilityMapNavigator({ currentDriverLocation, compactMode = false }: FacilityMapNavigatorProps) {
  const [fromLot, setFromLot] = useState(currentDriverLocation || "");
  const [toLot, setToLot] = useState("");
  const [showRoute, setShowRoute] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapView, setMapView] = useState<"facility" | "satellite">("facility");
  const [showGPSOverlay, setShowGPSOverlay] = useState(true);
  const [mapZoom, setMapZoom] = useState(1.0);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  // Fetch all drivers for live positions
  const { data: drivers } = useQuery({
    queryKey: ["/api/drivers"],
    refetchInterval: 60000, // 1 minute refresh
  });

  const driversArray: any[] = Array.isArray(drivers) ? drivers : [];
  const activeDrivers = driversArray.filter(d => d.gpsLatitude && d.gpsLongitude);

  // Fetch detailed stats for selected driver
  const { data: selectedDriverStats } = useQuery<{ movesPerHour: number; totalMoves: number }>({
    queryKey: [`/api/drivers/${selectedDriver?.driverNumber}/mph`],
    enabled: !!selectedDriver,
  });

  const calculateRoute = () => {
    if (fromLot && toLot && LOT_LOCATIONS[fromLot] && LOT_LOCATIONS[toLot]) {
      setShowRoute(true);
    }
  };

  const clearRoute = () => {
    setShowRoute(false);
    setFromLot("");
    setToLot("");
  };

  const from = LOT_LOCATIONS[fromLot];
  const to = LOT_LOCATIONS[toLot];

  return (
    <Card className={`bg-white/10 border-white/20 backdrop-blur-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              Facility Navigator
            </CardTitle>
            <CardDescription className="text-slate-400">
              326-acre lot map with live driver positions • {activeDrivers.length} drivers active
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20"
            data-testid="button-toggle-fullscreen"
          >
            {isFullscreen ? <X className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Current Location</label>
            <Input
              placeholder="e.g., 803"
              value={fromLot}
              onChange={(e) => setFromLot(e.target.value.toUpperCase())}
              className="bg-white/10 border-white/30 text-white"
              data-testid="input-from-lot"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Destination</label>
            <Input
              placeholder="e.g., 515"
              value={toLot}
              onChange={(e) => setToLot(e.target.value.toUpperCase())}
              className="bg-white/10 border-white/30 text-white"
              data-testid="input-to-lot"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={calculateRoute}
              disabled={!fromLot || !toLot}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              data-testid="button-show-route"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Show Route
            </Button>
            {showRoute && (
              <Button
                onClick={clearRoute}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
                data-testid="button-clear-route"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Route Instructions */}
        {showRoute && from && to && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3" data-testid="route-instructions">
            <div className="flex items-start gap-3">
              <Route className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Route Found</h4>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>📍 From: <span className="font-semibold text-white">Lot {fromLot}</span> ({from.zone})</p>
                  <p>🎯 To: <span className="font-semibold text-white">Lot {toLot}</span> ({to.zone})</p>
                  <p>📏 Distance: <span className="font-semibold text-white">{calculateDistance(from, to)} yards</span></p>
                  <p className="text-yellow-300 mt-2">
                    💡 {getDirections(from, to)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="flex flex-wrap items-center gap-4 p-3 bg-white/10 rounded-lg border border-white/20">
          {/* GPS Overlay Toggle */}
          <div className="flex items-center gap-3">
            <Label htmlFor="gps-overlay" className="text-white text-sm font-medium flex items-center gap-2">
              <LocateFixed className="h-4 w-4 text-blue-400" />
              GPS Overlay
            </Label>
            <Switch
              id="gps-overlay"
              checked={showGPSOverlay}
              onCheckedChange={setShowGPSOverlay}
              className="data-[state=checked]:bg-blue-600"
              data-testid="switch-gps-overlay"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <Label className="text-white text-sm font-medium">Zoom:</Label>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-white/30 text-white hover:bg-white/20"
              onClick={() => setMapZoom(Math.max(0.5, mapZoom - 0.25))}
              disabled={mapZoom <= 0.5}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white font-mono text-sm min-w-[50px] text-center">
              {Math.round(mapZoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-white/30 text-white hover:bg-white/20"
              onClick={() => setMapZoom(Math.min(3.0, mapZoom + 0.25))}
              disabled={mapZoom >= 3.0}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/20 text-xs"
              onClick={() => setMapZoom(1.0)}
              data-testid="button-zoom-reset"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Map View Tabs */}
        <Tabs value={mapView} onValueChange={(v) => setMapView(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="facility" className="data-[state=active]:bg-blue-600">
              <MapIcon className="h-4 w-4 mr-2" />
              Facility Map
            </TabsTrigger>
            <TabsTrigger value="satellite" className="data-[state=active]:bg-blue-600">
              <Satellite className="h-4 w-4 mr-2" />
              Satellite View
            </TabsTrigger>
          </TabsList>

          {/* Facility Layout Map */}
          <TabsContent value="facility" className="mt-4">
            <div 
              className="relative bg-slate-900/50 rounded-lg overflow-auto border border-white/20 flex items-center justify-center"
              style={{ height: isFullscreen ? 'calc(100vh - 400px)' : compactMode ? '300px' : '500px' }}
            >
              <img 
                src="/attached_assets/image-3705654498381149414_1763515079330.jpg"
                alt="Manheim Nashville Facility Map"
                className="object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${mapZoom})`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  height: mapZoom > 1 ? `${mapZoom * 100}%` : '100%'
                }}
              />
              
              {/* GPS Overlay - Active Driver Positions */}
              {showGPSOverlay && activeDrivers.length > 0 && (
                <>
                  {/* Driver Position Markers */}
                  {activeDrivers.map((driver: any) => {
                    const pos = gpsToPixelPosition(parseFloat(driver.gpsLatitude), parseFloat(driver.gpsLongitude));
                    return (
                      <div
                        key={driver.driverNumber}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: `translate(-50%, -50%) scale(${1 / mapZoom})`,
                          transformOrigin: 'center center',
                          transition: 'all 0.5s ease-out'
                        }}
                        onClick={() => setSelectedDriver(driver)}
                        data-testid={`driver-marker-${driver.driverNumber}`}
                      >
                        <div className="relative group">
                          {/* Van Icon with Pulse */}
                          <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg border-2 border-white animate-pulse hover:bg-blue-700 hover:scale-110 transition-all">
                            <Truck className="h-5 w-5" />
                          </div>
                          {/* Driver Number Badge */}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-blue-200">
                            #{driver.driverNumber}
                          </div>
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs z-50">
                            <div className="font-bold">{driver.name || `Driver ${driver.driverNumber}`}</div>
                            <div className="text-slate-300">Zone: {driver.currentZone || 'Unknown'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Active Count Badge */}
                  <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="text-xs font-bold flex items-center gap-2">
                      <LocateFixed className="h-3 w-3" />
                      {activeDrivers.length} Active Driver{activeDrivers.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </>
              )}
              
              {/* Route overlay (if needed) */}
              {showRoute && from && to && (
                <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="text-sm font-bold">
                    {fromLot} → {toLot}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Google Maps Satellite View */}
          <TabsContent value="satellite" className="mt-4">
            <div 
              className="relative bg-slate-900/50 rounded-lg overflow-auto border border-white/20"
              style={{ height: isFullscreen ? 'calc(100vh - 400px)' : compactMode ? '300px' : '500px' }}
            >
              {/* Embedded Google Maps Satellite View */}
              <div 
                className="transition-transform duration-200"
                style={{ 
                  transform: `scale(${mapZoom})`,
                  transformOrigin: 'center center',
                  width: '100%',
                  height: '100%',
                  minHeight: mapZoom > 1 ? `${mapZoom * 100}%` : '100%'
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '500px' }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyDummy&center=${FACILITY_CENTER.lat},${FACILITY_CENTER.lng}&zoom=${Math.round(17 + (mapZoom - 1) * 2)}&maptype=satellite`}
                  title="Manheim Nashville Satellite View"
                  className="w-full h-full"
                />
              </div>
              
              {/* GPS Overlay - Driver List */}
              {showGPSOverlay && activeDrivers.length > 0 && (
                <div className="absolute top-4 right-4 bg-slate-900/95 text-white px-3 py-3 rounded-lg shadow-xl border border-blue-500/50 max-w-xs">
                  <div className="text-xs font-bold flex items-center gap-2 mb-2 border-b border-white/20 pb-2">
                    <LocateFixed className="h-3 w-3 animate-pulse text-blue-400" />
                    {activeDrivers.length} Active Driver{activeDrivers.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {activeDrivers.map((driver: any) => (
                      <div key={driver.driverNumber} className="flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1.5">
                        <div className="bg-blue-600 rounded-full p-1">
                          <Truck className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">#{driver.driverNumber}</div>
                          <div className="text-slate-400 text-[10px] truncate">{driver.currentZone || 'Unknown Zone'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fallback: Direct Google Maps link */}
              <div className="absolute bottom-4 right-4">
                <a
                  href={`https://www.google.com/maps/@${FACILITY_CENTER.lat},${FACILITY_CENTER.lng},17z/data=!3m1!1e3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
                  data-testid="link-open-google-maps"
                >
                  <Satellite className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick lot reference */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-4">
          <Badge variant="outline" className="justify-start text-slate-300 border-blue-500/50">
            <span className="text-blue-400 mr-2">●</span> Sale: 601-640
          </Badge>
          <Badge variant="outline" className="justify-start text-slate-300 border-orange-500/50">
            <span className="text-orange-400 mr-2">●</span> Shops: 800s (PSI, Mech, Body)
          </Badge>
          <Badge variant="outline" className="justify-start text-slate-300 border-green-500/50">
            <span className="text-green-400 mr-2">●</span> Cleanside: 400-412
          </Badge>
          <Badge variant="outline" className="justify-start text-slate-300 border-purple-500/50">
            <span className="text-purple-400 mr-2">●</span> Inventory: 500-595
          </Badge>
        </div>
      </CardContent>

      {/* Driver Details Modal */}
      <Dialog open={!!selectedDriver} onOpenChange={(open) => !open && setSelectedDriver(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-blue-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-blue-600 rounded-full p-2">
                <Truck className="h-5 w-5" />
              </div>
              Van #{selectedDriver?.driverNumber}
              <Badge variant="outline" className="ml-auto">
                {selectedDriver?.status || 'Active'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4 mt-4">
              {/* Driver Info */}
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="text-sm text-slate-400 mb-1">Driver</div>
                <div className="text-lg font-bold">{selectedDriver.name || `Driver ${selectedDriver.driverNumber}`}</div>
              </div>

              {/* Current Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Current MPH */}
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="h-4 w-4 text-blue-400" />
                      <div className="text-xs text-slate-400">Current MPH</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedDriverStats?.movesPerHour?.toFixed(1) || '0.0'}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Moves */}
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <div className="text-xs text-slate-400">Moves Today</div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {selectedDriverStats?.totalMoves || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Mode */}
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <div className="text-sm text-slate-400">Current Mode</div>
                  </div>
                  <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/50">
                    {selectedDriver.currentMode || 'Bulk Move'}
                  </Badge>
                </div>
                <div className="text-xs text-slate-300">
                  In this mode for: <span className="font-bold text-white">{calculateTimeDuration(selectedDriver.modeStartedAt)}</span>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <div className="text-sm text-slate-400">Current Location</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-slate-400">Zone:</span> <span className="font-semibold text-white">{selectedDriver.currentZone || 'Unknown'}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    At this location for: <span className="font-bold text-white">{calculateTimeDuration(selectedDriver.gpsUpdatedAt)}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-2">
                    GPS: {parseFloat(selectedDriver.gpsLatitude).toFixed(4)}, {parseFloat(selectedDriver.gpsLongitude).toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-xs text-slate-400">Last Updated</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {selectedDriver.gpsUpdatedAt ? new Date(selectedDriver.gpsUpdatedAt).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-xs text-slate-400">Shift Start</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {selectedDriver.loginAt ? new Date(selectedDriver.loginAt).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button 
                onClick={() => setSelectedDriver(null)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-close-driver-details"
              >
                Close Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Helper function to calculate time duration
function calculateTimeDuration(timestamp: string | null): string {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  
  const minutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return 'Just now';
}

// Helper functions remain the same
function calculateDistance(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const pixels = Math.sqrt(dx * dx + dy * dy);
  return Math.round(pixels * 50);
}

function getDirections(from: { x: number; y: number; zone: string }, to: { x: number; y: number; zone: string }): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  let horizontal = "";
  let vertical = "";
  
  if (Math.abs(dx) > 5) {
    horizontal = dx > 0 ? "Head EAST" : "Head WEST";
  }
  
  if (Math.abs(dy) > 5) {
    vertical = dy > 0 ? "then go SOUTH" : "then go NORTH";
  }
  
  if (horizontal && vertical) {
    return `${horizontal} ${vertical} toward ${to.zone}`;
  } else if (horizontal) {
    return `${horizontal} toward ${to.zone}`;
  } else if (vertical) {
    return `${vertical} toward ${to.zone}`;
  } else {
    return `Destination is nearby in ${to.zone}`;
  }
}

function estimateLotPosition(lat: string, lon: string): { x: number; y: number } {
  const hash = parseFloat(lat) * 1000 + parseFloat(lon) * 1000;
  const x = 20 + (Math.abs(hash) % 60);
  const y = 20 + (Math.abs(hash * 7) % 40);
  return { x, y };
}
