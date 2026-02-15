import React, { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br via-white">
          <div className="flex animate-pulse flex-col items-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-neutral-200" />
            <div className="h-8 w-48 rounded bg-neutral-200" />
          </div>
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
