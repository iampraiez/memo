"use client";
import React, { useEffect } from "react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { X, Bell, CheckCircle2, MessageCircle, Heart, UserPlus, Users, Share } from "lucide-react";
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
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'reaction': return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'family_invite': return <Users className="w-4 h-4 text-indigo-500" />;
      case 'memory_share': return <Share className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/5 z-40 lg:hidden" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-neutral-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5 text-neutral-500" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 px-10 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-neutral-900 font-semibold mb-1">No notifications yet</h3>
              <p className="text-neutral-500 text-sm">We'll notify you when something important happens.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "px-6 py-5 flex items-start space-x-4 hover:bg-neutral-50/50 transition-colors cursor-pointer",
                    !notification.read && "bg-primary-50/30"
                  )}
                  onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                >
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-neutral-600 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
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
