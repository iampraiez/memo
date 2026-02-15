import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { notificationService, Notification } from "@/services/notification.service";

export const useNotifications = () => {
  const notifications = useLiveQuery(async () => {
    const userId = await notificationService.getCurrentUserId();
    if (!userId) return [];
    return await db.notifications.where("userId").equals(userId).reverse().sortBy("createdAt");
  });

  const query = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(),
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return {
    ...query,
    data: notifications ? { notifications: notifications as Notification[] } : query.data,
    unreadCount,
  };
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
