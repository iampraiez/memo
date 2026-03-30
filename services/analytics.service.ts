import { apiService } from "./api.service";
import { Analytics } from "@/types/types";

export const analyticsService = {
  get: (timeRange: string = "year") => {
    return apiService.get<Analytics>(`/analytics?timeRange=${timeRange}`);
  },
};
