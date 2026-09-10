import { NextRequest, NextResponse } from 'next/server';
import { searchLocations, reverseGeocode } from '@/lib/api/openweather';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        const rev = await reverseGeocode(lat, lon);
        return NextResponse.json(rev ? [rev] : []);
      }
    }

    if (!q || q.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = await searchLocations(q.trim());
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Geocoding route error:', error);
    return NextResponse.json({ error: 'Geocoding request failed.' }, { status: 500 });
  }
}
