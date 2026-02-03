import React from 'react';

export default function MainPageLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-neutral-200 rounded w-48"></div>
            <div className="h-10 bg-primary-100 rounded w-32"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-100 rounded w-full"></div>
                <div className="h-3 bg-neutral-100 rounded w-5/6"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-primary-100 rounded-full w-16"></div>
                  <div className="h-6 bg-secondary-100 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
