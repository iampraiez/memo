import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 bg-linear-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">ML</span>
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-primary-200 border-t-primary-600 rounded-2xl animate-spin"></div>
          </div>
        </div>
        <p className="text-neutral-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
