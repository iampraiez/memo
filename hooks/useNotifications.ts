import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, Notification } from "@/services/notification.service";

export const useNotifications = () => {
  const query = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(),
    refetchInterval: 30000, // Poll every 30 seconds for a "streamed" feel
    staleTime: 1000 * 30,
  });

  const unreadCount = query.data?.notifications?.filter((n) => !n.read).length || 0;

  return {
    ...query,
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

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
