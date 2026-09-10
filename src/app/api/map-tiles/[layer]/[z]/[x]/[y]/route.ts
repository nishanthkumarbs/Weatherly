import { NextRequest, NextResponse } from 'next/server';

// 1x1 transparent PNG buffer as fallback
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

interface RouteParams {
  params: Promise<{
    layer: string;
    z: string;
    x: string;
    y: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { layer, z, x, y } = await params;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return new NextResponse(TRANSPARENT_PNG, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  const validLayers = ['precipitation_new', 'clouds_new', 'wind_new', 'temp_new', 'pressure_new'];
  const layerName = validLayers.includes(layer) ? layer : 'precipitation_new';

  try {
    const tileUrl = `https://tile.openweathermap.org/map/${layerName}/${z}/${x}/${y}.png?appid=${apiKey}`;
    const tileRes = await fetch(tileUrl, { next: { revalidate: 600 } });

    if (!tileRes.ok) {
      return new NextResponse(TRANSPARENT_PNG, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const buffer = await tileRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error(`Failed to proxy tile ${layer}/${z}/${x}/${y}:`, err);
    return new NextResponse(TRANSPARENT_PNG, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
