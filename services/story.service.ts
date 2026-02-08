import { apiService } from "./api.service";

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
  create: (data: StorySettings) => {
    return apiService.post<{ story: { content: string } }>("/api/stories", data);
  },
};
