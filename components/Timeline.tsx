"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Memory } from "@/types/types";
import MemoryCard from "./MemoryCard";
import Button from "./ui/Button";

interface TimelineProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void; // Add this prop
  onDeleteMemory: (memoryId: string) => void; // Add this prop
  onShareMemory: (memory: Memory) => void; // Add this prop
}

const Timeline: React.FC<TimelineProps> = ({
  memories,
  onMemoryClick,
  onEditMemory, // Destructure new prop
  onDeleteMemory, // Destructure new prop
  onShareMemory, // Destructure new prop
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    new Set([2024])
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group memories by year, month, and day
  const groupedMemories = memories.reduce((acc, memory) => {
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
                <div className="sticky top-20 bg-white/90 backdrop-blur-sm z-10 py-2 border-b border-neutral-200">
                  <button
                    onClick={() => toggleYear(year)}
                    className="flex items-center space-x-2 text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors"
                  >
                    {expandedYears.has(year) ? (
                      <ChevronDown className="w-6 h-6" />
                    ) : (
                      <ChevronRight className="w-6 h-6" />
                    )}
                    <span>{year}</span>
                    <span className="text-sm font-normal text-neutral-500 ml-2">
                      (
                      {Object.values(groupedMemories[year]).reduce(
                        (acc, month) =>
                          acc +
                          Object.values(month).reduce(
                            (acc2, day) => acc2 + day.length,
                            0
                          ),
                        0
                      )}{" "}
                      memories)
                    </span>
                  </button>
                </div>

                {/* Year Content */}
                {expandedYears.has(year) && (
                  <div className="space-y-6 pl-8">
                    {Object.keys(groupedMemories[year])
                      .map(Number)
                      .sort((a, b) => b - a)
                      .map((month) => {
                        const yearMonth = `${year}-${month}`;
                        return (
                          <div key={month} className="space-y-4">
                            {/* Month Header */}
                            <button
                              onClick={() => toggleMonth(yearMonth)}
                              className="flex items-center space-x-2 text-lg font-semibold text-neutral-700 hover:text-primary-600 transition-colors"
                            >
                              {expandedMonths.has(yearMonth) ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                              <span>{monthNames[month]}</span>
                              <span className="text-sm font-normal text-neutral-500 ml-2">
                                (
                                {Object.values(
                                  groupedMemories[year][month]
                                ).reduce(
                                  (acc, day) => acc + day.length,
                                  0
                                )}{" "}
                                memories)
                              </span>
                            </button>

                            {/* Month Content */}
                            {expandedMonths.has(yearMonth) && (
                              <div className="space-y-4 pl-6">
                                {Object.keys(groupedMemories[year][month])
                                  .map(Number)
                                  .sort((a, b) => b - a)
                                  .map((day) => (
                                    <div key={day} className="space-y-3">
                                      {/* Day Header */}
                                      <h4 className="text-sm font-medium text-neutral-600 border-l-2 border-primary-200 pl-3">
                                        {monthNames[month]} {day}
                                      </h4>

                                      {/* Day Memories */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-5">
                                        {groupedMemories[year][month][day]
                                          .sort(
                                            (a, b) =>
                                              new Date(b.createdAt).getTime() -
                                              new Date(a.createdAt).getTime()
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
          <div className="text-center">
            <Button variant="secondary" size="lg">
              You have no memory
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
