import webpush from "web-push";
import { logger } from "@/lib/logger";

if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.EMAIL_USER
) {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_USER}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  logger.warn("VAPID keys or Email not found. Push notifications will not work.");
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export const sendPushNotification = async (
  subscription: PushSubscription,
  payload: NotificationPayload
) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    logger.error("Error sending push notification:", error);
    return false;
  }
};

import db from "@/drizzle/index";
import { pushSubscriptions } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export const sendNotificationToUser = async (
  userId: string,
  payload: NotificationPayload
) => {
    // Fetch subscriptions
    const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    
    if (!subscriptions.length) return [];

    // Ideally, catch "Gone" (410) errors and remove invalid subscriptions.
    const results = await Promise.all(
        subscriptions.map(async (sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: sub.keys as any, // Cast JSON to keys
            };
            try {
                await webpush.sendNotification(pushSub, JSON.stringify(payload));
                return { success: true, endpoint: sub.endpoint };
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription is invalid/expired
                    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
                    return { success: false, endpoint: sub.endpoint, delete: true };
                }
                logger.error("Error sending push to specific sub:", error);
                return { success: false, endpoint: sub.endpoint };
            }
        })
    );
    
    return results;
};
