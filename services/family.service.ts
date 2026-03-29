import { apiService } from "./api.service";
import { db, type LocalFamilyMember } from "@/lib/dexie/db";
import { syncService } from "./sync.service";
import { v4 as uuidv4 } from "uuid";

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
  // Get family members (offline-first)
  getMembers: async (userId: string) => {
    if (!userId) return { members: [] };

    // Read from Dexie
    let members = await db.familyMembers.where("userId").equals(userId).toArray();

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ members: FamilyMember[] }>("/family");

        // Update cache
        if (response.members && response.members.length > 0) {
          await db.familyMembers.bulkPut(
            response.members.map((member) => ({
              ...member,
              userId: userId, // Ensure we use the current user's ID for local storage
              _syncStatus: "synced",
              _lastSync: Date.now(),
            })),
          );

          // Re-fetch from Dexie to get refreshed list
          members = await db.familyMembers.where("userId").equals(userId).toArray();
        }

        return response;
      } catch (error) {
        console.error("[FamilyService] Sync failed, using cache:", error);
      }
    }

    return { members: members as FamilyMember[] };
  },

  // Invite family member (optimistic)
  invite: async (userId: string, data: InviteRequest) => {
    if (!userId) throw new Error("User ID is required");

    const tempId = uuidv4();

    const newMember: LocalFamilyMember = {
      id: tempId,
      userId: userId,
      email: data.email,
      name: data.name || data.email,
      relationship: data.relationship,
      status: "pending",
      role: "member",
      _syncStatus: "pending",
      _lastSync: Date.now(),
    };

    // Immediate add to Dexie
    await db.familyMembers.add(newMember);

    try {
      const response = await apiService.post<InviteResponse, InviteRequest>("/family", data);

      // Update the local record with the real ID from server
      if (response.memberId && response.memberId !== tempId) {
        await db.familyMembers.delete(tempId);
        await db.familyMembers.add({
          ...newMember,
          id: response.memberId,
          _syncStatus: "synced",
        });
      } else {
        await db.familyMembers.update(tempId, { _syncStatus: "synced" });
      }

      return response;
    } catch (error) {
      console.error("[FamilyService] Invite failed:", error);
      // Keep in pending or mark as failed
      throw error;
    }
  },

  respondToInvite: async (userId: string, inviteId: string, status: "accepted" | "declined") => {
    if (!userId) throw new Error("User ID is required");

    try {
      const response = await apiService.put<GenericResponse, RespondInviteRequest>("/family", {
        inviteId,
        status,
      });

      // Update local cache
      if (status === "accepted") {
        await db.familyMembers.update(inviteId, {
          status: "accepted",
          _syncStatus: "synced",
        });
      } else {
        await db.familyMembers.delete(inviteId);
      }

      return response;
    } catch (error) {
      console.error("[FamilyService] Response to invite failed:", error);
      throw error;
    }
  },
};
