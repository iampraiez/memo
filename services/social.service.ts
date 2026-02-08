import { apiService } from "./api.service";
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

export const socialService = {
  getTimeline: () => {
    return apiService.get<{ memories: Memory[] }>("/api/memories/timeline");
  },

  getComments: (memoryId: string) => {
    return apiService.get<{ comments: Comment[] }>(`/api/memories/${memoryId}/comments`);
  },

  addComment: (memoryId: string, content: string) => {
    return apiService.post<Comment>(`/api/memories/${memoryId}/comments`, { content });
  },

  deleteComment: (commentId: string) => {
    return apiService.delete<{ success: boolean }>(`/api/comments/${commentId}`);
  },

  getReactions: (memoryId: string) => {
    return apiService.get<{ reactions: Reaction[] }>(`/api/memories/${memoryId}/reactions`);
  },

  toggleReaction: (memoryId: string, type: string = "heart") => {
    return apiService.post<{ success: boolean }>(`/api/memories/${memoryId}/reactions`, { type });
  },

  followUser: (userId: string) => {
    return apiService.post<{ success: boolean }>(`/api/user/follow`, { userId });
  },

  unfollowUser: (userId: string) => {
    return apiService.post<{ success: boolean }>(`/api/user/unfollow`, { userId });
  },

  getFollowers: (userId: string) => {
    return apiService.get<{ followers: any[] }>(`/api/user/followers/${userId}`);
  },

  getFollowing: (userId: string) => {
    return apiService.get<{ following: any[] }>(`/api/user/following/${userId}`);
  },
};
