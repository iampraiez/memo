import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familyService, FamilyMember } from "@/services/family.service";

export const useFamilyMembers = () => {
  return useQuery<{ members: FamilyMember[] }>({
    queryKey: ["family", "members"],
    queryFn: () => familyService.getMembers(),
  });
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
