"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface WeeklyPatternChartProps {
  data: { day: string; memories: number }[];
}

export default function WeeklyPatternChart({ data }: WeeklyPatternChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            name="Memories"
            dataKey="memories"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
