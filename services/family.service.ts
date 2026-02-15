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

export const familyService = {
  // Get family members (offline-first)
  getMembers: async () => {
    const userId = await familyService.getCurrentUserId();

    // Read from Dexie
    let members = await db.familyMembers
      .where("userId")
      .equals(userId || "")
      .toArray();

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ members: FamilyMember[] }>("/family");

        // Update cache
        for (const member of response.members) {
          await db.familyMembers.put({
            ...member,
            userId: member.userId || "", // Ensure userId is a string
            _syncStatus: "synced",
            _lastSync: Date.now(),
          });
        }

        // Re-read
        members = await db.familyMembers
          .where("userId")
          .equals(userId || "")
          .toArray();

        return response;
      } catch (error) {
        console.error("[FamilyService] Sync failed, using cache:", error);
      }
    }

    return { members: members as FamilyMember[] };
  },

  // Invite family member (optimistic)
  invite: async (data: { email: string; name?: string; relationship: string }) => {
    const userId = await familyService.getCurrentUserId();
    const tempId = uuidv4();

    const newMember: LocalFamilyMember = {
      id: tempId,
      userId: userId || "",
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

    // Queue for sync
    await syncService.queueOperation({
      operation: "create",
      entity: "family",
      entityId: tempId,
      data: data as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
