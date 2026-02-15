import React from "react";

export default function MemoryCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-neutral-200"></div>
          <div className="flex gap-3">
            <div className="h-4 w-20 rounded bg-neutral-100"></div>
            <div className="h-4 w-24 rounded bg-neutral-100"></div>
          </div>
        </div>
        <div className="h-8 w-8 rounded-lg bg-neutral-100"></div>
      </div>

      {/* Image Placeholder */}
      <div className="aspect-video rounded-lg bg-neutral-100"></div>

      {/* Content Placeholder */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-neutral-100"></div>
        <div className="h-4 w-5/6 rounded bg-neutral-100"></div>
      </div>

      {/* Footer Placeholder */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-neutral-100"></div>
          <div className="h-6 w-12 rounded-full bg-neutral-100"></div>
        </div>
        <div className="h-4 w-8 rounded bg-neutral-100"></div>
      </div>
    </div>
  );
}
