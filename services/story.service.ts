import { apiService } from "./api.service";
import { db, type LocalStory } from "@/lib/dexie/db";
import { syncService } from "./sync.service";
import { v4 as uuidv4 } from "uuid";

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
  getAll: async () => {
    const userId = await storyService.getCurrentUserId();

    // Read from Dexie
    let stories = await db.stories
      .where('userId')
      .equals(userId || '')
      .reverse()
      .sortBy('createdAt');

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ stories: LocalStory[] }>("/stories");

        // Update cache
        for (const story of response.stories) {
          await db.stories.put({
            ...story,
            _syncStatus: 'synced',
            _lastSync: Date.now(),
          });
        }

        // Re-read
        stories = await db.stories
          .where('userId')
          .equals(userId || '')
          .reverse()
          .sortBy('createdAt');

        return response;
      } catch (error) {
        console.error('[StoryService] Sync failed, using cache:', error);
      }
    }

    return { stories };
  },

  create: async (data: StorySettings) => {
    const userId = await storyService.getCurrentUserId();
    const tempId = uuidv4();

    const newStory: LocalStory = {
      id: tempId,
      userId: userId || '',
      title: data.title,
      description: `${data.tone} story from ${data.dateRange.start} to ${data.dateRange.end}`,
      memoryIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _syncStatus: 'pending',
      _lastSync: Date.now(),
    };

    await db.stories.add(newStory);

    // Queue for sync
    await syncService.queueOperation({
      operation: 'create',
      entity: 'story',
      entityId: tempId,
      data: data as unknown as Record<string, unknown>,
    });

    return { story: { content: newStory.description } };
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentUserId');
    }
    return null;
  },
};
