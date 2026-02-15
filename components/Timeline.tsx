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
    new Set([new Date().getFullYear()]),
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group memories by year, month, and day
  const groupedMemories = memories.reduce(
    (acc: Record<number, Record<number, Record<number, Memory[]>>>, memory: Memory) => {
      const date = new Date(memory.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = {};
      if (!acc[year][month][day]) acc[year][month][day] = [];

      acc[year][month][day].push(memory);
      return acc;
    },
    {} as Record<number, Record<number, Record<number, Memory[]>>>,
  );

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
                <div className="sticky top-16 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/95 py-3 backdrop-blur-md">
                  <button
                    onClick={() => toggleYear(year)}
                    className="font-display hover:text-primary-600 group flex items-center space-x-3 text-xl font-bold text-neutral-900 transition-colors sm:text-2xl"
                  >
                    <div className="group-hover:bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 transition-colors">
                      {expandedYears.has(year) ? (
                        <ChevronDown className="group-hover:text-primary-600 h-5 w-5 text-neutral-500" />
                      ) : (
                        <ChevronRight className="group-hover:text-primary-600 h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                    <span>{year}</span>
                  </button>
                  <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                    {Object.values(groupedMemories[year]).reduce(
                      (acc, month) =>
                        acc + Object.values(month).reduce((acc2, day) => acc2 + day.length, 0),
                      0,
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
                              className="hover:text-primary-600 flex items-center space-x-2 pl-2 text-base font-semibold text-neutral-700 transition-colors sm:text-lg"
                            >
                              {expandedMonths.has(yearMonth) ? (
                                <ChevronDown className="h-4 w-4 text-neutral-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                              )}
                              <span>{monthNames[month]}</span>
                              <span className="ml-1 rounded-full bg-neutral-50 px-2 py-0.5 text-xs font-normal text-neutral-400">
                                {Object.values(groupedMemories[year][month]).reduce(
                                  (acc, day) => acc + day.length,
                                  0,
                                )}
                              </span>
                            </button>

                            {/* Month Content */}
                            {expandedMonths.has(yearMonth) && (
                              <div className="ml-4 space-y-8 border-l border-neutral-100 pb-4 pl-4 sm:pl-6">
                                {Object.keys(groupedMemories[year][month])
                                  .map(Number)
                                  .sort((a, b) => b - a)
                                  .map((day) => (
                                    <div key={day} className="relative space-y-4">
                                      {/* Day Bullet */}
                                      <div className="bg-primary-400 absolute top-2 -left-5.25 h-2 w-2 rounded-full ring-4 ring-white sm:-left-7.25" />

                                      {/* Day Header */}
                                      <div className="mb-4 flex items-center space-x-4">
                                        <h4 className="flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold tracking-widest text-neutral-900 uppercase">
                                          <span className="bg-primary-500 mr-2 h-1.5 w-1.5 rounded-full" />
                                          {monthNames[month]} {day}
                                        </h4>
                                        <div className="h-px flex-1 bg-neutral-100" />
                                      </div>

                                      {/* Day Memories */}
                                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
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
                                              onEdit={() => onEditMemory(memory)}
                                              onDelete={() => onDeleteMemory(memory.id)}
                                              onShareMemory={() => onShareMemory(memory)}
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
