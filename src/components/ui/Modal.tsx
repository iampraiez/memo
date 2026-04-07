import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => closeOnOverlayClick && onClose()}
        />

        {/* Modal */}
        <div
          className={cn(
            "shadow-soft-xl animate-scale-in relative w-full rounded-2xl bg-white",
            sizeStyles[size],
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Content */}
          <div className={cn(title ? "p-6" : "p-6")}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
