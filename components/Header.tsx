import React from "react";
import { List, Bell } from "@phosphor-icons/react";
import Button from "./ui/Button";
import { cn } from "@/lib/utils";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  onToggleSidebar: () => void;
  onShowNotifications?: () => void;
  notificationCount?: number;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onShowNotifications,
  notificationCount = 0,
  className,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-neutral-200/60 bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300",
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
              aria-label="Toggle navigation menu"
              className="h-10 w-10 rounded-xl transition-all hover:bg-neutral-100 lg:hidden"
            >
              <List weight="bold" className="h-5 w-5 text-neutral-900" />
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications - Refined Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl transition-all hover:bg-neutral-100"
              onClick={onShowNotifications}
              aria-label="View notifications"
            >
              <Bell weight="bold" className="h-5 w-5 text-neutral-700" />
              {notificationCount > 0 && (
                <>
                  <span className="bg-destructive-500 absolute top-2 right-2 h-2 w-2 rounded-full ring-2 ring-white" />
                  <span className="bg-destructive-500 absolute top-2 right-2 h-2 w-2 animate-ping rounded-full" />
                  <span className="bg-destructive-500 absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-white px-1 text-[8px] font-bold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                </>
              )}
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
