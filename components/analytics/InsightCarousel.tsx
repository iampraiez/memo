"use client";
import { useState, useEffect } from "react";
import { Sparkle, TrendUp, Heart, Calendar, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const insights = [
  {
    icon: Sparkle,
    title: "Travel Patterns",
    content: "Your most vibrant memories are often captured during travel. These moments show high levels of joy and exploration.",
    color: "text-secondary-400",
  },
  {
    icon: Heart,
    title: "Grateful Reflections",
    content: "We've noticed a significant increase in grateful reflections this month—keep preserving these precious highlights.",
    color: "text-rose-400",
  },
  {
    icon: Calendar,
    title: "Weekend Rhythm",
    content: "Your weekend memories tend to be more descriptive and emotionally rich. They form the core of your heritage narrative.",
    color: "text-blue-400",
  },
  {
    icon: TrendUp,
    title: "Growth Trend",
    content: "Your consistency in capturing daily moments has increased by 15% this month. This builds a robust AI knowledge base.",
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
    <div className="bg-linear-to-br from-white via-neutral-50 to-primary-50/30 rounded-[2.5rem] p-10 text-neutral-900 relative overflow-hidden group border border-neutral-100 shadow-soft-xl transition-all duration-500 hover:shadow-primary-900/5">
      {/* Decorative Background Elements - Softened */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-200/10 rounded-full blur-[100px] -ml-32 -mb-32" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-10 z-10">
        <div
          className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm",
            "bg-white border border-neutral-100 group-hover:scale-110",
            isExiting ? "opacity-0 scale-90" : "opacity-100 scale-100",
          )}
        >
          <Icon
            className={cn("w-10 h-10")}
            weight="duotone"
          />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left h-full flex flex-col justify-center">
          <div
            className={cn(
              "space-y-2 transition-all duration-500",
              isExiting
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0",
            )}
          >
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                AI Sanctuary Insight
              </span>
            </div>
            <h3 className="text-3xl font-display font-bold italic tracking-tight text-neutral-900">
              {activeInsight.title}
            </h3>
            <p className="text-xl text-neutral-600 font-light leading-relaxed max-w-2xl">
              "{activeInsight.content}"
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-1.5 pt-4">
            {insights.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  idx === currentIndex
                    ? "w-8 bg-primary-600"
                    : "bg-neutral-200 w-1.5",
                )}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center self-center">
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % insights.length);
                setIsExiting(false);
              }, 500);
            }}
            className="w-12 h-12 rounded-full bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 shadow-sm transition-all group/btn"
          >
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover/btn:text-neutral-900 group-hover/btn:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}
