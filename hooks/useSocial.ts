import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { Memory } from "@/types/types";
import { socialService, Comment, Reaction } from "@/services/social.service";

export const useTimelineMemories = (sort: string = "date", initialData?: Memory[]) => {
  // We can use useLiveQuery to get all "other" memories if we want real-time timeline,
  // but for infinite scroll, React Query is still useful for cursor management.
  // The socialService.getTimeline now reads from Dexie.
  
  return useInfiniteQuery({
    queryKey: ["memories", "timeline", sort],
    queryFn: ({ pageParam }) => socialService.getTimeline({ cursor: pageParam as string | undefined, sort }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage as any).nextCursor || undefined,
    initialData: initialData 
      ? { 
          pages: [{ memories: initialData, nextCursor: undefined }], 
          pageParams: [undefined] 
        } 
      : undefined,
  });
};

export const useComments = (memoryId: string) => {
  const comments = useLiveQuery(() => 
    db.comments.where('memoryId').equals(memoryId).sortBy('createdAt'),
    [memoryId]
  );

  const query = useQuery<{ comments: Comment[] }>({
    queryKey: ["comments", memoryId],
    queryFn: () => socialService.getComments(memoryId),
    enabled: !!memoryId,
  });

  return {
    ...query,
    data: comments ? { comments: comments as Comment[] } : query.data,
  };
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, content }: { memoryId: string; content: string }) => 
      socialService.addComment(memoryId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};

export const useReactions = (memoryId: string) => {
  const reactions = useLiveQuery(() => 
    db.reactions.where('memoryId').equals(memoryId).toArray(),
    [memoryId]
  );

  const query = useQuery<{ reactions: Reaction[] }>({
    queryKey: ["reactions", memoryId],
    queryFn: () => socialService.getReactions(memoryId),
    enabled: !!memoryId,
  });

  return {
    ...query,
    data: reactions ? { reactions: reactions as Reaction[] } : query.data,
  };
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, type = "heart" }: { memoryId: string; type?: string }) => 
      socialService.toggleReaction(memoryId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reactions", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, commentId }: { memoryId: string; commentId: string }) => 
      socialService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};

export const useFollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (userId: string) => socialService.followUser(userId),
      onSuccess: (_, userId) => {
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      },
    });
};

export const useUnfollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (userId: string) => socialService.unfollowUser(userId),
      onSuccess: (_, userId) => {
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      },
    });
};

export const useFollowers = (userId: string) => {
    return useQuery({
        queryKey: ["followers", userId],
        queryFn: () => socialService.getFollowers(userId),
        enabled: !!userId,
    });
};

export const useFollowing = (userId: string) => {
    return useQuery({
        queryKey: ["following", userId],
        queryFn: () => socialService.getFollowing(userId),
        enabled: !!userId,
    });
};

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: () => socialService.searchUsers(query),
        enabled: query.length >= 2,
    });
};
