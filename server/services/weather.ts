interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { temp: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; description: string; icon: string; visibility: number; pressure: number; isNight: boolean };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

interface GeocodingResult { lat: number; lon: number; name: string; state?: string; country: string }

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  private getWeatherIcon(code: number, isDay: boolean = true): string {
    const icons: Record<number, { day: string; night: string }> = {
      0: { day: '☀️', night: '🌙' }, 1: { day: '🌤️', night: '🌤️' }, 2: { day: '⛅', night: '☁️' }, 3: { day: '☁️', night: '☁️' },
      45: { day: '🌫️', night: '🌫️' }, 48: { day: '🌫️', night: '🌫️' },
      51: { day: '🌧️', night: '🌧️' }, 53: { day: '🌧️', night: '🌧️' }, 55: { day: '🌧️', night: '🌧️' },
      56: { day: '🌨️', night: '🌨️' }, 57: { day: '🌨️', night: '🌨️' },
      61: { day: '🌧️', night: '🌧️' }, 63: { day: '🌧️', night: '🌧️' }, 65: { day: '🌧️', night: '🌧️' },
      66: { day: '🌨️', night: '🌨️' }, 67: { day: '🌨️', night: '🌨️' },
      71: { day: '❄️', night: '❄️' }, 73: { day: '❄️', night: '❄️' }, 75: { day: '❄️', night: '❄️' }, 77: { day: '❄️', night: '❄️' },
      80: { day: '🌦️', night: '🌧️' }, 81: { day: '🌦️', night: '🌧️' }, 82: { day: '⛈️', night: '⛈️' },
      85: { day: '🌨️', night: '🌨️' }, 86: { day: '🌨️', night: '🌨️' },
      95: { day: '⛈️', night: '⛈️' }, 96: { day: '⛈️', night: '⛈️' }, 99: { day: '⛈️', night: '⛈️' },
    };
    return (icons[code] || icons[0])[isDay ? 'day' : 'night'];
  }

  private getWeatherDescription(code: number): string {
    const d: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain', 67: 'Heavy freezing rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers', 85: 'Light snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm',
    };
    return d[code] || 'Unknown';
  }

  async geocodeZip(zipCode: string): Promise<GeocodingResult | null> {
    try {
      const res = await fetch(`${this.geocodingUrl}/search?name=${zipCode}&count=1&language=en&format=json`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.results?.length) return null;
      const r = data.results[0];
      return { lat: r.latitude, lon: r.longitude, name: r.name, state: r.admin1, country: r.country_code };
    } catch { return null; }
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(), longitude: lon.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,is_day',
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        temperature_unit: 'fahrenheit', wind_speed_unit: 'mph', precipitation_unit: 'inch',
        timezone: 'auto', forecast_days: '7', forecast_hours: '24',
      });
      const res = await fetch(`${this.baseUrl}/forecast?${params}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const isDay = data.current?.is_day === 1;
      return {
        location: { city: '', country: '', lat, lon },
        current: {
          temp: Math.round(data.current?.temperature_2m || 0),
          feelsLike: Math.round(data.current?.apparent_temperature || 0),
          humidity: data.current?.relative_humidity_2m || 0,
          windSpeed: Math.round(data.current?.wind_speed_10m || 0),
          windDirection: this.getWindDirection(data.current?.wind_direction_10m || 0),
          description: this.getWeatherDescription(data.current?.weather_code || 0),
          icon: this.getWeatherIcon(data.current?.weather_code || 0, isDay),
          visibility: Math.round((data.current?.visibility || 0) / 1609.34),
          pressure: Math.round((data.current?.surface_pressure || 0) * 0.02953),
          isNight: !isDay,
        },
        hourly: (data.hourly?.time || []).slice(0, 24).map((t: string, i: number) => ({
          time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric' }),
          temp: Math.round(data.hourly?.temperature_2m?.[i] || 0),
          icon: this.getWeatherIcon(data.hourly?.weather_code?.[i] || 0, true),
          description: this.getWeatherDescription(data.hourly?.weather_code?.[i] || 0),
          precipitation: data.hourly?.precipitation_probability?.[i] || 0,
        })),
        daily: (data.daily?.time || []).map((t: string, i: number) => ({
          date: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
          tempHigh: Math.round(data.daily?.temperature_2m_max?.[i] || 0),
          tempLow: Math.round(data.daily?.temperature_2m_min?.[i] || 0),
          icon: this.getWeatherIcon(data.daily?.weather_code?.[i] || 0, true),
          description: this.getWeatherDescription(data.daily?.weather_code?.[i] || 0),
          precipitation: data.daily?.precipitation_probability_max?.[i] || 0,
        })),
      };
    } catch { return null; }
  }

  async getWeatherByZip(zipCode: string): Promise<WeatherData | null> {
    const loc = await this.geocodeZip(zipCode);
    if (!loc) return null;
    const weather = await this.getWeather(loc.lat, loc.lon);
    if (!weather) return null;
    weather.location = { ...weather.location, city: loc.name, state: loc.state, country: loc.country };
    return weather;
  }
}

export const weatherService = new WeatherService();
