import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

// Sky element bounds - constrain to top portion of screen
const SKY_REGION_HEIGHT = "65vh";  // All sky effects contained within this
const STAR_MAX_TOP = 35;           // Stars only in top 35% of sky region
const CLOUD_MAX_TOP = 12;          // Clouds only in top 15% of screen (above buildings)
const PRECIPITATION_END = "65vh";  // Rain/snow stops at this height

interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { 
    temp: number; 
    feelsLike: number; 
    humidity: number; 
    windSpeed: number; 
    windDirection: string; 
    description: string; 
    icon: string; 
    visibility: number; 
    pressure: number; 
    isNight?: boolean 
  };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

type SkyCondition = 'sunny' | 'cloudy' | 'overcast' | 'rain' | 'storm' | 'snow' | 'fog' | 'night-clear' | 'night-cloudy' | 'dusk' | 'dawn';

// Check if we're in the golden hour (sunset/sunrise transition)
function isDuskOrDawn(): { isDusk: boolean; isDawn: boolean } {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11
  
  // Approximate sunset/sunrise times vary by season (Nashville area)
  // Winter (Nov-Feb): Sunset ~4:30-5:30pm, Sunrise ~6:30-7:00am
  // Spring/Fall (Mar-Apr, Sep-Oct): Sunset ~6:00-7:30pm, Sunrise ~5:30-6:30am  
  // Summer (May-Aug): Sunset ~7:30-8:30pm, Sunrise ~5:00-6:00am
  
  let sunsetStart: number, sunsetEnd: number;
  let sunriseStart: number, sunriseEnd: number;
  
  if (month >= 10 || month <= 1) {
    // Winter: Nov, Dec, Jan, Feb - Nashville sunset ~4:30pm
    sunsetStart = 16; sunsetEnd = 17;   // 4pm-5pm (shorter winter dusk)
    sunriseStart = 6; sunriseEnd = 8;   // 6am-8am
  } else if (month >= 4 && month <= 7) {
    // Summer: May, Jun, Jul, Aug - Nashville sunset ~8:00pm
    sunsetStart = 19; sunsetEnd = 21;   // 7pm-9pm
    sunriseStart = 5; sunriseEnd = 7;   // 5am-7am
  } else {
    // Spring/Fall: Mar, Apr, Sep, Oct - Nashville sunset varies
    sunsetStart = 17; sunsetEnd = 19;   // 5pm-7pm
    sunriseStart = 5; sunriseEnd = 7;   // 5am-7am
  }
  
  const isDusk = hour >= sunsetStart && hour < sunsetEnd;
  const isDawn = hour >= sunriseStart && hour < sunriseEnd;
  
  return { isDusk, isDawn };
}

function getSkyCondition(description: string, isNight: boolean): SkyCondition {
  const d = description.toLowerCase();
  const { isDusk, isDawn } = isDuskOrDawn();
  
  // Don't show dusk/dawn during bad weather
  const isBadWeather = d.includes('rain') || d.includes('storm') || d.includes('thunder') || 
                       d.includes('snow') || d.includes('fog') || d.includes('overcast');
  
  // Night takes priority when isNight is true AND we're past the dusk window
  // This ensures we don't show dusk at 10pm just because it's winter
  if (isNight && !isDusk) {
    if (d.includes('cloud') || d.includes('overcast')) return 'night-cloudy';
    return 'night-clear';
  }
  
  // Check for dusk (sunset) - beautiful orange/purple sky
  // Only show during the dusk window when weather is nice
  if (isDusk && !isBadWeather) {
    return 'dusk';
  }
  
  // Check for dawn (sunrise) - soft pink/orange sky
  if (isDawn && !isBadWeather && !isNight) {
    return 'dawn';
  }
  
  // If isNight is true but we already checked dusk, this catches remaining night cases
  if (isNight) {
    if (d.includes('cloud') || d.includes('overcast')) return 'night-cloudy';
    return 'night-clear';
  }
  
  if (d.includes('thunder') || d.includes('storm')) return 'storm';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'rain';
  if (d.includes('snow') || d.includes('sleet') || d.includes('ice')) return 'snow';
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return 'fog';
  if (d.includes('overcast')) return 'overcast';
  if (d.includes('cloud') || d.includes('partly')) return 'cloudy';
  
  return 'sunny';
}

function Star({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{ width: size, height: size, left, top }}
      animate={{ 
        opacity: [0.2, 1, 0.2],
        scale: [0.8, 1.2, 0.8]
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
}

function Cloud({ delay, speed, top, scale, opacity }: { delay: number; speed: number; top: string; scale: number; opacity: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top }}
      initial={{ x: "-200px" }}
      animate={{ x: "calc(100vw + 200px)" }}
      transition={{
        duration: speed,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
    >
      <svg 
        width={120 * scale} 
        height={60 * scale} 
        viewBox="0 0 120 60" 
        fill="white" 
        style={{ opacity }}
      >
        <ellipse cx="35" cy="40" rx="25" ry="18" />
        <ellipse cx="60" cy="35" rx="30" ry="22" />
        <ellipse cx="85" cy="40" rx="22" ry="16" />
        <ellipse cx="50" cy="25" rx="20" ry="15" />
        <ellipse cx="70" cy="28" rx="18" ry="14" />
      </svg>
    </motion.div>
  );
}

function RainDrop({ delay, left, duration }: { delay: number; left: string; duration: number }) {
  return (
    <motion.div
      className="absolute w-[2px] h-[15px] bg-gradient-to-b from-transparent via-blue-300/60 to-blue-400/80 rounded-full"
      style={{ left }}
      initial={{ y: "-20px", opacity: 0 }}
      animate={{ y: PRECIPITATION_END, opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
    />
  );
}

function SnowFlake({ delay, left, duration }: { delay: number; left: string; duration: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-white rounded-full opacity-80"
      style={{ left }}
      initial={{ y: "-20px", rotate: 0 }}
      animate={{ 
        y: PRECIPITATION_END, 
        rotate: 360,
        x: [0, 10, -10, 5, -5, 0]
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
    />
  );
}

function FogLayer({ opacity, speed, yOffset }: { opacity: number; speed: number; yOffset: string }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ top: yOffset }}
      animate={{ x: ["-5%", "5%", "-5%"] }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div 
        className="w-[120%] h-full"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(200,200,210,${opacity}) 20%, 
            rgba(180,180,195,${opacity * 1.2}) 50%, 
            rgba(200,200,210,${opacity}) 80%, 
            transparent 100%
          )`
        }}
      />
    </motion.div>
  );
}

function Lightning() {
  const [flash, setFlash] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
        setTimeout(() => {
          if (Math.random() > 0.5) {
            setFlash(true);
            setTimeout(() => setFlash(false), 100);
          }
        }, 200);
      }
    }, 4000 + Math.random() * 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!flash) return null;
  
  return (
    <div className="absolute inset-0 bg-white/30 pointer-events-none z-10" />
  );
}

const skyGradients: Record<SkyCondition, string> = {
  'sunny': 'linear-gradient(to bottom, #4A90D9 0%, #87CEEB 40%, #B0E0E6 70%, #E0F4FF 100%)',
  'cloudy': 'linear-gradient(to bottom, #6B8BA4 0%, #8BA4B8 40%, #A8C0D0 70%, #C8DCE8 100%)',
  'overcast': 'linear-gradient(to bottom, #5A6B7A 0%, #7A8B9A 40%, #9AA8B5 70%, #B5C0C8 100%)',
  'rain': 'linear-gradient(to bottom, #3A4A5A 0%, #4A5A6A 30%, #5A6A7A 60%, #6A7A8A 100%)',
  'storm': 'linear-gradient(to bottom, #1A2530 0%, #2A3540 30%, #3A4550 60%, #4A5560 100%)',
  'snow': 'linear-gradient(to bottom, #8A9AAA 0%, #9AAABA 40%, #B0C0D0 70%, #D0E0F0 100%)',
  'fog': 'linear-gradient(to bottom, #8A9098 0%, #98A0A8 40%, #A8B0B8 70%, #C0C8D0 100%)',
  'night-clear': 'linear-gradient(to bottom, #0A0A1A 0%, #0F1428 30%, #151E3C 60%, #1A2850 100%)',
  'night-cloudy': 'linear-gradient(to bottom, #0F0F20 0%, #1A1A30 30%, #252540 60%, #303050 100%)',
  'dusk': 'linear-gradient(to bottom, #2C1654 0%, #6B3074 25%, #B84E5C 50%, #E8A84C 75%, #F5D38E 100%)',
  'dawn': 'linear-gradient(to bottom, #1A1A3A 0%, #4A3060 20%, #8B5A6B 40%, #E8A090 65%, #FFD4B8 85%, #FFF0D0 100%)',
};

export function DynamicSkyBackground() {
  const [localZip, setLocalZip] = useState<string | null>(null);
  
  useEffect(() => { 
    const s = localStorage.getItem('weatherZip'); 
    if (s) setLocalZip(s);
  }, []);
  
  const effectiveZip = localZip || "37122";

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather/zip", effectiveZip],
    queryFn: async () => { 
      const r = await fetch(`/api/weather/zip/${effectiveZip}`); 
      if (!r.ok) throw new Error(); 
      return r.json(); 
    },
    staleTime: 600000,
    refetchInterval: 1800000,
  });

  // Fallback to local time-based night detection if weather data not loaded
  const localHour = new Date().getHours();
  const localIsNightFallback = localHour >= 18 || localHour < 6; // 6pm-6am is night
  const isNight = weather?.current?.isNight ?? localIsNightFallback;
  const description = weather?.current?.description ?? 'clear';
  const skyCondition = useMemo(() => getSkyCondition(description, isNight), [description, isNight]);
  
  const stars = useMemo(() => {
    if (!skyCondition.includes('night')) return [];
    const count = skyCondition === 'night-clear' ? 60 : 25;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      size: 1 + Math.random() * 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * STAR_MAX_TOP}%`  // Constrained to top portion only
    }));
  }, [skyCondition]);

  const clouds = useMemo(() => {
    if (skyCondition === 'night-clear' || skyCondition === 'sunny') return [];
    const count = skyCondition === 'overcast' ? 8 : skyCondition === 'cloudy' ? 5 : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: i * 8 + Math.random() * 5,
      speed: 60,  // Full minute to cross screen
      top: `${2 + Math.random() * CLOUD_MAX_TOP}%`,  // Keep clouds in top 20% above buildings
      scale: 0.6 + Math.random() * 0.8,
      opacity: skyCondition === 'overcast' ? 0.9 : 0.7
    }));
  }, [skyCondition]);

  const rainDrops = useMemo(() => {
    if (skyCondition !== 'rain' && skyCondition !== 'storm') return [];
    const count = skyCondition === 'storm' ? 80 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      left: `${Math.random() * 100}%`,
      duration: 0.6 + Math.random() * 0.4
    }));
  }, [skyCondition]);

  const snowFlakes = useMemo(() => {
    if (skyCondition !== 'snow') return [];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      left: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4
    }));
  }, [skyCondition]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden transition-all duration-1000 ease-in-out z-0"
      style={{ background: skyGradients[skyCondition] }}
    >
      {/* Stars for night sky */}
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
      
      {/* Floating clouds */}
      {clouds.map(cloud => (
        <Cloud key={cloud.id} {...cloud} />
      ))}
      
      {/* Rain drops */}
      {rainDrops.map(drop => (
        <RainDrop key={drop.id} {...drop} />
      ))}
      
      {/* Snow flakes */}
      {snowFlakes.map(flake => (
        <SnowFlake key={flake.id} {...flake} />
      ))}
      
      {/* Fog layers - constrained to top portion */}
      {skyCondition === 'fog' && (
        <>
          <FogLayer opacity={0.4} speed={20} yOffset="10%" />
          <FogLayer opacity={0.3} speed={25} yOffset="20%" />
          <FogLayer opacity={0.5} speed={18} yOffset="35%" />
        </>
      )}
      
      {/* Lightning for storms */}
      {skyCondition === 'storm' && <Lightning />}
      
      {/* Subtle ambient glow for sunny days */}
      {skyCondition === 'sunny' && (
        <div 
          className="absolute top-[5%] right-[15%] w-32 h-32 rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,200,0.8) 0%, transparent 70%)' }}
        />
      )}
    </div>
  );
}

export default DynamicSkyBackground;

// Export hook to get current sky condition for text color adaptation
export function useSkyCondition(): { condition: SkyCondition; isLightBackground: boolean } {
  const [localZip, setLocalZip] = useState<string | null>(null);
  
  useEffect(() => { 
    const s = localStorage.getItem('weatherZip'); 
    if (s) setLocalZip(s);
  }, []);
  
  const effectiveZip = localZip || "37122";

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather/zip", effectiveZip],
    queryFn: async () => { 
      const r = await fetch(`/api/weather/zip/${effectiveZip}`); 
      if (!r.ok) throw new Error(); 
      return r.json(); 
    },
    staleTime: 600000,
    refetchInterval: 1800000,
  });

  const isNight = weather?.current?.isNight ?? false;
  const description = weather?.current?.description ?? 'clear';
  const condition = useMemo(() => getSkyCondition(description, isNight), [description, isNight]);
  
  // Determine if background is light (needs dark text) or dark (needs light text)
  // Light skies: sunny, cloudy, overcast, snow, fog - all have light upper portions
  // Dark skies: rain, storm, night-clear, night-cloudy, dusk
  const lightBackgrounds: SkyCondition[] = ['sunny', 'cloudy', 'overcast', 'snow', 'fog'];
  const isLightBackground = lightBackgrounds.includes(condition);
  
  return { condition, isLightBackground };
}
