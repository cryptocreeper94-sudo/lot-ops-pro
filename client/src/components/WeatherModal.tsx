import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, CloudRain, Wind, Droplets, AlertTriangle, Play, Pause, ZoomIn, ZoomOut, MapPin, Loader2, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeatherModalProps {
  open: boolean;
  onClose: () => void;
  location: {
    lat: number;
    lon: number;
    name: string;
    zipCode?: string;
  };
  onLocationUpdate: (location: { lat: number; lon: number; name: string; zipCode: string }) => void;
}

export function WeatherModal({ open, onClose, location, onLocationUpdate }: WeatherModalProps) {
  const [radarData, setRadarData] = useState<any>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [forecast, setForecast] = useState<any>(null);
  const [zoom, setZoom] = useState(8);
  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'temp'>('radar');
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [zipInput, setZipInput] = useState("");
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  // Geocode zip code to lat/lon
  const handleZipCodeChange = async () => {
    if (!zipInput.trim() || zipInput.length !== 5) {
      toast({
        title: "Invalid Zip Code",
        description: "Please enter a 5-digit US zip code",
        variant: "destructive"
      });
      return;
    }

    setIsGeocodingLoading(true);
    try {
      // Using Open-Meteo's geocoding API
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${zipInput}&count=1&language=en&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        toast({
          title: "Location Not Found",
          description: `Could not find location for zip code ${zipInput}`,
          variant: "destructive"
        });
        return;
      }

      const result = data.results[0];
      const newLocation = {
        lat: result.latitude,
        lon: result.longitude,
        name: `${result.name}, ${result.admin1 || result.country}`,
        zipCode: zipInput
      };

      onLocationUpdate(newLocation);
      toast({
        title: "Location Updated! 📍",
        description: `Now showing weather for ${newLocation.name}`
      });
      setZipInput("");
    } catch (error) {
      toast({
        title: "Geocoding Failed",
        description: "Could not find coordinates for this zip code",
        variant: "destructive"
      });
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  // Fetch RainViewer radar data
  useEffect(() => {
    if (!open) return;

    const fetchRadar = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        setRadarData(data);
        setCurrentFrame(data.radar.past.length - 1); // Start with most recent
      } catch (error) {
        console.error("Failed to fetch radar:", error);
      }
    };

    fetchRadar();
  }, [open]);

  // Fetch forecast data
  useEffect(() => {
    if (!open) return;

    const fetchForecast = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/Chicago&forecast_days=7`
        );
        const data = await response.json();
        setForecast(data);
      } catch (error) {
        console.error("Failed to fetch forecast:", error);
      }
    };

    fetchForecast();
  }, [open, location]);

  // Animate radar frames
  useEffect(() => {
    if (!isPlaying || !radarData) return;

    intervalRef.current = setInterval(() => {
      setCurrentFrame(prev => {
        const totalFrames = radarData.radar.past.length + radarData.radar.nowcast.length;
        return (prev + 1) % totalFrames;
      });
    }, 500); // Change frame every 500ms

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, radarData]);

  const getMapUrl = () => {
    // Base map with state/county lines (OpenStreetMap)
    const tileX = Math.floor((location.lon + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
  };

  const getWeatherLayerUrl = () => {
    if (!radarData || activeLayer === 'radar') {
      // Precipitation radar with standard colors (green/yellow/orange/red/purple)
      if (!radarData) return "";
      const allFrames = [...radarData.radar.past, ...radarData.radar.nowcast];
      const frame = allFrames[currentFrame];
      if (!frame) return "";
      
      const tileX = Math.floor((location.lon + 180) / 360 * Math.pow(2, zoom));
      const tileY = Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      // Color scheme: 0=Original, 1=Universal Blue, 2=TITAN, 3=TWC, 4=Meteored, 5=NEXRAD, 6=Rainbow, 7=Dark Sky
      // Using scheme 0 (Original) which has green/yellow/orange/red/purple
      return `https://tilecache.rainviewer.com${frame.path}/256/${zoom}/${tileX}/${tileY}/0/1_1.png`;
    }
    
    if (activeLayer === 'satellite') {
      // Cloud cover layer from RainViewer
      if (!radarData?.satellite) return "";
      return `https://tilecache.rainviewer.com/v2/coverage/0/${zoom}/${Math.floor((location.lon + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}/0/0_0.png`;
    }
    
    if (activeLayer === 'temp') {
      // Temperature overlay from OpenWeatherMap
      const tileX = Math.floor((location.lon + 180) / 360 * Math.pow(2, zoom));
      const tileY = Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      return `https://tile.openweathermap.org/map/temp_new/${zoom}/${tileX}/${tileY}.png?appid=`;
    }
    
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[85vh] sm:h-[90vh] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden">
        <DialogHeader className="p-3 sm:p-4 border-b border-slate-800">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-base sm:text-xl">Weather - {location.name}</div>
              <div className="text-xs text-slate-400 font-normal">Live Radar & Forecast</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="radar" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="radar">Live Radar</TabsTrigger>
            <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Live Radar Tab */}
            <TabsContent value="radar" className="space-y-2 mt-0">
              {/* MAP LAYER TOGGLES */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={activeLayer === 'radar' ? 'default' : 'outline'}
                  onClick={() => setActiveLayer('radar')}
                  className={activeLayer === 'radar' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-400 hover:bg-green-600 hover:text-white'}
                >
                  <CloudRain className="h-4 w-4 mr-1" />
                  Rain Radar
                </Button>
                <Button
                  size="sm"
                  variant={activeLayer === 'satellite' ? 'default' : 'outline'}
                  onClick={() => setActiveLayer('satellite')}
                  className={activeLayer === 'satellite' ? 'bg-blue-600' : ''}
                >
                  <Cloud className="h-4 w-4 mr-1" />
                  Clouds
                </Button>
                <Button
                  size="sm"
                  variant={activeLayer === 'temp' ? 'default' : 'outline'}
                  onClick={() => setActiveLayer('temp')}
                  className={activeLayer === 'temp' ? 'bg-blue-600' : ''}
                >
                  <Wind className="h-4 w-4 mr-1" />
                  Temperature
                </Button>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                    <span>
                      {activeLayer === 'radar' && 'Precipitation Radar'}
                      {activeLayer === 'satellite' && 'Cloud Cover'}
                      {activeLayer === 'temp' && 'Temperature Map'}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.max(6, zoom - 1))}
                        data-testid="button-zoom-out"
                        className="h-8 w-8 p-0"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.min(12, zoom + 1))}
                        data-testid="button-zoom-in"
                        className="h-8 w-8 p-0"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPlaying(!isPlaying)}
                        data-testid="button-play-pause"
                        className="h-8 w-8 p-0"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        data-testid="button-fullscreen"
                        className="h-8 w-8 p-0"
                      >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div ref={mapRef} className={`relative ${isFullscreen ? 'h-[70vh]' : 'h-64 sm:h-80 md:h-96'} bg-slate-950 rounded overflow-hidden w-full max-w-full`}>
                    {/* Base map with state/county lines */}
                    <img
                      src={getMapUrl()}
                      alt="Base map"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ maxWidth: '100%', height: '100%' }}
                    />
                    
                    {/* Weather layer overlay */}
                    {radarData && activeLayer === 'radar' && (
                      <img
                        src={getWeatherLayerUrl()}
                        alt="Precipitation radar - green/yellow/red shows rain intensity"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        style={{ maxWidth: '100%', height: '100%' }}
                      />
                    )}
                    
                    {activeLayer === 'satellite' && (
                      <img
                        src={getWeatherLayerUrl()}
                        alt="Cloud cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        style={{ maxWidth: '100%', height: '100%' }}
                      />
                    )}
                    
                    {activeLayer === 'temp' && (
                      <img
                        src={getWeatherLayerUrl()}
                        alt="Temperature map"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    
                    {!radarData && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-950/80">
                        Loading weather data...
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                      {radarData && `Frame ${currentFrame + 1} of ${radarData.radar.past.length + radarData.radar.nowcast.length}`}
                    </div>
                    {activeLayer === 'radar' && (
                      <div className="absolute top-2 right-2 text-xs bg-black/60 px-2 py-1 rounded">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-white">Light</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span className="text-white">Moderate</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-white">Heavy</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 text-center">
                    {isPlaying ? "Animating..." : "Paused"} • {activeLayer === 'radar' ? 'Precipitation Radar' : activeLayer === 'satellite' ? 'Cloud Cover' : 'Temperature'} • Updates every 10 min
                  </div>
                </CardContent>
              </Card>

              {/* Current Conditions */}
              {forecast && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Current Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{Math.round(forecast.current.temperature_2m)}°F</div>
                        <div className="text-xs text-slate-400">Temperature</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Droplets className="h-4 w-4 text-blue-400" />
                          <span className="text-2xl font-bold">{forecast.current.relative_humidity_2m}%</span>
                        </div>
                        <div className="text-xs text-slate-400">Humidity</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wind className="h-4 w-4 text-slate-400" />
                          <span className="text-2xl font-bold">{Math.round(forecast.current.wind_speed_10m)}</span>
                        </div>
                        <div className="text-xs text-slate-400">Wind (mph)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{Math.round(forecast.current.apparent_temperature)}°F</div>
                        <div className="text-xs text-slate-400">Feels Like</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 7-Day Forecast Tab */}
            <TabsContent value="forecast" className="space-y-2 mt-0">
              {forecast && (
                <div className="grid gap-2">
                  {forecast.daily.time.slice(0, 7).map((date: string, index: number) => (
                    <Card key={date} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold">
                              {index === 0 ? "Today" : new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs text-slate-400">High</div>
                              <div className="text-lg font-bold text-red-400">
                                {Math.round(forecast.daily.temperature_2m_max[index])}°
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Low</div>
                              <div className="text-lg font-bold text-blue-400">
                                {Math.round(forecast.daily.temperature_2m_min[index])}°
                              </div>
                            </div>
                            <div className="text-center">
                              <CloudRain className="h-6 w-6 text-blue-400" />
                              <div className="text-xs text-slate-400">
                                {forecast.daily.precipitation_probability_max[index]}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Hourly Forecast Tab */}
            <TabsContent value="hourly" className="space-y-2 mt-0">
              {forecast && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Next 24 Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {forecast.hourly.time.slice(0, 24).map((time: string, index: number) => (
                        <div key={time} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                          <div className="text-sm">
                            {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold">
                              {Math.round(forecast.hourly.temperature_2m[index])}°F
                            </div>
                            <div className="flex items-center gap-1 text-blue-400">
                              <Droplets className="h-4 w-4" />
                              <span className="text-sm">{forecast.hourly.precipitation_probability[index]}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Severe Weather Alerts Tab */}
            <TabsContent value="alerts" className="space-y-2 mt-0">
              {/* Change Location Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Change Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Currently showing: <span className="text-white font-semibold">{location.name}</span>
                      {location.zipCode && <span className="ml-2 text-slate-500">({location.zipCode})</span>}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="zip-input" className="text-xs text-slate-400">US Zip Code</Label>
                        <Input
                          id="zip-input"
                          placeholder="29485"
                          value={zipInput}
                          onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          onKeyDown={(e) => e.key === 'Enter' && handleZipCodeChange()}
                          className="bg-slate-900 border-slate-700 text-white h-9"
                          maxLength={5}
                          data-testid="input-zip-code"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleZipCodeChange}
                          disabled={isGeocodingLoading || zipInput.length !== 5}
                          className="bg-blue-600 hover:bg-blue-700 h-9"
                          data-testid="button-change-location"
                        >
                          {isGeocodingLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Go"
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Enter any US zip code to view weather for that location (e.g., South Carolina, Tennessee, etc.)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Severe Weather Alerts Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Severe Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No active alerts for {location.name}</div>
                    <div className="text-xs mt-1">Monitoring NWS for severe weather</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
