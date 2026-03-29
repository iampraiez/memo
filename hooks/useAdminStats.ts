import { useQuery } from "@tanstack/react-query";
import { adminService, AdminStats } from "@/services/admin.service";

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
    refetchInterval: 300000, // Refetch every 300 seconds
    structuralSharing: true,
  });
};
