import { apiService } from "./api.service";
import { db, type Memory as LocalMemory } from "@/lib/dexie/db";
import { syncService } from "./sync.service";
import { Memory } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

export interface CreateMemoryData {
  title: string;
  content: string;
  date: string;
  mood?: string | null;
  tags?: string[];
  location?: string | null;
  images?: string[];
  isPublic?: boolean;
}

export interface UpdateMemoryData extends Partial<CreateMemoryData> {}

export const memoryService = {
  // Fetch all memories (offline-first)
  getAll: async (isPublic?: boolean, limit = 100, offset = 0) => {
    const userId = await memoryService.getCurrentUserId();

    // Read from Dexie first
    let memories = await db.memories
      .where("userId")
      .equals(userId || "")
      .reverse()
      .sortBy("createdAt");

    // Background sync with API if online
    if (syncService.getOnlineStatus()) {
      try {
        const params = new URLSearchParams();
        if (isPublic !== undefined) params.append("isPublic", String(isPublic));
        params.append("limit", String(limit));
        params.append("offset", String(offset));

        const response = await apiService.get<{ memories: Memory[] }>(
          `/memories?${params.toString()}`,
        );

        // Update Dexie with fresh data
        for (const memory of response.memories) {
          await db.memories.put({
            ...memory,
            syncStatus: "synced",
            lastSync: Date.now(),
          });
        }

        // Re-read from Dexie
        memories = await db.memories
          .where("userId")
          .equals(userId || "")
          .reverse()
          .sortBy("createdAt");
      } catch (error) {
        console.error("[MemoryService] Sync failed, using cached data:", error);
      }
    }

    return { memories: memories as Memory[] };
  },

  // Get single memory by ID (offline-first)
  getById: async (id: string) => {
    // Try Dexie first
    const cachedMemory = await db.memories.get(id);

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ memory: Memory }>(`/memories/${id}`);

        // Update cache
        await db.memories.put({
          ...response.memory,
          syncStatus: "synced",
          lastSync: Date.now(),
        });

        return response;
      } catch (error) {
        console.error("[MemoryService] Fetch failed, using cached data:", error);
        if (cachedMemory) {
          return { memory: cachedMemory as Memory };
        }
        throw error;
      }
    }

    if (!cachedMemory) {
      throw new Error("Memory not found offline");
    }

    return { memory: cachedMemory as Memory };
  },

  // Create memory (optimistic update)
  create: async (data: CreateMemoryData) => {
    const userId = await memoryService.getCurrentUserId();
    const tempId = uuidv4();

    const newMemory: LocalMemory = {
      id: tempId,
      userId: userId || "",
      title: data.title,
      content: data.content,
      date: data.date,
      mood: data.mood || null,
      tags: data.tags || [],
      location: data.location || null,
      images: data.images || [],
      isPublic: data.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
      lastSync: Date.now(),
    };

    // Immediate write to Dexie
    await db.memories.add(newMemory);

    // Queue for sync
    await syncService.queueOperation({
      operation: "create",
      entity: "memory",
      entityId: tempId,
      data: data as unknown as Record<string, unknown>,
    });

    return { memory: newMemory as Memory };
  },

  // Update memory (optimistic update)
  update: async (id: string, data: UpdateMemoryData) => {
    const existing = await db.memories.get(id);
    if (!existing) {
      throw new Error("Memory not found");
    }

    // Check if anything actually changed to prevent redundant syncs/updates
    const hasChanges = Object.keys(data).some((key) => {
      const k = key as keyof UpdateMemoryData;
      if (Array.isArray(data[k]) && Array.isArray(existing[k as keyof LocalMemory])) {
        return JSON.stringify(data[k]) !== JSON.stringify(existing[k as keyof LocalMemory]);
      }
      return data[k] !== existing[k as keyof LocalMemory];
    });

    if (!hasChanges) {
      console.log("[MemoryService] No changes detected, skipping update");
      return { memory: existing as Memory };
    }

    const updated: LocalMemory = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
      lastSync: Date.now(),
    };

    // Immediate update in Dexie
    await db.memories.put(updated);

    // Queue for sync
    await syncService.queueOperation({
      operation: "update",
      entity: "memory",
      entityId: id,
      data: data as unknown as Record<string, unknown>,
    });

    return { memory: updated as Memory };
  },

  // Delete memory (optimistic delete)
  delete: async (id: string) => {
    // Immediate delete from Dexie
    await db.memories.delete(id);

    // Queue for sync
    await syncService.queueOperation({
      operation: "delete",
      entity: "memory",
      entityId: id,
      data: {},
    });

    return { success: true };
  },

  // Search memories (offline-first)
  search: async (query: string, scope: "mine" | "circle" = "mine") => {
    const userId = await memoryService.getCurrentUserId();

    // Search in Dexie
    const allMemories = await db.memories
      .where("userId")
      .equals(userId || "")
      .toArray();

    const lowerQuery = query.toLowerCase();
    const filtered = allMemories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(lowerQuery) ||
        memory.content.toLowerCase().includes(lowerQuery) ||
        memory.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ memories: Memory[] }>(
          `/memories/search?q=${encodeURIComponent(query)}&scope=${scope}`,
        );

        // Update cache with search results
        for (const memory of response.memories) {
          await db.memories.put({
            ...memory,
            syncStatus: "synced",
            lastSync: Date.now(),
          });
        }

        return response;
      } catch (error) {
        console.error("[MemoryService] Search sync failed, using cached results:", error);
      }
    }

    return { memories: filtered as Memory[] };
  },

  // Helper to get current user ID (from session or cache)
  getCurrentUserId: async (): Promise<string | null> => {
    // This should be replaced with actual session logic
    // For now, we'll store it in localStorage or session
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
