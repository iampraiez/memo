import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { familyService, FamilyMember } from "@/services/family.service";

export const useFamilyMembers = () => {
  const members = useLiveQuery(async () => {
    const userId = await familyService.getCurrentUserId();
    if (!userId) return [];
    return await db.familyMembers.where("userId").equals(userId).toArray();
  });

  const query = useQuery<{ members: FamilyMember[] }>({
    queryKey: ["family", "members"],
    queryFn: () => familyService.getMembers(),
    structuralSharing: true,
  });

  return {
    ...query,
    data: members ? { members: members as FamilyMember[] } : query.data,
  };
};

export const useInviteFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; name?: string; relationship: string }) =>
      familyService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members"] });
    },
  });
};
