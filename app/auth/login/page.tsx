import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
          <div className="h-8 w-48 bg-neutral-200 rounded" />
        </div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
