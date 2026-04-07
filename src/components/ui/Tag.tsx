import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "mood" | "category";
  size?: "sm" | "md";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({
  children,
  variant = "default",
  size = "sm",
  removable = false,
  onRemove,
  className,
  onClick,
}) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium";

  const variants = {
    default: "bg-primary-100 text-primary-800 border border-primary-200",
    mood: "bg-accent-100 text-accent-800 border border-accent-200",
    category: "bg-secondary-100 text-secondary-800 border border-secondary-200",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} onClick={onClick}>
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default Tag;
