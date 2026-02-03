import React from 'react';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-xl mx-auto"></div>
          <div className="space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-neutral-100 rounded"></div>
            <div className="h-10 bg-neutral-100 rounded"></div>
          </div>
          <div className="h-10 bg-primary-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}
