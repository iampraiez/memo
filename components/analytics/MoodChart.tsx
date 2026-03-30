"use client";

import React from "react";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Smiley, Info } from "@phosphor-icons/react";

interface MoodChartProps {
  data: { mood: string; count: number; percentage: number }[];
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#EC4899", // Pink
];

export default function MoodChart({ data }: MoodChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-neutral-400">
        No emotional patterns detected yet.
      </div>
    );
  }

  // Pre-process data for RadialBarChart
  const chartData = data.map((item, index) => ({
    name: item.mood,
    value: item.percentage,
    count: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const dominantMood = data[0]?.mood || "balanced";

  return (
    <div className="flex w-full flex-col">
      <div className="relative h-80 w-full">
        {/* Center Indicator */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
          <div className="bg-primary-50 border-primary-100 flex h-16 w-16 items-center justify-center rounded-full border shadow-inner">
            <Smiley size={32} weight="duotone" className="text-primary-600" />
          </div>
          <p className="mt-2 text-xs font-bold tracking-widest text-neutral-400 uppercase">
            Balance
          </p>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="100%"
            barSize={12}
            data={chartData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
              background={{ fill: "#f3f4f6" }}
              dataKey="value"
              cornerRadius={10}
            />
            <Tooltip
              cursor={{ stroke: "#f3f4f6", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-neutral-100 bg-white p-3 shadow-xl backdrop-blur-md">
                      <p className="text-xs font-bold text-neutral-400 uppercase">{data.name}</p>
                      <p className="font-display text-lg font-bold text-neutral-900">
                        {data.value}%
                      </p>
                      <p className="text-[10px] text-neutral-500">{data.count} memories</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: "11px", fontWeight: "bold", paddingTop: "20px" }}
              formatter={(value) => <span className="text-neutral-600 capitalize">{value}</span>}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Section */}
      <div className="border-primary-100 bg-primary-50/50 mt-8 rounded-2xl border p-4">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 rounded-lg bg-white p-1 shadow-sm">
            <Info size={16} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-primary-900 text-xs font-bold uppercase">Pattern Insight</h4>
            <p className="text-primary-800 mt-1 text-sm leading-relaxed">
              Your overall balance is primarily <strong>{dominantMood}</strong>.
              {data.length > 1
                ? ` This mood accounts for ${data[0].percentage}% of your reflections in this period.`
                : " Consistent emotional tracking provides deeper AI heritage accuracy."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
