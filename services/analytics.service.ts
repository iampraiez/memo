import { apiService } from "./api.service";

export interface Analytics {
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

export const analyticsService = {
  get: (timeRange: string = "year") => {
    return apiService.get<Analytics>(`/api/analytics?timeRange=${timeRange}`);
  },
};
