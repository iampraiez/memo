import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirect users who haven't completed onboarding
  if (!session.user.isOnboarded) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
