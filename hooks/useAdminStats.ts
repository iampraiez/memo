import { useQuery } from "@tanstack/react-query";

interface AdminStats {
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
}

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
