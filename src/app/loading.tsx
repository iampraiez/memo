import React from "react";

export default function Loading() {
  return (
    <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white">
      <div className="space-y-4 text-center">
        <div className="relative">
          <div className="from-primary-600 to-secondary-600 mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-linear-to-br">
            <span className="text-xl font-bold text-white">ML</span>
          </div>
          <div className="absolute inset-0 mx-auto h-16 w-16">
            <div className="border-primary-200 border-t-primary-600 h-full w-full animate-spin rounded-2xl border-4"></div>
          </div>
        </div>
        <p className="font-medium text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}
