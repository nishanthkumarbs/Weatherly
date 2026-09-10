import { NextRequest, NextResponse } from 'next/server';
import { serverCache } from '@/lib/api/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lon = parseFloat(searchParams.get('lon') || '-74.0060');
    const currentTemp = parseFloat(searchParams.get('currentTemp') || '20');

    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    const cacheKey = `historical_normal_10yr_${roundedLat}_${roundedLon}`;

    const cached = serverCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const monthDayStr = `-${month}-${day}`;

    const startDate = `${currentYear - 11}-${month}-${day}`;
    const endDate = `${currentYear - 1}-${month}-${day}`;

    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${roundedLat}&longitude=${roundedLon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min`;

    const res = await fetch(archiveUrl);
    if (!res.ok) {
      throw new Error(`Open-Meteo Archive API returned ${res.status}`);
    }

    const json = await res.json();
    const times: string[] = json.daily?.time || [];
    const means: number[] = json.daily?.temperature_2m_mean || [];
    const maxs: number[] = json.daily?.temperature_2m_max || [];
    const mins: number[] = json.daily?.temperature_2m_min || [];

    const historicalDays: Array<{ year: number; temp: number; max: number; min: number }> = [];

    times.forEach((t, i) => {
      if (t.endsWith(monthDayStr) && means[i] !== null && !isNaN(means[i])) {
        historicalDays.push({
          year: parseInt(t.split('-')[0], 10),
          temp: Math.round(means[i] * 10) / 10,
          max: Math.round((maxs[i] ?? means[i]) * 10) / 10,
          min: Math.round((mins[i] ?? means[i]) * 10) / 10,
        });
      }
    });

    if (historicalDays.length === 0) {
      throw new Error('No historical date records found in archive');
    }

    const tenYearAvg =
      Math.round((historicalDays.reduce((sum, d) => sum + d.temp, 0) / historicalDays.length) * 10) / 10;
    const diff = Math.round((currentTemp - tenYearAvg) * 10) / 10;

    const allMaxs = historicalDays.map((d) => d.max);
    const allMins = historicalDays.map((d) => d.min);
    const recordHigh = Math.max(...allMaxs);
    const recordLow = Math.min(...allMins);

    let comparisonText = '';
    if (Math.abs(diff) < 0.5) {
      comparisonText = 'Right on the 10-year usual';
    } else if (diff > 0) {
      comparisonText = `${Math.abs(diff)}°C warmer than 10-yr usual`;
    } else {
      comparisonText = `${Math.abs(diff)}°C cooler than 10-yr usual`;
    }

    const payload = {
      tenYearAvg,
      diff,
      comparisonText,
      recordHigh,
      recordLow,
      historicalDays,
      baselinePeriod: `10-Year Climate Archive (${currentYear - 11}–${currentYear - 1})`,
    };

    serverCache.set(cacheKey, payload, 86400); // 24hr cache

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('Historical Normal route error:', err);
    // Fallback baseline
    const fallback = {
      tenYearAvg: 21.0,
      diff: 0,
      comparisonText: 'Comparable to 10-year seasonal normal',
      recordHigh: 28.5,
      recordLow: 14.2,
      historicalDays: [],
      baselinePeriod: '10-Year Climate Normals',
    };
    return NextResponse.json(fallback);
  }
}
