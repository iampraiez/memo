import { apiService } from "./api.service";
import { db, type LocalNotification } from "@/lib/dexie/db";
import { syncService } from "./sync.service";

export interface Notification {
  id: string;
  userId: string;
  type: "comment" | "reaction" | "follow" | "family_invite" | "memory_share";
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
      .where("userId")
      .equals(userId || "")
      .reverse()
      .sortBy("createdAt");

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
            _syncStatus: "synced",
            _lastSync: Date.now(),
          } as LocalNotification);
        }

        return response;
      } catch (error) {
        console.error("[NotificationService] Sync failed, using cache:", error);
      }
    }

    return { notifications: notifications as Notification[] };
  },

  // Mark all as read (optimistic)
  markAllAsRead: async () => {
    const userId = await notificationService.getCurrentUserId();

    // Update Dexie
    await db.notifications
      .where("userId")
      .equals(userId || "")
      .modify({ read: true });

    // Queue for sync
    await syncService.queueOperation({
      operation: "update",
      entity: "notification",
      entityId: "all",
      data: { action: "markAllRead" } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Mark one as read (optimistic)
  markAsRead: async (id: string) => {
    await db.notifications.update(id, { read: true });

    // Queue for sync
    await syncService.queueOperation({
      operation: "update",
      entity: "notification",
      entityId: id,
      data: { action: "markRead" } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};

// NOTE: sendNotificationToUser has been moved to:
// services/push-notification.server.ts
// Import it only in Server Components or API route handlers — never in client code.
