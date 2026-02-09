import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingProps {
  fullPage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loading({ 
  fullPage = false, 
  className, 
  size = 'md',
  text = "Loading..."
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-lg",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const content = (
    <div className={cn("text-center space-y-4", className)}>
      <div className="relative">
        <div
          className={cn(
            "bg-linear-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-primary-600/20",
            iconSizes[size],
          )}
        >
          <span
            className={cn(
              "text-white font-bold",
              size === "sm" ? "text-xs" : "text-xl",
            )}
          >
            ML
          </span>
        </div>
        <div className={cn("absolute inset-0 mx-auto", iconSizes[size])}>
          <div
            className={cn(
              "w-full h-full border-4 border-primary-200 border-t-primary-600 rounded-2xl animate-spin",
            )}
          ></div>
        </div>
      </div>
      {text && (
        <p className="text-neutral-500 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return <div className="space-y-6">{content}</div>;
  }

  return content;
}
