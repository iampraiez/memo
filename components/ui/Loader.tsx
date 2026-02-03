import React from "react";
import { cn } from "../../lib/utils";

interface LoaderProps {
  variant?: "spinner" | "dots";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  variant = "spinner",
  size = "md",
  className,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary-600 rounded-full animate-dots",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3",
            )}
            style={{
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600",
        sizes[size],
        className,
      )}
    />
  );
};

export default Loader;
