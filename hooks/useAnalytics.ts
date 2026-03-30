import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { Analytics } from "@/types/types";

export const useAnalytics = (timeRange: string = "year") => {
  return useQuery<Analytics>({
    queryKey: ["analytics", timeRange],
    queryFn: () => analyticsService.get(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    structuralSharing: true,
  });
};
