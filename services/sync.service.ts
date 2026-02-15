import { db, type SyncQueue } from "@/lib/dexie/db";
import { apiService } from "./api.service";

class SyncService {
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private syncInProgress: boolean = false;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());

      // Process queue on startup if online
      if (this.isOnline) {
        // slight delay to let DB initialize
        setTimeout(() => this.processSyncQueue(), 1000);
      }
    }
  }

  // Online/Offline status
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  subscribe(callback: (online: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline));
  }

  private handleOnline() {
    console.log("[Sync] Connection restored");
    this.isOnline = true;
    this.notifyListeners();
    this.processSyncQueue();
  }

  private handleOffline() {
    console.log("[Sync] Connection lost");
    this.isOnline = false;
    this.notifyListeners();
  }

  // Queue management
  async queueOperation(
    operation: Omit<SyncQueue, "id" | "createdAt" | "retryCount" | "lastError">,
  ) {
    await db.syncQueue.add({
      ...operation,
      createdAt: Date.now(),
      retryCount: 0,
    });
    console.log("[Sync] Queued operation:", operation.entity, operation.operation);

    // Try to sync immediately if online

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async getPendingSyncCount(): Promise<number> {
    return await db.syncQueue.count();
  }

  async clearSyncQueue() {
    await db.syncQueue.clear();
  }

  // Process sync queue
  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline) {
      console.log(
        "[Sync] Skipping processSyncQueue. In progress:",
        this.syncInProgress,
        "Online:",
        this.isOnline,
      );
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingOperations = await db.syncQueue.orderBy("createdAt").limit(10).toArray();

      for (const operation of pendingOperations) {
        try {
          await this.executeSyncOperation(operation);
          // Remove from queue on success
          await db.syncQueue.delete(operation.id!);
        } catch (error) {
          console.error("[Sync] Execute operation failed:", error);
          console.error("[Sync] Operation Failed Details:", operation);

          // Update retry count
          await db.syncQueue.update(operation.id!, {
            retryCount: operation.retryCount + 1,
            lastError: error instanceof Error ? error.message : "Unknown error",
          });

          // Remove if too many retries
          if (operation.retryCount >= 3) {
            console.error("[Sync] Max retries reached, removing from queue:", operation);
            await db.syncQueue.delete(operation.id!);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    // Check if there are more operations
    const remaining = await db.syncQueue.count();
    if (remaining > 0 && this.isOnline) {
      // Continue processing after a short delay
      setTimeout(() => this.processSyncQueue(), 1000);
    }
  }

  private async executeSyncOperation(operation: SyncQueue) {
    const { entity, operation: op, entityId, data } = operation;

    switch (entity) {
      case "memory":
        return this.syncMemory(op, entityId, data as unknown as Record<string, unknown>);
      case "comment":
        return this.syncComment(
          op,
          entityId,
          data as unknown as { memoryId: string; content: string },
        );
      case "reaction":
        return this.syncReaction(
          op,
          entityId,
          data as unknown as { memoryId: string; type: string },
        );
      case "notification":
        return this.syncNotification(op, entityId, data as unknown as Record<string, unknown>);
      case "family":
        return this.syncFamily(
          op,
          entityId,
          data as unknown as { email: string; name?: string; relationship: string },
        );
      case "story":
        return this.syncStory(
          op,
          entityId,
          data as unknown as { content: string; mediaUrl?: string },
        );
      case "tag":
        return this.syncTag(op, entityId, data as unknown as { name: string });
      case "user":
        return this.syncUser(op, entityId, data as unknown as Record<string, unknown>);
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  // Entity-specific sync methods
  private async syncMemory<T>(op: string, id: string, data: T) {
    switch (op) {
      case "create":
        await apiService.post("/memories", data);
        break;
      case "update":
        await apiService.patch(`/memories/${id}`, data);
        break;
      case "delete":
        await apiService.delete(`/memories/${id}`);
        break;
    }
  }

  private async syncComment(op: string, id: string, data: { memoryId: string; content: string }) {
    switch (op) {
      case "create":
        await apiService.post(`/memories/${data.memoryId}/comments`, { content: data.content });
        break;
      case "delete":
        await apiService.delete(`/comments/${id}`);
        break;
    }
  }

  private async syncReaction(op: string, id: string, data: { memoryId: string; type: string }) {
    switch (op) {
      case "create":
        await apiService.post(`/memories/${data.memoryId}/reactions`, { type: data.type });
        break;
    }
  }

  private async syncNotification<T>(op: string, id: string, data: T) {
    switch (op) {
      case "update":
        await apiService.patch(`/notifications/${id}`, data);
        break;
      case "delete":
        await apiService.delete(`/notifications/${id}`);
        break;
    }
  }

  private async syncFamily<T>(op: string, id: string, data: T) {
    switch (op) {
      case "create":
        await apiService.post("/family", data);
        break;
      case "delete":
        await apiService.delete(`/family/${id}`);
        break;
    }
  }

  private async syncStory<T>(op: string, id: string, data: T) {
    switch (op) {
      case "create":
        await apiService.post("/stories", data);
        break;
      case "update":
        await apiService.patch(`/stories/${id}`, data);
        break;
      case "delete":
        await apiService.delete(`/stories/${id}`);
        break;
    }
  }

  private async syncTag<T>(op: string, id: string, data: T) {
    switch (op) {
      case "create":
        await apiService.post("/tags", data);
        break;
      case "delete":
        await apiService.delete(`/tags/${id}`);
        break;
    }
  }

  private async syncUser<T>(op: string, id: string, data: T) {
    switch (op) {
      case "update":
        console.log("[Sync] Syncing user update:", data);
        await apiService.patch("/user/settings", data);
        break;
    }
  }
}

export const syncService = new SyncService();
