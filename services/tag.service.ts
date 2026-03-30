import { apiService } from "./api.service";

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export const tagService = {
  // Get all tags (direct from API)
  getAll: async () => {
    try {
      return await apiService.get<{ tags: Tag[] }>("/tags");
    } catch (error) {
      console.error("[TagService] Fetch failed:", error);
      return { tags: [] };
    }
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
