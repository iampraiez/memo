import { apiService } from "./api.service";
import { Story, StorySettings } from "@/types/types";

export const storyService = {
  // Get all stories (direct from API)
  getAll: async (userId: string) => {
    if (!userId) return { stories: [] };

    try {
      return await apiService.get<{ stories: Story[] }>("/stories");
    } catch (error) {
      console.error("[StoryService] Fetch failed:", error);
      return { stories: [] };
    }
  },

  create: async (userId: string, data: StorySettings) => {
    if (!userId) throw new Error("User ID is required");

    try {
      return await apiService.post<{ story: Story }, StorySettings>("/stories", data);
    } catch (error) {
      console.error("[StoryService] API Creation failed:", error);
      throw error;
    }
  },
};
