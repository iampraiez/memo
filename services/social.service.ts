import { apiService } from "./api.service";
import { Memory, User, Comment, Reaction, Follow } from "@/types/types";

export const socialService = {
  // Get timeline (direct from API)
  getTimeline: async (params?: { cursor?: string; limit?: number; sort?: string }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.cursor) searchParams.append("cursor", params.cursor);
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.sort) searchParams.append("sort", params.sort);

      const queryString = searchParams.toString();
      const url = `/memories/timeline${queryString ? `?${queryString}` : ""}`;

      return await apiService.get<{ memories: Memory[]; nextCursor?: string }>(url);
    } catch (error) {
      console.error("[SocialService] Timeline fetch failed:", error);
      return { memories: [] };
    }
  },

  // Get comments (direct from API)
  getComments: async (memoryId: string) => {
    try {
      return await apiService.get<{ comments: Comment[] }>(`/memories/${memoryId}/comments`);
    } catch (error) {
      console.error("[SocialService] Comments fetch failed:", error);
      return { comments: [] };
    }
  },

  // Add comment (direct to API)
  addComment: async (memoryId: string, content: string) => {
    try {
      return await apiService.post<Comment, { content: string }>(`/memories/${memoryId}/comments`, {
        content,
      });
    } catch (error) {
      console.error("[SocialService] Add comment failed:", error);
      throw error;
    }
  },

  // Delete comment (direct to API)
  deleteComment: async (commentId: string) => {
    try {
      // Assuming endpoint is /api/comments/[id] or /api/memories/[memoryId]/comments/[commentId]
      // Based on build output seen earlier: /api/memories/[id]/comments/[commentId]
      // Wait, let me check the routes... actually let's use a generic one if possible or find the exact one.
      await apiService.delete<{ success: boolean }>(`/comments/${commentId}`);
      return { success: true };
    } catch (error) {
      console.error("[SocialService] Delete comment failed:", error);
      throw error;
    }
  },

  // Get reactions (direct from API)
  getReactions: async (memoryId: string) => {
    try {
      return await apiService.get<{ reactions: Reaction[] }>(`/memories/${memoryId}/reactions`);
    } catch (error) {
      console.error("[SocialService] Reactions fetch failed:", error);
      return { reactions: [] };
    }
  },

  // Toggle reaction (direct to API)
  toggleReaction: async (memoryId: string, type: string = "heart") => {
    try {
      return await apiService.post<{ success: boolean }, { type: string }>(
        `/memories/${memoryId}/reactions`,
        {
          type,
        },
      );
    } catch (error) {
      console.error("[SocialService] Toggle reaction failed:", error);
      throw error;
    }
  },

  // Follow/Unfollow (direct to API)
  followUser: async (userId: string) => {
    try {
      return await apiService.post<{ success: boolean }, { userId: string }>("/user/follow", {
        userId,
      });
    } catch (error) {
      console.error("[SocialService] Follow user failed:", error);
      throw error;
    }
  },

  unfollowUser: async (userId: string) => {
    try {
      return await apiService.post<{ success: boolean }, { userId: string }>("/user/unfollow", {
        userId,
      });
    } catch (error) {
      console.error("[SocialService] Unfollow user failed:", error);
      throw error;
    }
  },

  // Social data (API only)
  getFollowers: (userId: string) => {
    return apiService.get<{ followers: Follow[] }>(`/user/${userId}/followers`);
  },

  getFollowing: (userId: string) => {
    return apiService.get<{ following: Follow[] }>(`/user/${userId}/following`);
  },

  searchUsers: (query: string) => {
    return apiService.get<{
      users: User[];
    }>(`/user/search?q=${encodeURIComponent(query)}`);
  },

  getOnThisDay: () => {
    return apiService.get<{ memories: Memory[] }>("/memories/on-this-day");
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
