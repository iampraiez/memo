import React from 'react';
import MemoryCardSkeleton from '@/components/skeletons/MemoryCardSkeleton';

export default function MainLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex">
      {/* Sidebar Skeleton (Hidden on mobile) */}
      <div className="hidden lg:block w-64 h-full fixed left-0 top-0 bg-white border-r border-neutral-200 p-6 space-y-8">
        <div className="h-8 bg-neutral-200 rounded w-32 mb-10"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-neutral-100 rounded w-full"></div>
          ))}
        </div>
      </div>

      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
            <div className="h-10 bg-neutral-200 rounded w-48"></div>
            <div className="h-10 bg-primary-100 rounded w-32"></div>
          </div>

          {/* Timeline Skeleton */}
          <div className="space-y-12">
            {[...Array(2)].map((_, yearIndex) => (
              <div key={yearIndex} className="space-y-6">
                {/* Year Header Skeleton */}
                <div className="h-10 bg-neutral-100 rounded w-24"></div>
                
                <div className="space-y-8 sm:pl-4">
                  {[...Array(2)].map((_, monthIndex) => (
                    <div key={monthIndex} className="space-y-6">
                      {/* Month Header Skeleton */}
                      <div className="h-6 bg-neutral-50 rounded w-32 ml-2"></div>
                      
                      <div className="space-y-8 pl-4 sm:pl-6 border-l border-neutral-100 ml-4">
                        {[...Array(1)].map((_, dayIndex) => (
                          <div key={dayIndex} className="space-y-4 relative">
                            {/* Day Bullet */}
                            <div className="absolute -left-[21px] sm:-left-[29px] top-2 w-2 h-2 rounded-full bg-neutral-200 ring-4 ring-white" />
                            {/* Day Header */}
                            <div className="h-4 bg-neutral-50 rounded w-24"></div>
                            
                            {/* Grid Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                              {[...Array(3)].map((_, i) => (
                                <MemoryCardSkeleton key={i} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
