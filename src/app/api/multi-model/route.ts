import { NextRequest, NextResponse } from 'next/server';
import { serverCache } from '@/lib/api/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lon = parseFloat(searchParams.get('lon') || '-74.0060');

    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    const cacheKey = `multi_model_${roundedLat}_${roundedLon}`;

    const cached = serverCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&hourly=temperature_2m&models=ecmwf_ifs025,gfs_seamless,icon_seamless&forecast_days=3`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo multi-model returned ${res.status}`);
    }

    const data = await res.json();
    const times: string[] = data.hourly?.time || [];
    const ecmwf: number[] = data.hourly?.temperature_2m_ecmwf_ifs025 || [];
    const gfs: number[] = data.hourly?.temperature_2m_gfs_seamless || [];
    const icon: number[] = data.hourly?.temperature_2m_icon_seamless || [];

    const hours = times.slice(0, 48).map((timeStr, i) => {
      const e = ecmwf[i] ?? 20;
      const g = gfs[i] ?? 20;
      const ic = icon[i] ?? 20;
      const min = Math.round(Math.min(e, g, ic) * 10) / 10;
      const max = Math.round(Math.max(e, g, ic) * 10) / 10;
      const spread = Math.round((max - min) * 10) / 10;
      const avg = Math.round(((e + g + ic) / 3) * 10) / 10;

      let confidence: 'High' | 'Moderate' | 'Fair' = 'High';
      if (spread > 2.5) confidence = 'Fair';
      else if (spread > 1.4) confidence = 'Moderate';

      const d = new Date(timeStr);
      const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });

      return {
        time: hourLabel,
        isoTime: timeStr,
        ecmwf: e,
        gfs: g,
        icon: ic,
        min,
        max,
        spread,
        avg,
        confidence,
      };
    });

    // Compute overall confidence score across 48 hours
    const avgSpread = hours.reduce((sum, h) => sum + h.spread, 0) / (hours.length || 1);
    const overallConfidence =
      avgSpread <= 1.5 ? 'High (90%+ agreement)' : avgSpread <= 2.5 ? 'Moderate (75% agreement)' : 'Fair (high variance)';

    const result = {
      hours,
      models: ['ECMWF IFS (European)', 'GFS (NOAA / US)', 'ICON (German Weather Service)'],
      overallConfidence,
      avgSpread: Math.round(avgSpread * 10) / 10,
    };

    serverCache.set(cacheKey, result, 1800); // 30 min cache

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Multi-model API error:', err);
    return NextResponse.json({ error: 'Multi-model fetch failed' }, { status: 500 });
  }
}
