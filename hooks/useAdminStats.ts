import { useQuery } from "@tanstack/react-query";
import { adminService, AdminStats } from "@/services/admin.service";

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
