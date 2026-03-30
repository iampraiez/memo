import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If the user is already authenticated, redirect them away from auth pages
  if (session) {
    redirect("/timeline");
  }

  return <>{children}</>;
}
