import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familyService, FamilyMember } from "@/services/family.service";

export const useFamilyMembers = (userId: string | undefined) => {
  return useQuery<{ members: FamilyMember[] }>({
    queryKey: ["family", "members", userId],
    queryFn: () => familyService.getMembers(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useInviteFamilyMember = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; name?: string; relationship: string }) =>
      familyService.invite(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members", userId] });
    },
  });
};

export const useRespondToInvite = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId, status }: { inviteId: string; status: "accepted" | "declined" }) =>
      familyService.respondToInvite(userId!, inviteId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
