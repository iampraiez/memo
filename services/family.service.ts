import { apiService } from "./api.service";

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

export const familyService = {
  getMembers: () => {
    return apiService.get<{ members: FamilyMember[] }>("/family");
  },

  invite: (data: { email: string; name?: string; relationship: string }) => {
    return apiService.post<{ success: boolean }>("/family", data);
  },
};
