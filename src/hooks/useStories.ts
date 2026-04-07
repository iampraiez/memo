import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Story, StorySettings } from "@/types/types";
import { storyService } from "@/services/story.service";

export const useStories = (userId: string | undefined) => {
  return useQuery<{ stories: Story[] }>({
    queryKey: ["stories", userId],
    queryFn: async () => {
      if (!userId) return { stories: [] };
      return await storyService.getAll(userId);
    },
    enabled: !!userId,
    structuralSharing: true,
  });
};

export const useCreateStory = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StorySettings) => {
      if (!userId) throw new Error("Unauthorized");
      return storyService.create(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", userId] });
    },
  });
};
