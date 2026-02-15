"use client";

import React, { Component, ReactNode } from "react";
import Button from "./ui/Button";
import { ArrowsClockwise, Warning } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white p-6">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Warning className="h-8 w-8 text-red-600" weight="fill" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900">Something went wrong</h2>
              <p className="text-neutral-600">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="rounded-lg bg-neutral-50 p-4 text-left">
                <p className="font-mono text-xs break-all text-red-600">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </Button>
              <Button className="flex-1" onClick={() => window.location.reload()}>
                <ArrowsClockwise className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
