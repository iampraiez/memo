import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface OfflineBannerProps {
  isVisible: boolean;
  onRetry?: () => void;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isVisible,
  onRetry,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "bg-warning-50 border-b border-warning-200 px-4 py-3",
        "animate-slide-in w-full z-1000 ",
        className
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5 text-warning-600" />
          <div>
            <p className="text-sm font-medium text-warning-800">
              You&apos;re offline
            </p>
            <p className="text-xs text-warning-700">
              Some features may be limited until you reconnect
            </p>
          </div>
        </div>

        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-warning-700 hover:text-warning-800 hover:bg-warning-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
