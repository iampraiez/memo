import { apiService } from "./api.service";
import { Memory } from "@/types/types";

export interface CreateMemoryData {
  title: string;
  content: string;
  date: string;
  mood?: string | null;
  tags?: string[];
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  isPublic?: boolean;
  unlockDate?: string | null;
}

export interface UpdateMemoryData extends Partial<CreateMemoryData> {}

export const memoryService = {
  // Fetch all memories (direct from API)
  getAll: async (_userId: string, isPublic?: boolean, limit = 100, offset = 0) => {
    try {
      const params = new URLSearchParams();
      if (isPublic !== undefined) params.append("isPublic", String(isPublic));
      params.append("limit", String(limit));
      params.append("offset", String(offset));

      return await apiService.get<{ memories: Memory[] }>(`/memories?${params.toString()}`);
    } catch (error) {
      console.error("[MemoryService] Fetch all failed:", error);
      return { memories: [] };
    }
  },

  // Get single memory by ID (direct from API)
  getById: async (id: string) => {
    try {
      return await apiService.get<{ memory: Memory }>(`/memories/${id}`);
    } catch (error) {
      console.error("[MemoryService] Fetch by ID failed:", error);
      throw error;
    }
  },

  // Create memory (direct to API)
  create: async (userId: string, data: CreateMemoryData) => {
    try {
      return await apiService.post<{ memory: Memory }, CreateMemoryData & { userId: string }>(
        "/memories",
        {
          ...data,
          userId,
        },
      );
    } catch (error) {
      console.error("[MemoryService] Create failed:", error);
      throw error;
    }
  },

  // Update memory (direct to API)
  update: async (id: string, data: UpdateMemoryData) => {
    try {
      return await apiService.patch<{ memory: Memory }, UpdateMemoryData>(`/memories/${id}`, data);
    } catch (error) {
      console.error("[MemoryService] Update failed:", error);
      throw error;
    }
  },

  // Delete memory (direct to API)
  delete: async (id: string) => {
    try {
      await apiService.delete<{ success: boolean }>(`/memories/${id}`);
      return { success: true };
    } catch (error) {
      console.error("[MemoryService] Delete failed:", error);
      throw error;
    }
  },

  // Search memories (direct from API)
  search: async (_userId: string, query: string, scope: "mine" | "circle" = "mine") => {
    try {
      return await apiService.get<{ memories: Memory[] }>(
        `/memories/search?q=${encodeURIComponent(query)}&scope=${scope}`,
      );
    } catch (error) {
      console.error("[MemoryService] Search failed:", error);
      return { memories: [] };
    }
  },

  // Calculate memory streak (via Analytics API)
  getStreak: async (_p0: string) => {
    try {
      const analytics = await apiService.get<{ longestStreak: number }>("/analytics?timeRange=all");
      return analytics.longestStreak || 0;
    } catch (error) {
      console.error("[MemoryService] Get streak failed:", error);
      return 0;
    }
  },

  // Surfacing memories from the same day in previous years (direct from API)
  getOnThisDayMemories: async (_p0: string) => {
    try {
      const response = await apiService.get<{ memories: Memory[] }>("/memories/on-this-day");
      return response.memories || [];
    } catch (error) {
      console.error("[MemoryService] Get on-this-day failed:", error);
      return [];
    }
  },
};
