// SERVER-ONLY: Do NOT import this file in client components or hooks.
// web-push uses Node.js built-ins (net, tls, fs) that cannot be bundled for the browser.
// Import only from: API routes (app/api/**) or Server Components.

import webpush from "web-push";
import drizzleDb from "@/drizzle/index";
import { pushSubscriptions } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { HttpError } from "@/types/types";

export const sendNotificationToUser = async (
  userId: string,
  payload: { title: string; body: string; data?: Record<string, unknown> },
) => {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_USER || "admin@memo.com"}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const subs = await drizzleDb
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { auth: string; p256dh: string },
          },
          JSON.stringify(payload),
        );
      } catch (error: unknown) {
        if (error instanceof HttpError && (error.statusCode === 410 || error.statusCode === 404)) {
          // Subscription expired or invalid — clean it up
          await drizzleDb.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
        console.error("Error sending push notification:", error);
      }
    }),
  );
};
