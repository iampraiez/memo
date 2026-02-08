import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storyService, StorySettings } from "@/services/story.service";

export interface Story {
  id: string;
  title: string;
  content: string;
  tone: string;
  length: string;
  dateRange: { start: string; end: string };
  status: string;
  createdAt: string;
}

export const useStories = () => {
  return useQuery<{ stories: Story[] }>({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories");
      if (!response.ok) throw new Error("Failed to fetch stories");
      return response.json();
    },
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StorySettings) => storyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};
