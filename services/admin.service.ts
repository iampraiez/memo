import { apiService } from "./api.service";

export interface AdminStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalMemories: number;
    storageUsed: string;
  };
  jobQueue: Array<{
    id: string;
    type: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: string;
    completedAt?: string;
    error?: string;
  }>;
  logs: Array<{
    id: string;
    level: "info" | "warning" | "error";
    message: string;
    timestamp: string;
    userId?: string;
  }>;
  health: {
    responseTime: string;
    databaseLoad: string;
  };
}

export const adminService = {
  getStats: () => {
    return apiService.get<AdminStats>("/api/admin/stats");
  },
};
