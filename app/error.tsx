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
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="animate-fade-in w-full max-w-md space-y-8 text-center">
        {/* Graphic */}
        <div className="relative mx-auto h-32 w-32">
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-100/50 blur-3xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-red-50 bg-white shadow-xl">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-neutral-900">Something went wrong</h2>
          <p className="text-neutral-500">
            We encountered an unexpected error. Don't worry, your memories are safe.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="max-h-40 overflow-auto rounded-xl bg-red-50 p-4 text-left font-mono text-xs text-red-800">
              {error.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4">
          <Button
            size="lg"
            onClick={reset}
            className="shadow-primary-900/10 rounded-full shadow-lg"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
