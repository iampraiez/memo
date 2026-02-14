import { apiService } from "./api.service";
import { db, type LocalNotification } from "@/lib/dexie/db";
import { syncService } from "./sync.service";
import { HttpError } from "@/types/types";

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'reaction' | 'follow' | 'family_invite' | 'memory_share';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  // Get notifications (offline-first)
  getAll: async () => {
    const userId = await notificationService.getCurrentUserId();

    // Read from Dexie
    let notifications = await db.notifications
      .where('userId')
      .equals(userId || '')
      .reverse()
      .sortBy('createdAt');

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{
          notifications: Notification[];
        }>("/notifications");

        // Update cache
        for (const notification of response.notifications) {
          await db.notifications.put({
            ...notification,
            _syncStatus: 'synced',
            _lastSync: Date.now(),
          } as LocalNotification);
        }

        // Re-read
        notifications = await db.notifications
          .where('userId')
          .equals(userId || '')
          .reverse()
          .sortBy('createdAt');

        return response;
      } catch (error) {
        console.error('[NotificationService] Sync failed, using cache:', error);
      }
    }

    return { notifications: notifications as Notification[] };
  },

  // Mark all as read (optimistic)
  markAllAsRead: async () => {
    const userId = await notificationService.getCurrentUserId();

    // Update Dexie
    await db.notifications
      .where('userId')
      .equals(userId || '')
      .modify({ read: true });

    // Queue for sync
    await syncService.queueOperation({
      operation: 'update',
      entity: 'notification',
      entityId: 'all',
      data: { action: 'markAllRead' } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Mark one as read (optimistic)
  markAsRead: async (id: string) => {
    await db.notifications.update(id, { read: true });

    // Queue for sync
    await syncService.queueOperation({
      operation: 'update',
      entity: 'notification',
      entityId: id,
      data: { action: 'markRead' } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentUserId');
    }
    return null;
  },
};

export const sendNotificationToUser = async (
  userId: string,
  payload: { title: string; body: string; data?: never },
) => {
  if (typeof window !== "undefined") {
    console.warn("sendNotificationToUser should only be called on the server");
    return;
  }

  try {
    const { default: webpush } = await import("web-push");
    const { default: drizzleDb } = await import("@/drizzle/index");
    const { pushSubscriptions } = await import("@/drizzle/db/schema");
    const { eq } = await import("drizzle-orm");

    // Configure web-push
    webpush.setVapidDetails(
      `mailto:${process.env.EMAIL_USER || "admin@memo.com"}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );

    // Fetch user subscriptions from drizzle db (server-side)
    const subs = await drizzleDb
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    const notifications = subs.map(async (sub) => {
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
          await drizzleDb
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        } 
        console.error("Error sending push notification:", error);
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
};
