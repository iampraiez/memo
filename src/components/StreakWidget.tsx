"use client";
import React from "react";
import { useStreak } from "@/hooks/useMemories";
import Card from "./ui/Card";
import { Fire, Trophy, Flame } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StreakWidget() {
  const { data: streak, isLoading } = useStreak();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || streak === undefined) return null;

  const isHot = streak >= 7;
  const isLegendary = streak >= 30;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        streak > 0
          ? "border-amber-100 bg-linear-to-br from-amber-50/50 to-orange-50/30"
          : "border-neutral-100 bg-neutral-50/30",
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
          <div
            className={cn(
              "flex items-center space-x-2",
              streak > 0 ? "text-amber-600" : "text-neutral-400",
            )}
          >
            {streak > 0 ? <Fire weight="fill" size={16} /> : <Flame size={16} />}
            <span>Daily Streak</span>
          </div>
          {isLegendary && (
            <span className="animate-pulse rounded-full bg-orange-600 px-2 py-0.5 text-white">
              Legendary
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end space-x-3">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={streak}
            className="flex items-baseline"
          >
            <span
              className={cn(
                "font-display text-4xl leading-none font-bold",
                streak > 0 ? "text-neutral-900" : "text-neutral-400",
              )}
            >
              {streak}
            </span>
            <span className="ml-2 text-sm font-medium text-neutral-500">
              {streak === 1 ? "day" : "days"}
            </span>
          </motion.div>

          {streak > 0 && (
            <div className="mb-1 flex -space-x-1">
              {[...Array(Math.min(streak, 5))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Fire
                    weight="fill"
                    size={14}
                    className={cn(i < streak % 7 ? "text-amber-500" : "text-amber-200")}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-neutral-600">
          {streak === 0
            ? "Start your journey today. Capture a memory to begin your streak!"
            : streak < 3
              ? "Off to a great start! Keep the momentum going."
              : streak < 7
                ? "You're on fire! Don't let the flame go out."
                : "Incredible consistency. Your legacy is growing every day."}
        </p>
      </div>

      {/* Decorative Background Icon */}
      <div className="pointer-events-none absolute -right-4 -bottom-4 rotate-12 opacity-[0.03]">
        {isHot ? <Trophy size={120} weight="fill" /> : <Fire size={120} weight="fill" />}
      </div>
    </Card>
  );
}
