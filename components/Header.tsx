import React from 'react'
import { Plus, Cloud, CloudSlash, List, Bell } from "@phosphor-icons/react";
import Button from "./ui/Button";
import { cn } from "@/lib/utils";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  onCreateMemory: () => void;
  onToggleSidebar: () => void;
  onShowNotifications?: () => void;
  syncStatus: "online" | "offline" | "syncing";
  notificationCount?: number;
  className?: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onCreateMemory,
  onToggleSidebar,
  onShowNotifications,
  syncStatus,
  notificationCount = 0,
  className,
  onNavigate, // Destructure onNavigate
}) => {
  const syncIcons = {
    online: Cloud,
    offline: CloudSlash,
    syncing: Cloud,
  };

  const SyncIcon = syncIcons[syncStatus];

  return (
    <header
      className={cn(
        "bg-white/90 backdrop-blur-xl border-b border-neutral-200/60 sticky top-0 z-40 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button - Refined */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden w-10 h-10 hover:bg-neutral-100 rounded-xl transition-all"
            >
              <List weight="bold" className="w-5 h-5 text-neutral-900" />
            </Button>
...
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync Status - Refined Pill */}
            <div
              className={cn(
                "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                syncStatus === "online" && "text-emerald-700 bg-emerald-50 border border-emerald-100/50",
                syncStatus === "offline" && "text-neutral-500 bg-neutral-100 border border-neutral-200/50",
                syncStatus === "syncing" && "text-primary-700 bg-primary-50 border border-primary-100/50"
              )}
            >
              <SyncIcon
                className={cn(
                  "w-3 h-3",
                  syncStatus === "syncing" && "animate-spin"
                )}
              />
              <span className="hidden lg:inline">
                {syncStatus === "online"
                  ? "Cloud Active"
                  : syncStatus === "offline"
                  ? "Local Mode"
                  : "Syncing"}
              </span>
            </div>

            {/* Notifications - Refined Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-10 h-10 hover:bg-neutral-100 rounded-xl transition-all"
              onClick={onShowNotifications}
            >
              <Bell weight="bold" className="w-5 h-5 text-neutral-700" />
              {notificationCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive-500 rounded-full ring-2 ring-white" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 flex items-center justify-center bg-destructive-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] px-1 rounded-full border border-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                </>
              )}
            </Button>

            {/* Quick Add Button - Master Action Cleaned */}
            <Button
              variant="primary"
              onClick={onCreateMemory}
              className="h-10 px-4 sm:px-5 rounded-xl bg-primary-900 shadow-md shadow-primary-900/10 hover:shadow-lg hover:shadow-primary-900/20 active:scale-95 transition-all group"
            >
              <Plus weight="bold" className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-xs tracking-tight">New Memory</span>
            </Button>

            {/* Profile - Integrated Separator */}
            <div className="pl-1 sm:pl-2 ml-1 sm:ml-2 border-l border-neutral-200/50">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
