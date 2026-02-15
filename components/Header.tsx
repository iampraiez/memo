import React from "react";
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
        "sticky top-0 z-40 border-b border-neutral-200/60 bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300",
        className,
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button - Refined */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-10 w-10 rounded-xl transition-all hover:bg-neutral-100 lg:hidden"
            >
              <List weight="bold" className="h-5 w-5 text-neutral-900" />
            </Button>
            ...
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync Status - Refined Pill */}
            <div
              className={cn(
                "hidden items-center space-x-2 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all sm:flex",
                syncStatus === "online" &&
                  "border border-emerald-100/50 bg-emerald-50 text-emerald-700",
                syncStatus === "offline" &&
                  "border border-neutral-200/50 bg-neutral-100 text-neutral-500",
                syncStatus === "syncing" &&
                  "text-primary-700 bg-primary-50 border-primary-100/50 border",
              )}
            >
              <SyncIcon className={cn("h-3 w-3", syncStatus === "syncing" && "animate-spin")} />
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
              className="relative h-10 w-10 rounded-xl transition-all hover:bg-neutral-100"
              onClick={onShowNotifications}
            >
              <Bell weight="bold" className="h-5 w-5 text-neutral-700" />
              {notificationCount > 0 && (
                <>
                  <span className="bg-destructive-500 absolute top-2 right-2 h-2 w-2 rounded-full ring-2 ring-white" />
                  <span className="bg-destructive-500 absolute top-2 right-2 h-2 w-2 animate-ping rounded-full" />
                  <span className="bg-destructive-500 absolute -top-1 -right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full border border-white px-1 text-[8px] font-bold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                </>
              )}
            </Button>

            {/* Quick Add Button - Master Action Cleaned */}
            <Button
              variant="primary"
              onClick={onCreateMemory}
              className="bg-primary-900 shadow-primary-900/10 hover:shadow-primary-900/20 group h-10 rounded-xl px-4 shadow-md transition-all hover:shadow-lg active:scale-95 sm:px-5"
            >
              <Plus weight="bold" className="h-4 w-4 sm:mr-2" />
              <span className="hidden text-xs font-bold tracking-tight sm:inline">New Memory</span>
            </Button>

            {/* Profile - Integrated Separator */}
            <div className="ml-1 border-l border-neutral-200/50 pl-1 sm:ml-2 sm:pl-2">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
