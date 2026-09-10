import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationToAll, pushSubscriptions } from '@/lib/api/push-subscriptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title = 'Severe Weather Alert', message = 'Test advisory from Weatherly.', url = '/' } = body;

    if (pushSubscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active push subscriptions found. Please enable alerts in settings first.',
      });
    }

    const results = await sendNotificationToAll({
      title,
      body: message,
      url,
    });

    return NextResponse.json({
      success: true,
      sentCount: results.filter((r) => r.status === 'fulfilled').length,
      totalSubscribers: pushSubscriptions.length,
    });
  } catch (err) {
    console.error('Push send error:', err);
    return NextResponse.json({ error: 'Failed to broadcast push notification' }, { status: 500 });
  }
}
