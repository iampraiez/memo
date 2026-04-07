"use client";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

interface TimelineGroupHeaderProps {
  title: string;
  count: number;
  level: "year" | "month";
  isExpanded: boolean;
  onToggle: () => void;
  isSticky?: boolean;
}

const TimelineGroupHeader: React.FC<TimelineGroupHeaderProps> = ({
  title,
  count,
  level,
  isExpanded,
  onToggle,
  isSticky = false,
}) => {
  const baseStyles =
    "flex items-center space-x-2 hover:text-primary-600 transition-colors cursor-pointer";

  const levelStyles = {
    year: "text-2xl font-bold text-neutral-900 py-2",
    month: "text-lg font-semibold text-neutral-700 py-1",
  };

  const stickyStyles = isSticky
    ? "sticky top-20 bg-white/90 backdrop-blur-sm z-10 border-b border-neutral-200"
    : "";

  return (
    <div className={cn(stickyStyles)}>
      <button onClick={onToggle} className={cn(baseStyles, levelStyles[level])}>
        {isExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        <span>{title}</span>
        <span className="ml-2 text-sm font-normal text-neutral-500">
          ({count} {count === 1 ? "memory" : "memories"})
        </span>
      </button>
    </div>
  );
};

export default TimelineGroupHeader;
