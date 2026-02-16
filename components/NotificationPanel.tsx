"use client";
import React, { useEffect } from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { X, Bell, MessageCircle, Heart, UserPlus, Users, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./ui/Button";
import { formatDistanceToNow } from "date-fns";
import Loader from "./ui/Loader";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { data, isLoading, unreadCount } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Mark all as read when opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllRead.mutate();
    }
  }, [isOpen, unreadCount, markAllRead]);

  if (!isOpen) return null;

  const notifications = data?.notifications || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "reaction":
        return <Heart className="h-4 w-4 text-rose-500" fill="currentColor" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case "family_invite":
        return <Users className="h-4 w-4 text-indigo-500" />;
      case "memory_share":
        return <Share className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/5 lg:hidden" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 flex w-full transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-96",
          {
            "translate-x-0": isOpen,
            "translate-x-full": !isOpen,
          },
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-neutral-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-primary-500 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center px-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50">
                <Bell className="h-8 w-8 text-neutral-300" />
              </div>
              <h3 className="mb-1 font-semibold text-neutral-900">No notifications yet</h3>
              <p className="text-sm text-neutral-500">
                We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer items-start space-x-4 px-6 py-5 transition-colors hover:bg-neutral-50/50",
                    !notification.read && "bg-primary-50/30",
                  )}
                  onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                >
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[10px] font-medium text-neutral-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="bg-primary-500 mt-2 h-2 w-2 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-neutral-100 bg-neutral-50/50 p-4">
            <Button
              variant="ghost"
              className="w-full text-xs font-bold text-neutral-500 hover:text-neutral-900"
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
