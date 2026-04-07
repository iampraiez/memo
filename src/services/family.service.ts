import { apiService } from "./api.service";

export interface FamilyMember {
  id: string;
  userId: string | null;
  ownerId?: string;
  name: string;
  email: string;
  avatar?: string;
  relationship: string;
  status: "pending" | "accepted";
  role: "member" | "admin";
  /** true when the current user is the recipient of the invite (not the sender) */
  isReceived?: boolean;
}

export interface InviteRequest {
  email: string;
  name?: string;
  relationship: string;
}

export interface InviteResponse {
  success: boolean;
  memberId: string;
  message?: string;
}

export interface RespondInviteRequest {
  inviteId: string;
  status: "accepted" | "declined";
}

export interface GenericResponse {
  success: boolean;
  message?: string;
}

export const familyService = {
  // Get family members (direct from API)
  getMembers: async (userId: string) => {
    if (!userId) return { members: [] };

    try {
      return await apiService.get<{ members: FamilyMember[] }>("/family");
    } catch (error) {
      console.error("[FamilyService] Fetch failed:", error);
      return { members: [] };
    }
  },

  // Invite family member (direct to API)
  invite: async (userId: string, data: InviteRequest) => {
    if (!userId) throw new Error("User ID is required");

    try {
      return await apiService.post<InviteResponse, InviteRequest>("/family", data);
    } catch (error) {
      console.error("[FamilyService] Invite failed:", error);
      throw error;
    }
  },

  respondToInvite: async (userId: string, inviteId: string, status: "accepted" | "declined") => {
    if (!userId) throw new Error("User ID is required");

    try {
      return await apiService.put<GenericResponse, RespondInviteRequest>("/family", {
        inviteId,
        status,
      });
    } catch (error) {
      console.error("[FamilyService] Response to invite failed:", error);
      throw error;
    }
  },
};
