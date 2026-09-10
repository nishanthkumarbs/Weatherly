import { MinutelyItem, AirQualityData, PollenData } from '@/lib/types/weather';

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;

export async function fetchTomorrowNowcast(
  lat: number,
  lon: number
): Promise<{
  minutely: MinutelyItem[];
  airQuality?: AirQualityData;
  pollen?: PollenData;
} | null> {
  if (!TOMORROW_API_KEY) return null;

  try {
    // 1. Try Tomorrow.io modern v4 weather/forecast endpoint (exact 1m intervals)
    const forecastUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&timesteps=1m&apikey=${TOMORROW_API_KEY}`;
    const fcastRes = await fetch(forecastUrl, { next: { revalidate: 120 } });

    if (fcastRes.ok) {
      const fcastJson = await fcastRes.json();
      const minutelyList = fcastJson.timelines?.minutely;

      if (Array.isArray(minutelyList) && minutelyList.length > 0) {
        const minutely: MinutelyItem[] = minutelyList.slice(0, 60).map((m: { time: string; values: Record<string, number> }) => {
          const date = new Date(m.time);
          const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          
          const rain = m.values.rainIntensity || 0;
          const snow = m.values.snowIntensity || 0;
          const freezingRain = m.values.freezingRainIntensity || 0;
          const sleet = m.values.sleetIntensity || 0;
          const intensity = Math.max(rain, snow, freezingRain, sleet);

          let precipType: MinutelyItem['precipitationType'] = 'none';
          if (snow > 0) precipType = 'snow';
          else if (freezingRain > 0) precipType = 'freezing_rain';
          else if (sleet > 0) precipType = 'ice';
          else if (rain > 0) precipType = 'rain';

          return {
            time: timeStr,
            timestamp: Math.floor(date.getTime() / 1000),
            precipitationIntensity: Math.round(intensity * 10) / 10,
            precipitationProbability: Math.round(m.values.precipitationProbability || 0),
            precipitationType: precipType,
          };
        });

        return { minutely };
      }
    }
  } catch (err) {
    console.warn('Tomorrow.io v4 forecast fetch error:', err);
  }

  // 2. Fallback to v4/timelines endpoint
  try {
    const fields = ['precipitationIntensity', 'precipitationProbability'];
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=${fields.join(
      ','
    )}&timesteps=1m&units=metric&apikey=${TOMORROW_API_KEY}`;

    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      console.warn(`Tomorrow.io timelines returned ${res.status}: ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    const intervals = json.data?.timelines?.[0]?.intervals;

    if (!Array.isArray(intervals) || intervals.length === 0) {
      return null;
    }

    const minutely: MinutelyItem[] = intervals.slice(0, 60).map((interval: { startTime: string; values: Record<string, number> }) => {
      const date = new Date(interval.startTime);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      return {
        time: timeStr,
        timestamp: Math.floor(date.getTime() / 1000),
        precipitationIntensity: Math.round((interval.values.precipitationIntensity || 0) * 10) / 10,
        precipitationProbability: Math.round(interval.values.precipitationProbability || 0),
        precipitationType: (interval.values.precipitationIntensity || 0) > 0 ? 'rain' : 'none',
      };
    });

    return { minutely };
  } catch (err) {
    console.error('Error fetching Tomorrow.io timeline:', err);
    return null;
  }
}
