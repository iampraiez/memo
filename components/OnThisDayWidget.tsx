"use client";
import React from "react";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Memory } from "@/types/types";
import Image from "next/image";
import { motion } from "framer-motion";

interface OnThisDayWidgetProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
}

export default function OnThisDayWidget({ memories, onMemoryClick }: OnThisDayWidgetProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (memories.length === 0) return null;

  const latestMemory = memories[0];
  const yearsAgo = new Date().getUTCFullYear() - new Date(latestMemory.date).getUTCFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-900 relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="bg-primary-400/10 absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="text-primary-900 bg-secondary-400 flex h-8 w-8 items-center justify-center rounded-full">
              <Sparkles size={16} />
            </div>
            <span className="text-secondary-400 text-xs font-bold tracking-widest uppercase">
              On This Day
            </span>
          </div>

          <h2 className="font-display text-3xl leading-tight font-bold">
            Relive a moment from {yearsAgo} {yearsAgo === 1 ? "year" : "years"} ago
          </h2>

          <p className="text-primary-100 line-clamp-2 max-w-xl text-lg leading-relaxed">
            {latestMemory.summary || latestMemory.content}
          </p>

          <button
            onClick={() => onMemoryClick(latestMemory)}
            className="text-secondary-400 group flex items-center space-x-2 text-sm font-bold transition-all hover:text-white"
          >
            <span>View this memory</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {latestMemory.images && latestMemory.images.length > 0 && (
          <div
            className="relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl md:h-40 md:w-64"
            onClick={() => onMemoryClick(latestMemory)}
          >
            <Image
              src={latestMemory.images[0]}
              alt={latestMemory.title}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
              <Calendar size={12} className="text-white/80" />
              <span className="text-[10px] font-bold text-white">
                {isMounted ? new Date(latestMemory.date).toLocaleDateString() : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
