import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Memory } from "@/types/types";

export interface Comment {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    image?: string;
  };
}

export interface Reaction {
  id: string;
  memoryId: string;
  userId: string;
  type: string;
  user?: {
    name: string;
    image?: string;
  };
}

export const useTimelineMemories = () => {
  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", "timeline"],
    queryFn: async () => {
      const response = await fetch("/api/memories/timeline");
      if (!response.ok) throw new Error("Failed to fetch timeline");
      return response.json();
    },
  });
};

export const useComments = (memoryId: string) => {
  return useQuery<{ comments: Comment[] }>({
    queryKey: ["comments", memoryId],
    queryFn: async () => {
      const response = await fetch(`/api/memories/${memoryId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!memoryId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, content }: { memoryId: string; content: string }) => {
      const response = await fetch(`/api/memories/${memoryId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};

export const useReactions = (memoryId: string) => {
  return useQuery<{ reactions: Reaction[] }>({
    queryKey: ["reactions", memoryId],
    queryFn: async () => {
      const response = await fetch(`/api/memories/${memoryId}/reactions`);
      if (!response.ok) throw new Error("Failed to fetch reactions");
      return response.json();
    },
    enabled: !!memoryId,
  });
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, type = "heart" }: { memoryId: string; type?: string }) => {
      const response = await fetch(`/api/memories/${memoryId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error("Failed to toggle reaction");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reactions", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, commentId }: { memoryId: string; commentId: string }) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });
};
