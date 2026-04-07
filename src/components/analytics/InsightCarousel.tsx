"use client";
import { useState, useEffect } from "react";
import { Sparkle, TrendUp, Heart, Calendar, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const insights = [
  {
    icon: Sparkle,
    title: "Travel Patterns",
    content:
      "Your most vibrant memories are often captured during travel. These moments show high levels of joy and exploration.",
    color: "text-secondary-400",
  },
  {
    icon: Heart,
    title: "Grateful Reflections",
    content:
      "We've noticed a significant increase in grateful reflections this month—keep preserving these precious highlights.",
    color: "text-rose-400",
  },
  {
    icon: Calendar,
    title: "Weekend Rhythm",
    content:
      "Your weekend memories tend to be more descriptive and emotionally rich. They form the core of your heritage narrative.",
    color: "text-blue-400",
  },
  {
    icon: TrendUp,
    title: "Growth Trend",
    content:
      "Your consistency in capturing daily moments has increased by 15% this month. This builds a robust AI knowledge base.",
    color: "text-emerald-400",
  },
];

export default function InsightCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
        setIsExiting(false);
      }, 500); // Wait for fade out
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, []);

  const activeInsight = insights[currentIndex];
  const Icon = activeInsight.icon;

  return (
    <div className="to-primary-50/30 group shadow-soft-xl hover:shadow-primary-900/5 relative overflow-hidden rounded-[2.5rem] border border-neutral-100 bg-linear-to-br from-white via-neutral-50 p-10 text-neutral-900 transition-all duration-500">
      {/* Decorative Background Elements - Softened */}
      <div className="bg-primary-200/20 absolute top-0 right-0 -mt-32 -mr-32 h-96 w-96 rounded-full blur-[120px]" />
      <div className="bg-secondary-200/10 absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center space-y-8 md:flex-row md:items-start md:space-y-0 md:space-x-10">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl shadow-sm transition-all duration-500",
            "border border-neutral-100 bg-white group-hover:scale-110",
            isExiting ? "scale-90 opacity-0" : "scale-100 opacity-100",
          )}
        >
          <Icon className={cn("h-10 w-10")} weight="duotone" />
        </div>

        <div className="flex h-full flex-1 flex-col justify-center space-y-4 text-center md:text-left">
          <div
            className={cn(
              "space-y-2 transition-all duration-500",
              isExiting ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            <div className="flex items-center justify-center space-x-2 md:justify-start">
              <span className="text-primary-600 bg-primary-50 border-primary-100 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase">
                AI Sanctuary Insight
              </span>
            </div>
            <h3 className="font-display text-3xl font-bold tracking-tight text-neutral-900 italic">
              {activeInsight.title}
            </h3>
            <p className="max-w-2xl text-xl leading-relaxed font-light text-neutral-600">
              "{activeInsight.content}"
            </p>
          </div>

          <div className="flex items-center justify-center space-x-1.5 pt-4 md:justify-start">
            {insights.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  idx === currentIndex ? "bg-primary-600 w-8" : "w-1.5 bg-neutral-200",
                )}
              />
            ))}
          </div>
        </div>

        <div className="hidden items-center self-center lg:flex">
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % insights.length);
                setIsExiting(false);
              }, 500);
            }}
            className="group/btn flex h-12 w-12 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-sm transition-all hover:bg-neutral-50"
          >
            <ArrowRight className="h-5 w-5 text-neutral-400 transition-all group-hover/btn:translate-x-0.5 group-hover/btn:text-neutral-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
