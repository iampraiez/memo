import React, { useEffect, useState } from "react";
import { Bell, X, Heart, MessageCircle, UserPlus, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface Notification {
  id: string;
  type:
    | "memory_shared"
    | "comment"
    | "reaction"
    | "family_invite"
    | "memory_liked";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  isOpen,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "memory_shared":
        return Share;
      case "comment":
        return MessageCircle;
      case "reaction":
      case "memory_liked":
        return Heart;
      case "family_invite":
        return UserPlus;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "memory_shared":
        return "text-primary-600";
      case "comment":
        return "text-blue-600";
      case "reaction":
      case "memory_liked":
        return "text-red-600";
      case "family_invite":
        return "text-green-600";
      default:
        return "text-neutral-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div
        className={cn(
          "absolute right-4 top-20 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-soft-xl border border-neutral-200 transition-all duration-200",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-neutral-50 cursor-pointer transition-colors",
                      !notification.read && "bg-primary-50/50"
                    )}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                          <Icon className={cn("w-5 h-5", iconColor)} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-neutral-900 text-sm">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                          {new Date(
                            notification.timestamp
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
