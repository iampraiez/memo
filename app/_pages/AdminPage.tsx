"use client";
import React, { useState } from "react";
import { ChartLine, Database, Users, ArrowsClockwise, Trash } from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useAdminStats } from "@/hooks/useAdminStats";

interface JobQueueItem {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface LogEntry {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  timestamp: string;
  userId?: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "logs">(
    "overview"
  );

  const { data, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center p-6">
            <p className="text-destructive-600 mb-4">Failed to load admin data</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalMemories: 0,
    storageUsed: "0 TB",
  };

  const jobQueue: JobQueueItem[] = data?.jobQueue || [];
  const logs: LogEntry[] = data?.logs || [];

  const getJobStatusColor = (status: JobQueueItem["status"]) => {
    switch (status) {
      case "pending":
        return "text-warning-600 bg-warning-100";
      case "processing":
        return "text-primary-600 bg-primary-100";
      case "completed":
        return "text-success-600 bg-success-100";
      case "failed":
        return "text-destructive-600 bg-destructive-100";
    }
  };

  const getLogLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "text-primary-600 bg-primary-100";
      case "warning":
        return "text-warning-600 bg-warning-100";
      case "error":
        return "text-destructive-600 bg-destructive-100";
    }
  };

  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="flex">
        <main className="flex">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold text-neutral-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    System monitoring and management
                  </p>
                </div>

                <div className="bg-destructive-100 border border-destructive-200 rounded-lg px-3 py-1">
                  <span className="text-destructive-800 text-sm font-medium">
                    Admin Only
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-neutral-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "overview", label: "Overview", icon: ChartLine },
                    { id: "jobs", label: "Job Queue", icon: ArrowsClockwise },
                    { id: "logs", label: "System Logs", icon: Database },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() =>
                          setActiveTab(tab.id as "overview" | "jobs" | "logs")
                        }
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Users"
                      value={stats.totalUsers.toLocaleString()}
                      icon={Users}
                      change={{ value: "+12%", trend: "up" }}
                    />
                    <StatCard
                      title="Active Users"
                      value={stats.activeUsers.toLocaleString()}
                      icon={ChartLine}
                      change={{ value: "+8%", trend: "up" }}
                    />
                    <StatCard
                      title="Total Memories"
                      value={stats.totalMemories.toLocaleString()}
                      icon={Database}
                      change={{ value: "+156", trend: "up" }}
                    />
                    <StatCard
                      title="Storage Used"
                      value={stats.storageUsed}
                      icon={Database}
                      change={{ value: "+0.2TB", trend: "up" }}
                    />
                  </div>

                  {/* System Health */}
                  <Card>
                    <div className="p-6 border-b border-neutral-200">
                      <h2 className="text-xl font-semibold text-neutral-900">
                        System Health
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700">
                          API Response Time
                        </span>
                        <span className="text-success-600 font-medium">
                          142ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700">
                          Database Connections
                        </span>
                        <span className="text-success-600 font-medium">
                          8/20
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700">Memory Usage</span>
                        <span className="text-warning-600 font-medium">
                          78%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700">Disk Usage</span>
                        <span className="text-success-600 font-medium">
                          45%
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "jobs" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Job Queue
                    </h2>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => refetch()}>
                        <ArrowsClockwise className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Trash className="w-4 h-4 mr-2" />
                        Clear Completed
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Job ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {jobQueue.map((job) => (
                            <tr key={job.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-900">
                                {job.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {job.type.replace("_", " ")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getJobStatusColor(
                                    job.status
                                  )}`}
                                >
                                  {job.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                {new Date(job.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "logs" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      System Logs
                    </h2>
                    <Button variant="secondary" size="sm" onClick={() => refetch()}>
                      <ArrowsClockwise className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <Card>
                    <div className="space-y-4 p-6">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-lg"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              getLogLevelColor(log.level).split(" ")[1]
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(
                                  log.level
                                )}`}
                              >
                                {log.level.toUpperCase()}
                              </span>
                              <span className="text-sm text-neutral-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              {log.userId && (
                                <span className="text-sm text-neutral-500">
                                  User: {log.userId}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-900">
                              {log.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
