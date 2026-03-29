import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { familyService, FamilyMember } from "@/services/family.service";

export const useFamilyMembers = (userId: string | undefined) => {
  const members = useLiveQuery(async () => {
    if (!userId) return [];
    return await db.familyMembers.where("userId").equals(userId).toArray();
  }, [userId]);

  const query = useQuery<{ members: FamilyMember[] }>({
    queryKey: ["family", "members", userId],
    queryFn: () => familyService.getMembers(userId!),
    enabled: !!userId,
    structuralSharing: true,
  });

  return {
    ...query,
    data: members ? { members: members as FamilyMember[] } : query.data,
  };
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
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
};
