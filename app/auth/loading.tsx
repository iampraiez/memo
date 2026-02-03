import React from 'react';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 space-y-8 animate-pulse">
        {/* Logo/Icon */}
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl mx-auto"></div>
        
        {/* Title/Subtitle */}
        <div className="space-y-3 text-center">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto"></div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-50 rounded w-12"></div>
            <div className="h-12 bg-neutral-100 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-50 rounded w-20"></div>
            <div className="h-12 bg-neutral-100 rounded w-full"></div>
          </div>
        </div>

        {/* Primary Button */}
        <div className="h-12 bg-primary-100 rounded-full w-full"></div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-300">or</span>
          </div>
        </div>

        {/* OAuth Button */}
        <div className="h-12 border border-neutral-100 rounded-full w-full"></div>

        {/* Footer Link */}
        <div className="h-4 bg-neutral-50 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );
}
