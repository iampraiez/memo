import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type LocalStory } from "@/lib/dexie/db";
import { storyService, StorySettings } from "@/services/story.service";

export const useStories = (userId: string | undefined) => {
  const stories = useLiveQuery(async () => {
    if (!userId) return [];
    return await db.stories.where("userId").equals(userId).reverse().sortBy("createdAt");
  }, [userId]);

  const query = useQuery<{ stories: LocalStory[] }>({
    queryKey: ["stories", userId],
    queryFn: async () => {
      if (!userId) return { stories: [] };
      const data = await storyService.getAll(userId);
      return data as { stories: LocalStory[] };
    },
    enabled: !!userId,
    structuralSharing: true,
  });

  return {
    ...query,
    data: stories ? { stories: stories } : query.data,
  };
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
