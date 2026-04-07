import { apiService } from "./api.service";

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
  // Get notifications (direct from API)
  getAll: async () => {
    try {
      return await apiService.get<{
        notifications: Notification[];
      }>("/notifications");
    } catch (error) {
      console.error("[NotificationService] Fetch failed:", error);
      return { notifications: [] };
    }
  },

  // Mark all as read (direct to API)
  markAllAsRead: async () => {
    try {
      await apiService.patch("/notifications", { readAll: true });
      return { success: true };
    } catch (error) {
      console.error("[NotificationService] Mark all as read failed:", error);
      throw error;
    }
  },

  // Mark one as read (direct to API)
  markAsRead: async (id: string) => {
    try {
      await apiService.patch("/notifications", { id });
      return { success: true };
    } catch (error) {
      console.error("[NotificationService] Mark as read failed:", error);
      throw error;
    }
  },

  // Clear all notifications (direct to API)
  clearAll: async () => {
    try {
      await apiService.delete("/notifications");
      return { success: true };
    } catch (error) {
      console.error("[NotificationService] Clear failed:", error);
      throw error;
    }
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
