import { useQuery } from "@tanstack/react-query";
import { analyticsService, Analytics } from "@/services/analytics.service";

export const useAnalytics = (timeRange: string = "year") => {
  return useQuery<Analytics>({
    queryKey: ["analytics", timeRange],
    queryFn: () => analyticsService.get(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
