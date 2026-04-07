import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Memory, Comment, Reaction } from "@/types/types";
import { socialService } from "@/services/social.service";

export const useTimelineMemories = (sort: string = "date", initialData?: Memory[]) => {
  return useInfiniteQuery({
    queryKey: ["memories", "timeline", sort],
    queryFn: ({ pageParam }) =>
      socialService.getTimeline({ cursor: pageParam as string | undefined, sort }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage as { nextCursor?: string }).nextCursor || undefined,
    initialData: initialData
      ? {
          pages: [{ memories: initialData, nextCursor: undefined }],
          pageParams: [undefined],
        }
      : undefined,
  });
};

export const useComments = (memoryId: string) => {
  return useQuery<{ comments: Comment[] }>({
    queryKey: ["comments", memoryId],
    queryFn: () => socialService.getComments(memoryId),
    enabled: !!memoryId,
    staleTime: 1000 * 60, // 1 minute
  });
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
  return useQuery<{ reactions: Reaction[] }>({
    queryKey: ["reactions", memoryId],
    queryFn: () => socialService.getReactions(memoryId),
    enabled: !!memoryId,
    staleTime: 1000 * 60, // 1 minute
  });
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
    mutationFn: ({ commentId }: { memoryId: string; commentId: string }) =>
      socialService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.memoryId],
      });
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
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => socialService.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
};

export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => socialService.getFollowers(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => socialService.getFollowing(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => socialService.searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });
};

export const useOnThisDay = () => {
  return useQuery({
    queryKey: ["memories", "on-this-day"],
    queryFn: () => socialService.getOnThisDay(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
