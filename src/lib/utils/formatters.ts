import { TemperatureUnit, SpeedUnit, PrecipUnit, PressureUnit } from '@/lib/types/weather';

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempNumber(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}

export function formatSpeed(mps: number, unit: SpeedUnit): string {
  if (unit === 'mph') {
    return `${Math.round(mps * 2.23694)} mph`;
  }
  if (unit === 'kmh') {
    return `${Math.round(mps * 3.6)} km/h`;
  }
  return `${Math.round(mps * 10) / 10} m/s`;
}

export function formatPrecipitation(mm: number, unit: PrecipUnit): string {
  if (unit === 'inch') {
    const inch = mm / 25.4;
    return `${inch < 0.1 && inch > 0 ? '<0.1' : inch.toFixed(1)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatPressure(hPa: number, unit: PressureUnit): string {
  if (unit === 'inHg') {
    return `${(hPa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
}

export function getWindCompass(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index] || 'N';
}

export function getUviRisk(uvi: number): { label: string; color: string } {
  if (uvi <= 2) return { label: 'Low', color: '#10b981' };
  if (uvi <= 5) return { label: 'Moderate', color: '#f59e0b' };
  if (uvi <= 7) return { label: 'High', color: '#f97316' };
  if (uvi <= 10) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#8b5cf6' };
}

export function getMoonPhaseName(phase: number): string {
  if (phase === 0 || phase === 1) return 'New Moon';
  if (phase > 0 && phase < 0.25) return 'Waxing Crescent';
  if (phase === 0.25) return 'First Quarter';
  if (phase > 0.25 && phase < 0.5) return 'Waxing Gibbous';
  if (phase === 0.5) return 'Full Moon';
  if (phase > 0.5 && phase < 0.75) return 'Waning Gibbous';
  if (phase === 0.75) return 'Last Quarter';
  return 'Waning Crescent';
}

export function formatHour(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
}

export function formatWeekday(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString([], { weekday: 'short' });
}
