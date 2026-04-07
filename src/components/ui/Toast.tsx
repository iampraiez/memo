import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: AlertCircle,
  };

  const styles = {
    success: "bg-success-50 border-success-200 text-success-800",
    error: "bg-destructive-50 border-destructive-200 text-destructive-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    info: "bg-primary-50 border-primary-200 text-primary-800",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "shadow-soft-lg flex items-start space-x-3 rounded-lg border p-4 transition-all duration-200",
        styles[type],
        isVisible ? "animate-slide-in" : "translate-y-2 transform opacity-0",
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 200);
        }}
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
