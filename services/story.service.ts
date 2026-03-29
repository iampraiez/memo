import { v4 as uuidv4 } from "uuid";
import { apiService } from "./api.service";
import { db, type LocalStory } from "@/lib/dexie/db";
import { syncService } from "./sync.service";

export interface StorySettings {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  tone: "reflective" | "celebratory" | "nostalgic";
  length: "short" | "medium" | "long";
  includeimages: boolean;
}

export const storyService = {
  // Get all stories (offline-first)
  getAll: async (userId: string) => {
    if (!userId) return { stories: [] };

    // Read from Dexie
    let stories = await db.stories.where("userId").equals(userId).reverse().sortBy("createdAt");

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ stories: LocalStory[] }>("/stories");

        if (response.stories && response.stories.length > 0) {
          await db.stories.bulkPut(
            response.stories.map((story) => ({
              ...story,
              _syncStatus: "synced",
              _lastSync: Date.now(),
            })),
          );

          // Re-fetch from Dexie to get the latest synced data
          stories = await db.stories.where("userId").equals(userId).reverse().sortBy("createdAt");
        }
      } catch (error) {
        console.error("[StoryService] Sync failed, using cache:", error);
      }
    }

    return { stories };
  },

  create: async (userId: string, data: StorySettings) => {
    if (!userId) throw new Error("User ID is required");

    const tempId = uuidv4();

    const newStory: LocalStory = {
      id: tempId,
      userId: userId,
      title: data.title,
      content: "Generating your story...", // Placeholder
      dateRange: data.dateRange,
      tone: data.tone,
      length: data.length,
      status: "generating",
      createdAt: new Date().toISOString(),
      _syncStatus: "pending",
      _lastSync: Date.now(),
    };

    await db.stories.add(newStory);

    try {
      const response = await apiService.post<{ story: LocalStory }, StorySettings>(
        "/stories",
        data,
      );

      // Update the local story with the real content and status
      await db.stories.update(tempId, {
        ...response.story,
        _syncStatus: "synced",
        _lastSync: Date.now(),
      });

      return response;
    } catch (error) {
      console.error("[StoryService] API Creation failed:", error);
      // Update local story to failed status
      await db.stories.update(tempId, {
        status: "failed",
        _syncStatus: "pending",
      });
      throw error;
    }
  },
};
