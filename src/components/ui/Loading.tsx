import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  fullPage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function Loading({
  fullPage = false,
  className,
  size = "md",
  text = "Loading...",
}: LoadingProps) {
  // const sizeClasses = {
  //   sm: "w-8 h-8 text-sm",
  //   md: "w-16 h-16 text-base",
  //   lg: "w-24 h-24 text-lg",
  // };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const content = (
    <div className={cn("space-y-4 text-center", className)}>
      <div className="relative">
        <div
          className={cn(
            "from-primary-600 to-secondary-600 shadow-primary-600/20 mx-auto flex animate-pulse items-center justify-center rounded-2xl bg-linear-to-br shadow-lg",
            iconSizes[size],
          )}
        >
          <span className={cn("font-bold text-white", size === "sm" ? "text-xs" : "text-xl")}>
            ML
          </span>
        </div>
        <div className={cn("absolute inset-0 mx-auto", iconSizes[size])}>
          <div
            className={cn(
              "border-primary-200 border-t-primary-600 h-full w-full animate-spin rounded-2xl border-4",
            )}
          ></div>
        </div>
      </div>
      {text && <p className="animate-pulse font-medium text-neutral-500">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
