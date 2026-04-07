import React, { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-gradient-to-br via-white">
          <div className="flex animate-pulse flex-col items-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-neutral-200" />
            <div className="h-8 w-48 rounded bg-neutral-200" />
          </div>
        </div>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}
