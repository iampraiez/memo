import React from "react";
import { WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import { useSync } from "@/components/providers/SyncProvider";

interface OfflineBannerProps {
  isVisible?: boolean;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isVisible: manualVisible, className }) => {
  const { isOnline, pendingSyncCount, isSyncing, manualSync } = useSync();

  // Show if offline OR if we have pending syncs
  const showBanner =
    manualVisible !== undefined ? manualVisible : !isOnline || pendingSyncCount > 0;

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "z-50 w-full px-4 py-2 transition-all duration-300",
        !isOnline
          ? "bg-warning-50 border-warning-200 border-b"
          : "bg-primary-50 border-primary-100 border-b",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-3">
          {!isOnline ? (
            <WifiOff className="text-warning-600 h-4 w-4" />
          ) : (
            <Loader2 className={cn("text-primary-600 h-4 w-4", isSyncing && "animate-spin")} />
          )}
          <div>
            <p
              className={cn(
                "text-xs font-medium",
                !isOnline ? "text-warning-800" : "text-primary-800",
              )}
            >
              {!isOnline
                ? "Working Offline"
                : isSyncing
                  ? "Syncing changes..."
                  : "All changes saved locally"}
            </p>
            {pendingSyncCount > 0 && (
              <p className="text-warning-700 text-[10px]">
                {pendingSyncCount} {pendingSyncCount === 1 ? "change" : "changes"} waiting to sync
              </p>
            )}
          </div>
        </div>

        {isOnline && pendingSyncCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={manualSync}
            disabled={isSyncing}
            className="text-primary-700 hover:text-primary-800 hover:bg-primary-100 h-7 text-[10px]"
          >
            <RefreshCw className={cn("mr-1.5 h-3 w-3", isSyncing && "animate-spin")} />
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
