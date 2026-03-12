import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X, Droplets, Wind, Eye, Thermometer, MapPin, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import sunnyIcon from "@assets/weather_icons_transparent/sunny_day_weather_icon.png";
import moonIcon from "@assets/weather_icons_transparent/clear_night_moon_icon.png";
import partlyCloudyNightIcon from "@assets/weather_icons_transparent/partly_cloudy_night_icon.png";
import cloudyIcon from "@assets/weather_icons_transparent/overcast_cloudy_icon.png";
import rainyIcon from "@assets/weather_icons_transparent/rainy_weather_icon.png";
import stormIcon from "@assets/weather_icons_transparent/storm_lightning_icon.png";
import snowyIcon from "@assets/weather_icons_transparent/snowy_weather_icon.png";
import foggyIcon from "@assets/weather_icons_transparent/foggy_misty_icon.png";

interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { temp: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; description: string; icon: string; visibility: number; pressure: number; isNight?: boolean };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

// Weather Radar Map Component using RainViewer API
function WeatherRadarMap({ lat, lon }: { lat: number; lon: number }) {
  const [radarFrames, setRadarFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch RainViewer radar data
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        
        // Get the last 6 radar frames (past data) + any nowcast frames
        const pastFrames = data.radar?.past?.slice(-6) || [];
        const nowcastFrames = data.radar?.nowcast?.slice(0, 3) || [];
        const allFrames = [...pastFrames, ...nowcastFrames];
        
        // Build tile URLs for each frame - using 256x256 tiles at zoom level 6
        const zoom = 6;
        const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
        const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        
        const urls = allFrames.map((frame: { path: string }) => 
          `https://tilecache.rainviewer.com${frame.path}/256/${zoom}/${tileX}/${tileY}/2/1_1.png`
        );
        
        setRadarFrames(urls);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching radar data:', error);
        setIsLoading(false);
      }
    };

    fetchRadarData();
    // Refresh radar data every 5 minutes
    const interval = setInterval(fetchRadarData, 300000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  // Animate through frames
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % radarFrames.length);
    }, 500);
    
    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-800/50 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (radarFrames.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-800/50 rounded-xl">
        <div className="text-center text-slate-400">
          <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Radar data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Radar Display */}
      <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
        {/* Base map layer - OpenStreetMap */}
        <img
          src={`https://tile.openstreetmap.org/6/${Math.floor((lon + 180) / 360 * 64)}/${Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 64)}.png`}
          alt="Map"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        {/* Radar overlay */}
        <img
          src={radarFrames[currentFrame]}
          alt="Weather Radar"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* Location marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
        </div>
        
        {/* Frame indicator */}
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white">
          {currentFrame < (radarFrames.length - 3) ? 'Past' : 'Forecast'} • Frame {currentFrame + 1}/{radarFrames.length}
        </div>
      </div>
      
      {/* Playback controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
          data-testid="button-radar-playpause"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        {/* Frame scrubber */}
        <div className="flex-1 flex gap-1">
          {radarFrames.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentFrame(i); setIsPlaying(false); }}
              className={`flex-1 h-2 rounded-full transition-all ${
                i === currentFrame 
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                  : i < (radarFrames.length - 3) 
                    ? 'bg-slate-600 hover:bg-slate-500' 
                    : 'bg-purple-600/50 hover:bg-purple-500/50'
              }`}
              data-testid={`button-radar-frame-${i}`}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/70" />
          <span>Light</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/70" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/70" />
          <span>Heavy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500/70" />
          <span>Severe</span>
        </div>
      </div>
    </div>
  );
}

function getWeatherDropShadow(desc: string, isNight: boolean): string {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return isNight ? 'drop-shadow-[0_0_20px_rgba(139,92,246,0.9)] drop-shadow-[0_0_40px_rgba(139,92,246,0.6)]' : 'drop-shadow-[0_0_20px_rgba(147,51,234,0.8)] drop-shadow-[0_0_40px_rgba(147,51,234,0.5)]';
  if (d.includes('rain') || d.includes('drizzle')) return isNight ? 'drop-shadow-[0_0_20px_rgba(99,102,241,0.8)] drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]' : 'drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] drop-shadow-[0_0_40px_rgba(59,130,246,0.5)]';
  if (d.includes('snow') || d.includes('sleet')) return isNight ? 'drop-shadow-[0_0_20px_rgba(203,213,225,0.9)] drop-shadow-[0_0_40px_rgba(203,213,225,0.6)]' : 'drop-shadow-[0_0_20px_rgba(226,232,240,0.8)] drop-shadow-[0_0_40px_rgba(226,232,240,0.5)]';
  if (d.includes('cloud') || d.includes('overcast')) return isNight ? 'drop-shadow-[0_0_18px_rgba(100,116,139,0.7)] drop-shadow-[0_0_35px_rgba(100,116,139,0.4)]' : 'drop-shadow-[0_0_18px_rgba(148,163,184,0.7)] drop-shadow-[0_0_35px_rgba(148,163,184,0.4)]';
  if (d.includes('fog') || d.includes('mist')) return isNight ? 'drop-shadow-[0_0_18px_rgba(71,85,105,0.7)] drop-shadow-[0_0_35px_rgba(71,85,105,0.4)]' : 'drop-shadow-[0_0_18px_rgba(100,116,139,0.7)] drop-shadow-[0_0_35px_rgba(100,116,139,0.4)]';
  if (d.includes('clear') || d.includes('sunny')) return isNight ? 'drop-shadow-[0_0_20px_rgba(129,140,248,0.8)] drop-shadow-[0_0_40px_rgba(129,140,248,0.5)]' : 'drop-shadow-[0_0_25px_rgba(250,204,21,0.9)] drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]';
  return isNight ? 'drop-shadow-[0_0_18px_rgba(99,102,241,0.7)] drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]' : 'drop-shadow-[0_0_18px_rgba(6,182,212,0.7)] drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]';
}

function getWeatherIcon(desc: string, isNight: boolean): string {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return stormIcon;
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return rainyIcon;
  if (d.includes('snow') || d.includes('sleet') || d.includes('ice')) return snowyIcon;
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return foggyIcon;
  if (d.includes('overcast')) return cloudyIcon;
  if (d.includes('cloud') || d.includes('partly')) return isNight ? partlyCloudyNightIcon : cloudyIcon;
  return isNight ? moonIcon : sunnyIcon;
}

export default function FloatingWeatherButton() {
  const [location] = useLocation();
  const [localZip, setLocalZip] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zipInput, setZipInput] = useState('');
  
  // Only show floating weather button on login page
  const isLoginPage = location === '/' || location === '/login';
  
  // Hide completely on non-login pages (weather shown in header instead)
  if (!isLoginPage) {
    return null;
  }
  
  useEffect(() => { 
    const s = localStorage.getItem('weatherZip'); 
    if (s) {
      setLocalZip(s);
      setZipInput(s);
    }
  }, []);
  
  const effectiveZip = localZip || "37122"; // Default: Mount Juliet, TN (Manheim Nashville)

  const { data: weather, isLoading, refetch } = useQuery<WeatherData>({
    queryKey: ["/api/weather/zip", effectiveZip],
    queryFn: async () => { 
      const r = await fetch(`/api/weather/zip/${effectiveZip}`); 
      if (!r.ok) throw new Error(); 
      return r.json(); 
    },
    staleTime: 600000, 
    refetchInterval: 1800000,
  });

  const handleZipUpdate = () => {
    if (zipInput.match(/^\d{5}$/)) {
      localStorage.setItem('weatherZip', zipInput);
      setLocalZip(zipInput);
      refetch();
      setShowModal(false);
    }
  };

  const isNight = weather?.current?.isNight ?? false;
  const description = weather?.current?.description ?? '';
  const dropShadowClass = useMemo(() => weather ? getWeatherDropShadow(description, isNight) : 'drop-shadow-[0_0_18px_rgba(6,182,212,0.7)]', [weather, description, isNight]);
  const weatherIcon = useMemo(() => getWeatherIcon(description, isNight), [description, isNight]);

  // Position based on page - login page has special positioning in Nashville skyline
  // Mobile: adjusted for skyline alignment
  const buttonPosition = isLoginPage 
    ? "fixed bottom-[365px] md:bottom-[235px] right-[20px] z-[9700]"  // Up 60px for published site alignment
    : "fixed bottom-[220px] md:bottom-[90px] right-[50px] z-[9700]";  // Other pages: near diorama

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        className={`${buttonPosition} cursor-pointer bg-transparent border-0 p-0`}
        initial={{ scale: 0, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.95 }}
        data-testid="button-weather-floating"
      >
        {isLoading ? (
          <div className="w-24 h-24 flex items-center justify-center">
            <Loader2 className="w-14 h-14 animate-spin text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Animated Sun Rays - ALWAYS show for daytime (not night) */}
            {!isNight && (
              <>
                {/* Rotating ray container - 16 rays all around */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 bg-gradient-to-t from-yellow-400 via-orange-400 to-transparent rounded-full"
                      style={{
                        height: '47px',
                        transform: `rotate(${i * 22.5}deg) translateY(-33px)`,
                        transformOrigin: 'center bottom',
                      }}
                      animate={{ 
                        opacity: [0.6, 1, 0.6],
                        scaleY: [0.85, 1.15, 0.85]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        delay: i * 0.12,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
                {/* Secondary rays - offset rotation */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={`inner-${i}`}
                      className="absolute w-0.5 bg-gradient-to-t from-orange-300 via-yellow-300 to-transparent rounded-full"
                      style={{
                        height: '33px',
                        transform: `rotate(${i * 22.5 + 11.25}deg) translateY(-27px)`,
                        transformOrigin: 'center bottom',
                      }}
                      animate={{ 
                        opacity: [0.4, 0.8, 0.4],
                        scaleY: [0.9, 1.1, 0.9]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
                {/* Outer glow */}
                <div className="absolute w-28 h-28 rounded-full bg-yellow-400/30 blur-2xl animate-pulse" />
                <div className="absolute w-20 h-20 rounded-full bg-orange-400/20 blur-xl animate-pulse" />
              </>
            )}
            <motion.img 
              src={weatherIcon}
              alt="Weather"
              className={`w-24 h-24 object-contain ${dropShadowClass} hover:brightness-110 transition-all duration-300 relative z-10`}
              animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
            />
            {weather && (
              <span className={`absolute -bottom-2 -right-2 text-xl font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] z-20 ${isNight ? 'text-indigo-100' : 'text-white'}`}>
                {weather.current.temp}°
              </span>
            )}
          </div>
        )}
      </motion.button>

      {/* Weather Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={`w-full max-w-md max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col ${
                isNight 
                  ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30' 
                  : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-cyan-500/30'
              }`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`relative p-4 ${isNight ? 'bg-indigo-900/30' : 'bg-cyan-900/20'}`}>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
                  data-testid="button-close-weather"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
                
                {weather && (
                  <div className="flex items-center gap-4">
                    <motion.img 
                      src={weatherIcon}
                      alt="Weather"
                      className={`w-16 h-16 object-contain ${dropShadowClass}`}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{weather.location.city}{weather.location.state ? `, ${weather.location.state}` : ''}</span>
                      </div>
                      <div className={`text-5xl font-bold ${isNight ? 'text-indigo-100' : 'text-white'}`}>
                        {weather.current.temp}°F
                      </div>
                      <div className="text-slate-400 capitalize">{weather.current.description}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for Details and Radar */}
              {weather && (
                <Tabs defaultValue="details" className="w-full flex-1 flex flex-col min-h-0">
                  <TabsList className="w-full bg-slate-800/50 border-b border-slate-700">
                    <TabsTrigger 
                      value="details" 
                      className="flex-1 data-[state=active]:bg-slate-700"
                      data-testid="tab-weather-details"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="radar" 
                      className="flex-1 data-[state=active]:bg-slate-700"
                      data-testid="tab-weather-radar"
                    >
                      <Radio className="w-4 h-4 mr-1" />
                      Radar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="p-4 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}>
                        <Thermometer className="w-5 h-5 text-rose-400" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Feels Like</div>
                          <div className="text-white font-bold">{weather.current.feelsLike}°F</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}>
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Humidity</div>
                          <div className="text-white font-bold">{weather.current.humidity}%</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}>
                        <Wind className="w-5 h-5 text-teal-400" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Wind</div>
                          <div className="text-white font-bold">{weather.current.windSpeed} mph {weather.current.windDirection}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 p-3 rounded-xl ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}>
                        <Eye className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Visibility</div>
                          <div className="text-white font-bold">{weather.current.visibility} mi</div>
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Forecast */}
                    <div>
                      <div className="text-xs text-slate-500 uppercase mb-2">7-Day Forecast</div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {weather.daily.map((day, i) => (
                          <div 
                            key={i}
                            className={`flex-shrink-0 w-16 p-2 rounded-xl text-center ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}
                          >
                            <div className="text-[10px] text-slate-400">{day.date}</div>
                            <div className="text-lg my-1">{day.icon}</div>
                            <div className="text-xs">
                              <span className="text-white font-bold">{day.tempHigh}°</span>
                              <span className="text-slate-500 ml-1">{day.tempLow}°</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Change Location */}
                    <div className={`p-3 rounded-xl ${isNight ? 'bg-indigo-900/20' : 'bg-slate-800/50'}`}>
                      <div className="text-xs text-slate-500 uppercase mb-2">Change Location</div>
                      <div className="flex gap-2">
                        <Input
                          value={zipInput}
                          onChange={(e) => setZipInput(e.target.value)}
                          placeholder="ZIP Code"
                          className="bg-slate-900/50 border-slate-700 text-white"
                          maxLength={5}
                          data-testid="input-weather-zip"
                        />
                        <Button
                          onClick={handleZipUpdate}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          disabled={!zipInput.match(/^\d{5}$/)}
                          data-testid="button-update-zip"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="radar" className="p-4 overflow-y-auto flex-1">
                    <WeatherRadarMap lat={weather.location.lat} lon={weather.location.lon} />
                  </TabsContent>
                </Tabs>
              )}

              {isLoading && (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
