"use client";

import { useEffect } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Graphic */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-red-100/50 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-white rounded-3xl shadow-xl flex items-center justify-center w-full h-full border border-red-50">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-neutral-900">
            Something went wrong
          </h2>
          <p className="text-neutral-500">
            We encountered an unexpected error. Don't worry, your memories are safe.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-left bg-red-50 p-4 rounded-xl overflow-auto max-h-40 text-red-800 font-mono">
              {error.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4">
          <Button
            size="lg"
            onClick={reset}
            className="rounded-full shadow-lg shadow-primary-900/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
