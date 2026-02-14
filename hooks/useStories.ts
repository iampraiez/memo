import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type LocalStory } from "@/lib/dexie/db";
import { storyService, StorySettings } from "@/services/story.service";

export const useStories = () => {
  const stories = useLiveQuery(async () => {
    const userId = await storyService.getCurrentUserId();
    if (!userId) return [];
    return await db.stories.where('userId').equals(userId).reverse().sortBy('createdAt');
  });

  const query = useQuery<{ stories: LocalStory[] }>({
    queryKey: ["stories"],
    queryFn: async () => {
      const data = await storyService.getAll();
      return data as { stories: LocalStory[] };
    },
  });

  return {
    ...query,
    data: stories ? { stories: stories } : query.data,
  };
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
