import { NextRequest, NextResponse } from 'next/server';
import { pushSubscriptions, sendNotificationToAll } from '@/lib/api/push-subscriptions';

export async function GET(request: NextRequest) {
  try {
    if (pushSubscriptions.length === 0) {
      return NextResponse.json({ message: 'No active subscribers to check' });
    }

    let alertsTriggered = 0;

    // Check alerts for each unique subscriber location
    for (const sub of pushSubscriptions) {
      const lat = sub.lat || 40.7128;
      const lon = sub.lon || -74.0060;

      try {
        // Query official free NWS alerts API (US)
        const nwsUrl = `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
        const res = await fetch(nwsUrl, {
          headers: {
            'User-Agent': 'WeatherlyApp (weatherly.app, contact@weatherly.app)',
            Accept: 'application/geo+json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const features = data.features || [];
          if (features.length > 0) {
            const firstAlert = features[0].properties;
            await sendNotificationToAll({
              title: `⚠️ NWS Alert: ${firstAlert.event}`,
              body: `${firstAlert.headline || firstAlert.event} for ${sub.cityName || 'your location'}.`,
              url: '/',
            });
            alertsTriggered++;
          }
        }
      } catch (e) {
        console.warn(`Could not check NWS alerts for ${lat},${lon}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      subscribersChecked: pushSubscriptions.length,
      alertsTriggered,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Check alerts polling error:', err);
    return NextResponse.json({ error: 'Failed to run alerts check' }, { status: 500 });
  }
}
