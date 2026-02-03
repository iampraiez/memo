import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import Card from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
}) => {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        {change && (
          <div
            className={cn(
              "text-sm font-medium",
              change.trend === "up" && "text-success-600",
              change.trend === "down" && "text-destructive-600",
              change.trend === "neutral" && "text-neutral-600",
            )}
          >
            {change.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
        <p className="text-neutral-600 text-sm">{title}</p>
      </div>
    </Card>
  );
};

export default StatCard;
