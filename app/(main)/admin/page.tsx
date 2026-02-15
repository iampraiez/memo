"use client";
import React, { useState } from "react";
import { ChartLine, Database, Users } from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import Loading from "@/components/ui/Loading";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "logs">("overview");
  const { data, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return <Loading fullPage text="Accessing system intelligence..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-destructive-600 mb-4">Failed to load admin data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalMemories: 0,
    storageUsed: "0 TB",
  };
  const health = data?.health || { responseTime: "---", databaseLoad: "---" };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Admin Center</h1>
          <p className="mt-1 text-neutral-600">System intelligence and node management</p>
        </div>
        <div className="bg-primary-900 text-secondary-400 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase">
          Admin Authority
        </div>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {["overview", "jobs", "logs"].map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "overview" | "jobs" | "logs")}
              className={`border-b-2 py-4 text-sm font-bold tracking-widest uppercase transition-all ${
                activeTab === id
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {id}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon={ChartLine}
            />
            <StatCard
              title="Total Memories"
              value={stats.totalMemories.toLocaleString()}
              icon={Database}
            />
            <StatCard title="Storage Used" value={stats.storageUsed} icon={Database} />
          </div>

          <Card className="space-y-6 p-8">
            <h2 className="font-display text-xl font-bold text-neutral-900">System Health</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4">
                <span className="font-medium text-neutral-600">API Response Time</span>
                <span className="text-primary-900 font-bold">{health.responseTime}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4">
                <span className="font-medium text-neutral-600">Database Load</span>
                <span className="text-primary-900 font-bold">{health.databaseLoad}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Simplified Jobs and Logs for brevity in this route migration */}
      {activeTab !== "overview" && (
        <Card className="p-20 text-center">
          <Loading size="md" className="mb-4" text="" />
          <p className="font-medium tracking-widest text-neutral-500 uppercase">
            Management tools coming to this route soon
          </p>
        </Card>
      )}
    </div>
  );
}
