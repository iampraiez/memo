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
  unlockDate?: string | null;
}

export interface UpdateMemoryData extends Partial<CreateMemoryData> {}

export const memoryService = {
  // Fetch all memories (offline-first)
  getAll: async (userId: string, isPublic?: boolean, limit = 100, offset = 0) => {
    // Read from Dexie first
    let memories = await db.memories.where("userId").equals(userId).reverse().sortBy("createdAt");

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

        // Update Dexie with fresh data (Batch write)
        if (response.memories.length > 0) {
          await db.memories.bulkPut(
            response.memories.map((m) => ({
              ...m,
              syncStatus: "synced" as const,
              lastSync: Date.now(),
            })),
          );
        }

        // Re-read from Dexie
        memories = await db.memories.where("userId").equals(userId).reverse().sortBy("createdAt");
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
  create: async (userId: string, data: CreateMemoryData) => {
    const tempId = uuidv4();

    const newMemory: LocalMemory = {
      id: tempId,
      userId: userId,
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
      data: { ...data, id: tempId, userId } as unknown as Record<string, unknown>,
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
  search: async (userId: string, query: string, scope: "mine" | "circle" = "mine") => {
    // Search in Dexie
    const allMemories = await db.memories.where("userId").equals(userId).toArray();

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
        if (response.memories.length > 0) {
          await db.memories.bulkPut(
            response.memories.map((m) => ({
              ...m,
              syncStatus: "synced" as const,
              lastSync: Date.now(),
            })),
          );
        }

        return response;
      } catch (error) {
        console.error("[MemoryService] Search sync failed, using cached results:", error);
      }
    }

    return { memories: filtered as Memory[] };
  },

  // Calculate memory streak (consecutive days with memories)
  getStreak: async (userId: string) => {
    const memories = await db.memories.where("userId").equals(userId).reverse().sortBy("date");

    if (memories.length === 0) return 0;

    // Get unique dates only (YYYY-MM-DD)
    const uniqueDates = Array.from(new Set(memories.map((m) => m.date.split("T")[0])));
    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // The streak is active if the latest memory is today or yesterday
    const latestDate = uniqueDates[0];
    if (latestDate !== today && latestDate !== yesterday) return 0;

    let streak = 0;
    let expectedDate = new Date(latestDate);

    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr);

      // Check if dates are consecutive
      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++;
        // Set expected date to the day before
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  // Surfacing memories from the same day in previous years
  getOnThisDayMemories: async (userId: string) => {
    const memories = await db.memories.where("userId").equals(userId).toArray();

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    return memories
      .filter((m) => {
        const memDate = new Date(m.date);
        return (
          memDate.getMonth() === currentMonth &&
          memDate.getDate() === currentDay &&
          memDate.getFullYear() < currentYear
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};
