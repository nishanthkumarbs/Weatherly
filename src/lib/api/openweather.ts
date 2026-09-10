import {
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  LocationInfo,
  SevereAlert,
  AirQualityData,
} from '@/lib/types/weather';

const OWM_API_KEY = process.env.OPENWEATHER_API_KEY;

interface OWMCurrentResponse {
  lat: number;
  lon: number;
  timezone: string;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    pop: number;
    rain?: { '1h'?: number };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    summary: string;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags?: string[];
  }>;
}

export async function fetchOWMOneCall(lat: number, lon: number): Promise<{
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: SevereAlert[];
} | null> {
  if (!OWM_API_KEY) return null;

  // 1. Try One Call 3.0
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.ok) {
      const data: OWMCurrentResponse = await res.json();

      const current: CurrentWeather = {
        temp: Math.round(data.current.temp * 10) / 10,
        feels_like: Math.round(data.current.feels_like * 10) / 10,
        temp_min: data.daily?.[0]?.temp.min ?? data.current.temp - 3,
        temp_max: data.daily?.[0]?.temp.max ?? data.current.temp + 3,
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        wind_speed: data.current.wind_speed,
        wind_deg: data.current.wind_deg,
        wind_gust: data.current.wind_gust,
        uvi: data.current.uvi,
        visibility: data.current.visibility,
        dew_point: data.current.dew_point,
        clouds: data.current.clouds,
        condition: data.current.weather[0]?.main || 'Clear',
        description: data.current.weather[0]?.description || 'clear sky',
        icon: data.current.weather[0]?.icon || '01d',
        timestamp: data.current.dt,
        sunrise: data.current.sunrise,
        sunset: data.current.sunset,
      };

      const hourly: HourlyForecastItem[] = (data.hourly || []).slice(0, 48).map((h) => ({
        dt: h.dt,
        temp: Math.round(h.temp * 10) / 10,
        feels_like: Math.round(h.feels_like * 10) / 10,
        pop: h.pop,
        rain_volume: h.rain ? h.rain['1h'] : 0,
        humidity: h.humidity,
        wind_speed: h.wind_speed,
        wind_deg: h.wind_deg,
        condition: h.weather[0]?.main || 'Clear',
        description: h.weather[0]?.description || '',
        icon: h.weather[0]?.icon || '01d',
        uvi: h.uvi,
      }));

      const daily: DailyForecastItem[] = (data.daily || []).map((d) => ({
        dt: d.dt,
        temp_min: Math.round(d.temp.min * 10) / 10,
        temp_max: Math.round(d.temp.max * 10) / 10,
        temp_morn: Math.round(d.temp.morn * 10) / 10,
        temp_day: Math.round(d.temp.day * 10) / 10,
        temp_eve: Math.round(d.temp.eve * 10) / 10,
        temp_night: Math.round(d.temp.night * 10) / 10,
        feels_like_day: Math.round(d.feels_like.day * 10) / 10,
        pop: d.pop,
        rain_volume: d.rain,
        snow_volume: d.snow,
        humidity: d.humidity,
        wind_speed: d.wind_speed,
        condition: d.weather[0]?.main || 'Clear',
        description: d.weather[0]?.description || '',
        icon: d.weather[0]?.icon || '01d',
        uvi: d.uvi,
        sunrise: d.sunrise,
        sunset: d.sunset,
        moon_phase: d.moon_phase,
        moonrise: d.moonrise,
        moonset: d.moonset,
        summary: d.summary || `${d.weather[0]?.description || 'Clear'} throughout the day.`,
      }));

      const alerts: SevereAlert[] = (data.alerts || []).map((a, idx) => ({
        id: `owm-alert-${a.start}-${idx}`,
        event: a.event,
        headline: a.event,
        description: a.description,
        severity: a.event.toLowerCase().includes('warning')
          ? 'warning'
          : a.event.toLowerCase().includes('watch')
          ? 'watch'
          : 'advisory',
        start: a.start,
        end: a.end,
        senderName: a.sender_name,
      }));

      return { current, hourly, daily, alerts };
    }
  } catch (err) {
    console.warn('One Call 3.0 fetch failed:', err);
  }

  // 2. Seamless Fallback: Weather 2.5 + Forecast 2.5 (Supported on all standard OWM keys)
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      console.warn(`OWM 2.5 fallback failed: current=${currentRes.status}, forecast=${forecastRes.status}`);
      return null;
    }

    const cur = await currentRes.json();
    const fcast = await forecastRes.json();

    const current: CurrentWeather = {
      temp: Math.round(cur.main.temp * 10) / 10,
      feels_like: Math.round(cur.main.feels_like * 10) / 10,
      temp_min: Math.round(cur.main.temp_min * 10) / 10,
      temp_max: Math.round(cur.main.temp_max * 10) / 10,
      humidity: cur.main.humidity,
      pressure: cur.main.pressure,
      wind_speed: cur.wind.speed,
      wind_deg: cur.wind.deg || 0,
      wind_gust: cur.wind.gust,
      uvi: 5, // estimated for 2.5
      visibility: cur.visibility || 10000,
      dew_point: Math.round((cur.main.temp - (100 - cur.main.humidity) / 5) * 10) / 10,
      clouds: cur.clouds?.all || 0,
      condition: cur.weather[0]?.main || 'Clear',
      description: cur.weather[0]?.description || 'clear sky',
      icon: cur.weather[0]?.icon || '01d',
      timestamp: cur.dt,
      sunrise: cur.sys.sunrise,
      sunset: cur.sys.sunset,
    };

    // Transform 3-hour items to hourly items
    const hourly: HourlyForecastItem[] = (fcast.list || []).map((item: any) => ({
      dt: item.dt,
      temp: Math.round(item.main.temp * 10) / 10,
      feels_like: Math.round(item.main.feels_like * 10) / 10,
      pop: item.pop || 0,
      rain_volume: item.rain ? item.rain['3h'] / 3 : 0,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
      wind_deg: item.wind.deg || 0,
      condition: item.weather[0]?.main || 'Clear',
      description: item.weather[0]?.description || '',
      icon: item.weather[0]?.icon || '01d',
      uvi: 4,
    }));

    // Group 3-hour forecast by day for daily forecast
    const dailyMap = new Map<string, any[]>();
    for (const item of fcast.list || []) {
      const dayKey = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(dayKey)) dailyMap.set(dayKey, []);
      dailyMap.get(dayKey)?.push(item);
    }

    const daily: DailyForecastItem[] = Array.from(dailyMap.entries()).slice(0, 7).map(([dateStr, items], idx) => {
      const temps = items.map((it) => it.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const rep = items[Math.floor(items.length / 2)] || items[0];
      const maxPop = Math.max(...items.map((it) => it.pop || 0));

      return {
        dt: rep.dt,
        temp_min: Math.round(min * 10) / 10,
        temp_max: Math.round(max * 10) / 10,
        temp_morn: Math.round(items[0]?.main.temp ?? min),
        temp_day: Math.round(rep.main.temp),
        temp_eve: Math.round(items[items.length - 2]?.main.temp ?? rep.main.temp),
        temp_night: Math.round(items[items.length - 1]?.main.temp ?? min),
        feels_like_day: Math.round(rep.main.feels_like),
        pop: Math.round(maxPop * 100) / 100,
        rain_volume: items.reduce((acc, it) => acc + (it.rain ? it.rain['3h'] || 0 : 0), 0),
        humidity: rep.main.humidity,
        wind_speed: rep.wind.speed,
        condition: rep.weather[0]?.main || 'Clear',
        description: rep.weather[0]?.description || '',
        icon: rep.weather[0]?.icon || '01d',
        uvi: 5,
        sunrise: cur.sys.sunrise + idx * 86400,
        sunset: cur.sys.sunset + idx * 86400,
        moon_phase: (0.2 + idx * 0.035) % 1,
        summary: `${rep.weather[0]?.description || 'Partly cloudy'} expected with temperatures between ${Math.round(min)}°C and ${Math.round(max)}°C.`,
      };
    });

    return { current, hourly, daily, alerts: [] };
  } catch (err) {
    console.error('OWM 2.5 API error:', err);
    return null;
  }
}

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];

  if (OWM_API_KEY) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.map((item: { name: string; country: string; state?: string; lat: number; lon: number }) => ({
          name: item.name,
          country: item.country,
          state: item.state,
          lat: item.lat,
          lon: item.lon,
        }));
      }
    } catch (e) {
      console.warn('Geocoding API failed, falling back to static list:', e);
    }
  }

  // Fallback rich static list of major international cities matching query
  const staticCities: LocationInfo[] = [
    { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060 },
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'San Francisco', country: 'US', state: 'CA', lat: 37.7749, lon: -122.4194 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
    { name: 'Toronto', country: 'CA', state: 'ON', lat: 43.6532, lon: -79.3832 },
    { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
    { name: 'Bengaluru', country: 'IN', state: 'KA', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai', country: 'IN', state: 'MH', lat: 19.0760, lon: 72.8777 },
    { name: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964 },
    { name: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
    { name: 'Chicago', country: 'US', state: 'IL', lat: 41.8781, lon: -87.6298 },
  ];

  const q = query.toLowerCase();
  return staticCities.filter(
    c => c.name.toLowerCase().includes(q) || (c.state && c.state.toLowerCase().includes(q)) || c.country.toLowerCase().includes(q)
  );
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo | null> {
  if (OWM_API_KEY) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return {
            name: data[0].name,
            country: data[0].country,
            state: data[0].state,
            lat,
            lon,
          };
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }
  }

  return {
    name: 'Current Location',
    country: '',
    lat,
    lon,
  };
}

export async function fetchOWMAirPollution(lat: number, lon: number): Promise<AirQualityData | null> {
  if (!OWM_API_KEY) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.list?.[0];
    if (!item) return null;

    const owmAqi = item.main.aqi;
    const aqiMap = [28, 48, 85, 135, 230];
    const aqi = aqiMap[owmAqi - 1] || 50;

    const categories: AirQualityData['category'][] = [
      'Good',
      'Good',
      'Moderate',
      'Unhealthy for Sensitive Groups',
      'Unhealthy',
    ];
    const colors = ['#10b981', '#10b981', '#eab308', '#f97316', '#ef4444'];

    return {
      aqi,
      category: categories[owmAqi - 1] || 'Moderate',
      color: colors[owmAqi - 1] || '#eab308',
      pm25: item.components.pm2_5,
      pm10: item.components.pm10,
      o3: item.components.o3,
      no2: item.components.no2,
      co: Math.round((item.components.co / 1000) * 10) / 10,
      so2: item.components.so2,
      dominantPollutant: 'PM2.5',
      healthAdvice: owmAqi <= 2 ? 'Air quality is favorable and safe for outdoor activity.' : 'Sensitive individuals should limit prolonged outdoor exertion.',
    };
  } catch (err) {
    console.error('Error fetching OWM Air Pollution:', err);
    return null;
  }
}
