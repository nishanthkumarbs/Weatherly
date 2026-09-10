import webpush from 'web-push';

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BCtXAOZ1zzsCtglD0hxCypmt6kHoOuOOQEA6Hxsd_dDFCPCM7kHS-6lZ3r_uV8NVudPb2-WEZxgx3zdpwFFkTx0';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '3pRnH3kESN_tnvUJ8L5LuAYWkBIclaGPFoAvdeWRIT4';

export const VAPID_SUBJECT = 'mailto:alerts@weatherly.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface PushSubscriptionItem {
  id: string;
  subscription: webpush.PushSubscription;
  lat?: number;
  lon?: number;
  cityName?: string;
  subscribedAt: string;
}

// In-memory store for active push subscriptions
const globalSubscriptions = globalThis as unknown as { __weatherly_push_subs?: PushSubscriptionItem[] };
if (!globalSubscriptions.__weatherly_push_subs) {
  globalSubscriptions.__weatherly_push_subs = [];
}

export const pushSubscriptions = globalSubscriptions.__weatherly_push_subs;

export function addSubscription(sub: webpush.PushSubscription, lat?: number, lon?: number, cityName?: string) {
  const existingIdx = pushSubscriptions.findIndex((s) => s.subscription.endpoint === sub.endpoint);
  const item: PushSubscriptionItem = {
    id: `sub_${Date.now()}`,
    subscription: sub,
    lat,
    lon,
    cityName,
    subscribedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    pushSubscriptions[existingIdx] = item;
  } else {
    pushSubscriptions.push(item);
  }
}

export function removeSubscription(endpoint: string) {
  const idx = pushSubscriptions.findIndex((s) => s.subscription.endpoint === endpoint);
  if (idx !== -1) {
    pushSubscriptions.splice(idx, 1);
  }
}

export async function sendNotificationToAll(payload: { title: string; body: string; url?: string }) {
  const results = await Promise.allSettled(
    pushSubscriptions.map(async (item) => {
      try {
        await webpush.sendNotification(item.subscription, JSON.stringify(payload));
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or unsubscribed
          removeSubscription(item.subscription.endpoint);
        }
        throw err;
      }
    })
  );

  return results;
}
