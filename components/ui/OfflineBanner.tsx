import React from "react";
import { WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import { useSync } from "@/components/providers/SyncProvider";

interface OfflineBannerProps {
  isVisible?: boolean;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isVisible: manualVisible,
  className,
}) => {
  const { isOnline, pendingSyncCount, isSyncing, manualSync } = useSync();
  
  // Show if offline OR if we have pending syncs
  const showBanner = manualVisible !== undefined ? manualVisible : (!isOnline || pendingSyncCount > 0);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "px-4 py-2 w-full z-50 transition-all duration-300",
        !isOnline ? "bg-warning-50 border-b border-warning-200" : "bg-primary-50 border-b border-primary-100",
        className
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-warning-600" />
          ) : (
            <Loader2 className={cn("w-4 h-4 text-primary-600", isSyncing && "animate-spin")} />
          )}
          <div>
            <p className={cn("text-xs font-medium", !isOnline ? "text-warning-800" : "text-primary-800")}>
              {!isOnline 
                ? "Working Offline" 
                : isSyncing 
                  ? "Syncing changes..." 
                  : "All changes saved locally"}
            </p>
            {pendingSyncCount > 0 && (
              <p className="text-[10px] text-warning-700">
                {pendingSyncCount} {pendingSyncCount === 1 ? 'change' : 'changes'} waiting to sync
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
            className="h-7 text-[10px] text-primary-700 hover:text-primary-800 hover:bg-primary-100"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1.5", isSyncing && "animate-spin")} />
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
