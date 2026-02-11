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
    const url = `/memories/timeline${queryString ? `?${queryString}` : ""}`;
    
    return apiService.get<{ memories: Memory[], nextCursor?: string }>(url);
  },

  getComments: (memoryId: string) => {
    return apiService.get<{ comments: Comment[] }>(
      `/memories/${memoryId}/comments`,
    );
  },

  addComment: (memoryId: string, content: string) => {
    return apiService.post<Comment>(`/memories/${memoryId}/comments`, {
      content,
    });
  },

  deleteComment: (commentId: string) => {
    return apiService.delete<{ success: boolean }>(`/comments/${commentId}`);
  },

  getReactions: (memoryId: string) => {
    return apiService.get<{ reactions: Reaction[] }>(
      `/memories/${memoryId}/reactions`,
    );
  },

  toggleReaction: (memoryId: string, type: string = "heart") => {
    return apiService.post<{ success: boolean }>(
      `/memories/${memoryId}/reactions`,
      { type },
    );
  },

  followUser: (userId: string) => {
    return apiService.post<{ success: boolean }>(`/user/follow`, { userId });
  },

  unfollowUser: (userId: string) => {
    return apiService.post<{ success: boolean }>(`/user/unfollow`, { userId });
  },

  getFollowers: (userId: string) => {
    return apiService.get<{ followers: any[] }>(`/user/followers/${userId}`);
  },

  getFollowing: (userId: string) => {
    return apiService.get<{ following: any[] }>(`/user/following/${userId}`);
  },
  
  searchUsers: (query: string) => {
    return apiService.get<{
      users: {
        id: string;
        email: string;
        name: string | null;
        password: string | null;
        image: string | null;
        bio: string | null;
        username: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: Date | null;
      }[];
    }>(`/user/search?q=${encodeURIComponent(query)}`);
  },
};
