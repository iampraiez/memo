"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Memory } from "@/types/types";
import MemoryCard from "./MemoryCard";
import EmptyState from "./ui/EmptyState";

interface TimelineProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
  onShareMemory: (memory: Memory) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  memories,
  onMemoryClick,
  onEditMemory,
  onDeleteMemory,
  onShareMemory,
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    new Set([new Date().getFullYear()])
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group memories by year, month, and day
  const groupedMemories = memories.reduce((acc: Record<number, Record<number, Record<number, Memory[]>>>, memory: Memory) => {
    const date = new Date(memory.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = {};
    if (!acc[year][month][day]) acc[year][month][day] = [];

    acc[year][month][day].push(memory);
    return acc;
  }, {} as Record<number, Record<number, Record<number, Memory[]>>>);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (yearMonth: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedMemories).length > 0 ? (
          Object.keys(groupedMemories)
            .map(Number)
            .sort((a, b) => b - a)
            .map((year) => (
              <div key={year} className="space-y-4">
                {/* Year Header */}
                <div className="sticky top-16 bg-white/95 backdrop-blur-md z-10 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleYear(year)}
                    className="flex items-center space-x-3 text-xl sm:text-2xl font-display font-bold text-neutral-900 hover:text-primary-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      {expandedYears.has(year) ? (
                        <ChevronDown className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" />
                      )}
                    </div>
                    <span>{year}</span>
                  </button>
                  <div className="text-xs font-medium px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full">
                    {Object.values(groupedMemories[year]).reduce(
                      (acc, month) =>
                        acc +
                        Object.values(month).reduce(
                          (acc2, day) => acc2 + day.length,
                          0
                        ),
                      0
                    )}{" "}
                    memories
                  </div>
                </div>

                {/* Year Content */}
                {expandedYears.has(year) && (
                  <div className="space-y-8 sm:pl-4">
                    {Object.keys(groupedMemories[year])
                      .map(Number)
                      .sort((a, b) => b - a)
                      .map((month) => {
                        const yearMonth = `${year}-${month}`;
                        return (
                          <div key={month} className="space-y-6">
                            {/* Month Header */}
                            <button
                              onClick={() => toggleMonth(yearMonth)}
                              className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-neutral-700 hover:text-primary-600 transition-colors pl-2"
                            >
                              {expandedMonths.has(yearMonth) ? (
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              )}
                              <span>{monthNames[month]}</span>
                              <span className="text-xs font-normal text-neutral-400 ml-1 bg-neutral-50 px-2 py-0.5 rounded-full">
                                {Object.values(
                                  groupedMemories[year][month],
                                ).reduce((acc, day) => acc + day.length, 0)}
                              </span>
                            </button>

                            {/* Month Content */}
                            {expandedMonths.has(yearMonth) && (
                              <div className="space-y-8 pl-4 sm:pl-6 border-l border-neutral-100 ml-4 pb-4">
                                {Object.keys(groupedMemories[year][month])
                                  .map(Number)
                                  .sort((a, b) => b - a)
                                  .map((day) => (
                                    <div
                                      key={day}
                                      className="space-y-4 relative"
                                    >
                                      {/* Day Bullet */}
                                      <div className="absolute -left-5.25 sm:-left-7.25 top-2 w-2 h-2 rounded-full bg-primary-400 ring-4 ring-white" />

                                      {/* Day Header */}
                                      <div className="flex items-center space-x-4 mb-4">
                                        <h4 className="text-sm font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full uppercase tracking-widest flex items-center">
                                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                                          {monthNames[month]} {day}
                                        </h4>
                                        <div className="flex-1 h-px bg-neutral-100" />
                                      </div>

                                      {/* Day Memories */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                        {groupedMemories[year][month][day]
                                          .sort(
                                            (a, b) =>
                                              new Date(b.createdAt).getTime() -
                                              new Date(a.createdAt).getTime(),
                                          )
                                          .map((memory) => (
                                            <MemoryCard
                                              key={memory.id}
                                              memory={memory}
                                              onClick={() => {
                                                onMemoryClick(memory);
                                              }}
                                              onEdit={() =>
                                                onEditMemory(memory)
                                              }
                                              onDelete={() =>
                                                onDeleteMemory(memory.id)
                                              }
                                              onShareMemory={() =>
                                                onShareMemory(memory)
                                              }
                                            />
                                          ))}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))
        ) : (
          <EmptyState
            title="Your Story Begins Here"
            description="Your personal timeline is a sanctuary for memories. Begin by capturing your first precious moment using the memory button above."
          />
        )}
      </div>
    </div>
  );
};

export default Timeline;
