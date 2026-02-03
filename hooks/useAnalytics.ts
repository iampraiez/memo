import { useQuery } from "@tanstack/react-query";

interface Analytics {
  totalMemories: number;
  memoriesThisMonth: number;
  averagePerWeek: number;
  longestStreak: number;
  topMoods: Array<{
    mood: string;
    count: number;
    percentage: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    memories: number;
  }>;
  weeklyPattern: Array<{
    day: string;
    memories: number;
  }>;
}

export const useAnalytics = (timeRange: string = "year") => {
  return useQuery<Analytics>({
    queryKey: ["analytics", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
