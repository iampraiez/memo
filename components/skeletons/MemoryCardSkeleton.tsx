import React from 'react';

export default function MemoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
          <div className="flex gap-3">
            <div className="h-4 bg-neutral-100 rounded w-20"></div>
            <div className="h-4 bg-neutral-100 rounded w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 bg-neutral-100 rounded-lg"></div>
      </div>

      {/* Image Placeholder */}
      <div className="aspect-video bg-neutral-100 rounded-lg"></div>

      {/* Content Placeholder */}
      <div className="space-y-2">
        <div className="h-4 bg-neutral-100 rounded w-full"></div>
        <div className="h-4 bg-neutral-100 rounded w-5/6"></div>
      </div>

      {/* Footer Placeholder */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <div className="h-6 bg-neutral-100 rounded-full w-16"></div>
          <div className="h-6 bg-neutral-100 rounded-full w-12"></div>
        </div>
        <div className="h-4 bg-neutral-100 rounded w-8"></div>
      </div>
    </div>
  );
}
