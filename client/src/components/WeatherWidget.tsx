import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WeatherModal } from "./WeatherModal";

import sunnyIcon from "@assets/weather_icons_transparent/sunny_day_weather_icon.png";
import clearNightIcon from "@assets/weather_icons_transparent/clear_night_moon_icon.png";
import cloudyIcon from "@assets/weather_icons_transparent/overcast_cloudy_icon.png";
import partlyCloudyNightIcon from "@assets/weather_icons_transparent/partly_cloudy_night_icon.png";
import rainyIcon from "@assets/weather_icons_transparent/rainy_weather_icon.png";
import stormIcon from "@assets/weather_icons_transparent/storm_lightning_icon.png";
import snowyIcon from "@assets/weather_icons_transparent/snowy_weather_icon.png";
import foggyIcon from "@assets/weather_icons_transparent/foggy_misty_icon.png";

const DEFAULT_LOCATION = {
  lat: 36.2038,
  lon: -86.4608,
  name: "Mount Juliet, TN",
  zipCode: "37122"
};

const getSavedLocation = () => {
  try {
    const saved = localStorage.getItem('weather_location');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load saved location:", e);
  }
  return DEFAULT_LOCATION;
};

interface WeatherData {
  temp: number;
  condition: string;
  conditionCode: number;
  isDay: boolean;
  hasAlert: boolean;
  alertType?: string;
}

type WeatherCondition = 'sunny' | 'clear_night' | 'cloudy' | 'cloudy_night' | 'rain' | 'storm' | 'snow' | 'fog';

const getWeatherIcon = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny': return sunnyIcon;
    case 'clear_night': return clearNightIcon;
    case 'cloudy': return cloudyIcon;
    case 'cloudy_night': return partlyCloudyNightIcon;
    case 'rain': return rainyIcon;
    case 'storm': return stormIcon;
    case 'snow': return snowyIcon;
    case 'fog': return foggyIcon;
    default: return sunnyIcon;
  }
};

const getGlowColor = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny': return 'rgba(255, 200, 50, 0.6)';
    case 'clear_night': return 'rgba(100, 149, 237, 0.5)';
    case 'cloudy': return 'rgba(148, 163, 184, 0.4)';
    case 'cloudy_night': return 'rgba(100, 116, 139, 0.4)';
    case 'rain': return 'rgba(59, 130, 246, 0.5)';
    case 'storm': return 'rgba(168, 85, 247, 0.6)';
    case 'snow': return 'rgba(226, 232, 240, 0.5)';
    case 'fog': return 'rgba(148, 163, 184, 0.3)';
    default: return 'rgba(255, 200, 50, 0.5)';
  }
};

const mapWeatherCode = (code: number, isDay: boolean): { condition: string; weatherType: WeatherCondition } => {
  if (code >= 95) return { condition: 'Thunderstorm', weatherType: 'storm' };
  if (code >= 80) return { condition: 'Rain Showers', weatherType: 'rain' };
  if (code >= 71) return { condition: 'Snow', weatherType: 'snow' };
  if (code >= 61) return { condition: 'Rain', weatherType: 'rain' };
  if (code >= 51) return { condition: 'Drizzle', weatherType: 'rain' };
  if (code >= 45) return { condition: 'Fog', weatherType: 'fog' };
  if (code >= 3) return { condition: 'Cloudy', weatherType: isDay ? 'cloudy' : 'cloudy_night' };
  if (code >= 1) return { condition: 'Partly Cloudy', weatherType: isDay ? 'cloudy' : 'cloudy_night' };
  return { condition: isDay ? 'Clear' : 'Clear Night', weatherType: isDay ? 'sunny' : 'clear_night' };
};

export function WeatherWidget() {
  const [open, setOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState(getSavedLocation());
  const [weatherType, setWeatherType] = useState<WeatherCondition>('sunny');

  const handleLocationUpdate = (newLocation: typeof DEFAULT_LOCATION) => {
    setLocation(newLocation);
    localStorage.setItem('weather_location', JSON.stringify(newLocation));
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=America/Chicago`
        );
        const data = await response.json();
        
        const weatherCode = data.current.weather_code;
        const isDay = data.current.is_day === 1;
        const { condition, weatherType: wType } = mapWeatherCode(weatherCode, isDay);
        
        setWeatherType(wType);
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition,
          conditionCode: weatherCode,
          isDay,
          hasAlert: weatherCode >= 95
        });
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [location]);

  const iconSrc = getWeatherIcon(weatherType);
  const glowColor = getGlowColor(weatherType);

  if (!weather) {
    return (
      <button
        className="fixed bottom-4 left-4 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 20px rgba(148, 163, 184, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)`
        }}
        data-testid="button-weather-loading"
      >
        <div className="w-10 h-10 rounded-full bg-slate-600 animate-pulse" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 group transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          filter: `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor})`,
        }}
        data-testid="button-weather"
      >
        <div 
          className="relative flex flex-col items-center"
          style={{
            animation: weatherType === 'storm' ? 'pulse 2s ease-in-out infinite' : undefined
          }}
        >
          <img
            src={iconSrc}
            alt={weather.condition}
            className="w-16 h-16 object-contain transition-transform duration-300 group-hover:rotate-12"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
          <div 
            className="absolute -bottom-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              boxShadow: `0 0 8px ${glowColor}, 0 2px 4px rgba(0,0,0,0.3)`
            }}
          >
            {weather.temp}°F
          </div>
          {weather.hasAlert && (
            <div className="absolute -top-1 -right-1">
              <Badge variant="destructive" className="text-[8px] px-1 py-0 animate-pulse flex items-center gap-0.5">
                <AlertTriangle className="w-2 h-2" />
                ALERT
              </Badge>
            </div>
          )}
        </div>
      </button>

      <WeatherModal 
        open={open} 
        onClose={() => setOpen(false)} 
        location={location} 
        onLocationUpdate={handleLocationUpdate}
      />
    </>
  );
}
