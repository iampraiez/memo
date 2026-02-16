import { apiService } from "./api.service";
import { db, type LocalComment, type LocalReaction } from "@/lib/dexie/db";
import { syncService } from "./sync.service";
import { Memory, User, Comment, Reaction, Follow } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

export const socialService = {
  // Get timeline (offline-first)
  getTimeline: async (params?: { cursor?: string; limit?: number; sort?: string }) => {
    const userId = await socialService.getCurrentUserId();

    // Read from Dexie first
    let memories = await db.memories
      .where("userId")
      .notEqual(userId || "")
      .reverse()
      .sortBy("createdAt");

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const searchParams = new URLSearchParams();
        if (params?.cursor) searchParams.append("cursor", params.cursor);
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        if (params?.sort) searchParams.append("sort", params.sort);

        const queryString = searchParams.toString();
        const url = `/memories/timeline${queryString ? `?${queryString}` : ""}`;

        const response = await apiService.get<{ memories: Memory[]; nextCursor?: string }>(url);

        // Update cache
        for (const memory of response.memories) {
          await db.memories.put({
            ...memory,
            syncStatus: "synced",
            lastSync: Date.now(),
          });
        }

        return response;
      } catch (error) {
        console.error("[SocialService] Timeline sync failed, using cache:", error);
      }
    }

    return { memories: memories as Memory[] };
  },

  // Get comments (offline-first)
  getComments: async (memoryId: string) => {
    // Read from Dexie
    let comments = await db.comments.where("memoryId").equals(memoryId).sortBy("createdAt");

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ comments: Comment[] }>(
          `/memories/${memoryId}/comments`,
        );

        // Update cache
        for (const comment of response.comments) {
          await db.comments.put({
            ...comment,
            createdAt: comment.createdAt || new Date().toISOString(),
            _syncStatus: "synced",
            _lastSync: Date.now(),
          });
        }

        return response;
      } catch (error) {
        console.error("[SocialService] Comments sync failed, using cache:", error);
      }
    }

    return { comments: comments as unknown as Comment[] };
  },

  // Add comment (optimistic)
  addComment: async (memoryId: string, content: string) => {
    const userId = await socialService.getCurrentUserId();
    const tempId = uuidv4();

    const newComment: LocalComment = {
      id: tempId,
      memoryId,
      userId: userId || "",
      content,
      createdAt: new Date().toISOString(),
      _syncStatus: "pending",
      _lastSync: Date.now(),
    };

    // Immediate add to Dexie
    await db.comments.add(newComment);

    // Queue for sync
    await syncService.queueOperation({
      operation: "create",
      entity: "comment",
      entityId: tempId,
      data: { memoryId, content } as unknown as Record<string, unknown>,
    });

    return newComment as unknown as Comment;
  },

  // Delete comment (optimistic)
  deleteComment: async (commentId: string) => {
    // Immediate delete from Dexie
    await db.comments.delete(commentId);

    // Queue for sync
    await syncService.queueOperation({
      operation: "delete",
      entity: "comment",
      entityId: commentId,
      data: {} as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Get reactions (offline-first)
  getReactions: async (memoryId: string) => {
    // Read from Dexie
    let reactions = await db.reactions.where("memoryId").equals(memoryId).toArray();

    // Background sync if online
    if (syncService.getOnlineStatus()) {
      try {
        const response = await apiService.get<{ reactions: Reaction[] }>(
          `/memories/${memoryId}/reactions`,
        );

        // Update cache
        for (const reaction of response.reactions) {
          await db.reactions.put({
            ...reaction,
            _syncStatus: "synced",
            _lastSync: Date.now(),
          });
        }

        return response;
      } catch (error) {
        console.error("[SocialService] Reactions sync failed, using cache:", error);
      }
    }

    return { reactions: reactions as unknown as Reaction[] };
  },

  // Toggle reaction (optimistic)
  toggleReaction: async (memoryId: string, type: string = "heart") => {
    const userId = await socialService.getCurrentUserId();

    // Check if reaction exists
    const existing = await db.reactions
      .where("[memoryId+userId+type]")
      .equals([memoryId, userId || "", type])
      .first();

    if (existing) {
      // Delete existing reaction
      await db.reactions.delete(existing.id);

      await syncService.queueOperation({
        operation: "delete",
        entity: "reaction",
        entityId: existing.id,
        data: { memoryId, type } as unknown as Record<string, unknown>,
      });
    } else {
      // Add new reaction
      const tempId = uuidv4();
      const newReaction: LocalReaction = {
        id: tempId,
        memoryId,
        userId: userId || "",
        type,
        _syncStatus: "pending",
        _lastSync: Date.now(),
      } as LocalReaction;

      await db.reactions.add(newReaction);

      await syncService.queueOperation({
        operation: "create",
        entity: "reaction",
        entityId: tempId,
        data: { memoryId, type } as unknown as Record<string, unknown>,
      });
    }

    return { success: true };
  },

  // Follow/Unfollow (queue for sync)
  followUser: async (userId: string) => {
    await syncService.queueOperation({
      operation: "create",
      entity: "user",
      entityId: userId,
      data: { action: "follow", userId } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  unfollowUser: async (userId: string) => {
    await syncService.queueOperation({
      operation: "delete",
      entity: "user",
      entityId: userId,
      data: { action: "unfollow", userId } as unknown as Record<string, unknown>,
    });

    return { success: true };
  },

  // Search users (API only)
  getFollowers: (userId: string) => {
    return apiService.get<{ followers: Follow[] }>(`/api/user/${userId}/followers`);
  },

  getFollowing: (userId: string) => {
    return apiService.get<{ following: Follow[] }>(`/api/user/${userId}/following`);
  },

  searchUsers: (query: string) => {
    return apiService.get<{
      user: User[];
    }>(`/user/search?q=${encodeURIComponent(query)}`);
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
