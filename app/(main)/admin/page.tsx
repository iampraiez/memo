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
      <div className="max-w-md mx-auto py-20 text-center">
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Admin Center
          </h1>
          <p className="text-neutral-600 mt-1">
            System intelligence and node management
          </p>
        </div>
        <div className="bg-primary-900 text-secondary-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Admin Authority
        </div>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {["overview", "jobs", "logs"].map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "overview" | "jobs" | "logs")}
              className={`py-4 border-b-2 font-bold text-sm uppercase tracking-widest transition-all ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
            />
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
            <StatCard
              title="Storage Used"
              value={stats.storageUsed}
              icon={Database}
            />
          </div>

          <Card className="p-8 space-y-6">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              System Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                <span className="text-neutral-600 font-medium">
                  API Response Time
                </span>
                <span className="text-primary-900 font-bold">
                  {health.responseTime}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                <span className="text-neutral-600 font-medium">
                  Database Load
                </span>
                <span className="text-primary-900 font-bold">
                  {health.databaseLoad}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Simplified Jobs and Logs for brevity in this route migration */}
      {activeTab !== "overview" && (
        <Card className="p-20 text-center">
          <Loading size="md" className="mb-4" text="" />
          <p className="text-neutral-500 font-medium uppercase tracking-widest">
            Management tools coming to this route soon
          </p>
        </Card>
      )}
    </div>
  );
}
