export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph' | 'ms';
export type PrecipUnit = 'mm' | 'inch';
export type PressureUnit = 'hPa' | 'inHg';

export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temp: number; // Celsius base
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number; // %
  pressure: number; // hPa
  wind_speed: number; // m/s base
  wind_deg: number; // degrees 0-360
  wind_gust?: number;
  uvi: number; // 0-12+
  visibility: number; // meters
  dew_point: number; // Celsius
  clouds: number; // %
  condition: string; // e.g. "Clear", "Rain", "Clouds", "Thunderstorm"
  description: string; // e.g. "scattered clouds"
  icon: string; // icon code
  timestamp: number; // unix epoch in seconds
  sunrise: number;
  sunset: number;
}

export interface HourlyForecastItem {
  dt: number;
  temp: number;
  feels_like: number;
  pop: number; // 0-1
  rain_volume?: number; // mm
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  condition: string;
  description: string;
  icon: string;
  uvi: number;
}

export interface DailyForecastItem {
  dt: number;
  temp_min: number;
  temp_max: number;
  temp_morn: number;
  temp_day: number;
  temp_eve: number;
  temp_night: number;
  feels_like_day: number;
  pop: number; // 0-1
  rain_volume?: number;
  snow_volume?: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon: string;
  uvi: number;
  sunrise: number;
  sunset: number;
  moon_phase: number; // 0 to 1 (0=new moon, 0.25=first quarter, 0.5=full, 0.75=last quarter)
  moonrise?: number;
  moonset?: number;
  summary: string;
}

export interface MinutelyItem {
  time: string; // ISO or HH:mm
  timestamp: number;
  precipitationIntensity: number; // mm/hr
  precipitationProbability: number; // %
  precipitationType: 'none' | 'rain' | 'snow' | 'ice' | 'freezing_rain';
}

export interface AirQualityData {
  aqi: number; // US EPA 0-500 scale
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  o3: number; // ug/m3 or ppb
  no2: number; // ug/m3
  co: number; // ug/m3
  so2: number; // ug/m3
  dominantPollutant?: string;
  healthAdvice: string;
}

export interface PollenCategoryInfo {
  index: number; // 0 to 5
  category: 'None' | 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
  color: string;
}

export interface PollenData {
  tree: PollenCategoryInfo;
  grass: PollenCategoryInfo;
  weed: PollenCategoryInfo;
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Very High';
  advice: string;
}

export interface SevereAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: 'warning' | 'watch' | 'advisory' | 'statement';
  urgency?: string;
  start: number;
  end: number;
  senderName: string;
}

export interface HistoricalComparison {
  currentTemp: number;
  normalTemp: number;
  tempDiff: number; // current - normal
  currentPrecip: number;
  normalPrecip: number;
  precipDiff: number;
  recordHigh: number;
  recordLow: number;
  baselinePeriod: string; // e.g. "30-year average for this day"
  trendSummary: string;
}

export interface ActivityRating {
  id: string;
  name: string;
  iconName: string;
  score: number; // 0-100
  level: 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Poor';
  badgeColor: string;
  summary: string;
}

export interface WeatherDataResponse {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  minutely: MinutelyItem[];
  airQuality: AirQualityData;
  pollen: PollenData;
  alerts: SevereAlert[];
  historical: HistoricalComparison;
  activities: ActivityRating[];
  isDemoMode: boolean;
  dataSources: {
    primary: 'OpenWeatherMap' | 'Simulated';
    nowcasting: 'Tomorrow.io' | 'Simulated';
    airQuality: 'Tomorrow.io' | 'OpenWeather' | 'Simulated';
  };
  fetchedAt: string;
}

export type WidgetId =
  | 'current_hero'
  | 'severe_alerts'
  | 'nowcast_minutely'
  | 'hourly_forecast'
  | 'daily_forecast'
  | 'conditions_metrics'
  | 'radar_map'
  | 'air_quality'
  | 'pollen_tracker'
  | 'sun_moon'
  | 'activity_advisor'
  | 'historical_trends';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  enabled: boolean;
}
