import { apiService } from "./api.service";
import { db, type LocalTag } from "@/lib/dexie/db";
import { syncService } from "./sync.service";

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export const tagService = {
  // Get all tags (offline-first)
  getAll: async () => {
    const userId = await tagService.getCurrentUserId();

    // Read from Dexie
    let tags = await db.tags
      .where("userId")
      .equals(userId || "")
      .toArray();

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ tags: Tag[] }>("/tags");

        // Update cache
        for (const tag of response.tags) {
          await db.tags.put({
            ...tag,
            userId: userId || "",
            color: "bg-neutral-200 text-neutral-800", // Default color
            usageCount: tag.count,
            _syncStatus: "synced",
            _lastSync: Date.now(),
          } as LocalTag);
        }

        return response;
      } catch (error) {
        console.error("[TagService] Sync failed, using cache:", error);
      }
    }

    return { tags: tags as unknown as Tag[] };
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
