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
  getTimeline: (params?: { cursor?: string; limit?: number; sort?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.append("cursor", params.cursor);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sort) searchParams.append("sort", params.sort);
    
    const queryString = searchParams.toString();
    const url = `/api/memories/timeline${queryString ? `?${queryString}` : ""}`;
    
    return apiService.get<{ memories: Memory[], nextCursor?: string }>(url);
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
  
  searchUsers: (query: string) => {
    return apiService.get<{ users: any[] }>(`/api/user/search?q=${encodeURIComponent(query)}`);
  },
};
