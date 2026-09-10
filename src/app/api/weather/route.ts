import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/api/weather-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const city = searchParams.get('city') || undefined;

    const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '40.7128');
    const defaultLon = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON || '-74.0060');

    const lat = latStr ? parseFloat(latStr) : defaultLat;
    const lon = lonStr ? parseFloat(lonStr) : defaultLon;

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude coordinates provided.' },
        { status: 400 }
      );
    }

    const data = await getWeatherData(lat, lon, city);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Weather API route error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve weather forecasting data.' },
      { status: 500 }
    );
  }
}
