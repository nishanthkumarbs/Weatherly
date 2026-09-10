import { NextRequest, NextResponse } from 'next/server';
import { addSubscription, removeSubscription, VAPID_PUBLIC_KEY } from '@/lib/api/push-subscriptions';

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, action, lat, lon, cityName } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Valid push subscription object required' }, { status: 400 });
    }

    if (action === 'unsubscribe') {
      removeSubscription(subscription.endpoint);
      return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
    }

    addSubscription(subscription, lat, lon, cityName);
    return NextResponse.json({ success: true, message: 'Push subscription registered successfully' });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Failed to process push subscription' }, { status: 500 });
  }
}
