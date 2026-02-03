import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FamilyMember {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  avatar?: string;
  relationship: string;
  status: "pending" | "accepted";
  role: "member" | "admin";
}

export const useFamilyMembers = () => {
  return useQuery<{ members: FamilyMember[] }>({
    queryKey: ["family", "members"],
    queryFn: async () => {
      const response = await fetch("/api/family");
      if (!response.ok) throw new Error("Failed to fetch family members");
      return response.json();
    },
  });
};

export const useInviteFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; name?: string; relationship: string }) => {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to invite family member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "members"] });
    },
  });
};
