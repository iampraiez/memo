import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { storyService, StorySettings } from "@/services/story.service";

export interface Story {
  id: string;
  userId: string;
  title: string;
  content: string;
  tone: string;
  length: string;
  dateRange: { start: string; end: string };
  status: string;
  createdAt: string;
}

export const useStories = () => {
  const stories = useLiveQuery(async () => {
    const userId = await storyService.getCurrentUserId();
    if (!userId) return [];
    return await db.stories.where('userId').equals(userId).reverse().sortBy('createdAt');
  });

  const query = useQuery<{ stories: Story[] }>({
    queryKey: ["stories"],
    queryFn: () => storyService.getAll() as any,
  });

  return {
    ...query,
    data: stories ? { stories: stories as unknown as Story[] } : query.data,
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
