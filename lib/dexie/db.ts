import Dexie, { type EntityTable } from "dexie";

// --- Shared Types ---

export interface Memory {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  location?: string | null;
  mood?: string | null;
  tags?: string[];
  images?: string[];
  isPublic: boolean;
  isAiGenerated?: boolean | null;
  syncStatus?: "synced" | "pending" | "offline" | "error" | null;
  lastSync?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalComment {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  createdAt: string;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalReaction {
  id: string;
  memoryId: string;
  userId: string;
  type: string;
  timestamp?: number;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  isOnboarded: boolean;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  memoriesCount?: number;
  isFollowing?: boolean;
  preferences?: {
    theme: "light" | "dark" | "system";
    aiEnabled: boolean;
    autoBackup: boolean;
    privacyMode: "private" | "selective" | "family";
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalFamilyMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  relationship: string;
  status: "pending" | "accepted";
  role: "member" | "admin";
  avatar?: string;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalStory {
  id: string;
  userId: string;
  title: string;
  content: string;
  dateRange: { start: string; end: string };
  tone: "reflective" | "celebratory" | "nostalgic";
  length: "short" | "medium" | "long";
  status: "generating" | "ready" | "error";
  createdAt: string;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  usageCount: number;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface LocalNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  _syncStatus?: "synced" | "pending" | "offline";
  _lastSync?: number;
}

export interface SyncQueue {
  id?: number;
  operation: "create" | "update" | "delete";
  entity: "memory" | "comment" | "reaction" | "notification" | "family" | "story" | "tag" | "user";
  entityId: string;
  data: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

export interface OfflineChange {
  id?: number;
  type: "add" | "update" | "delete";
  collection: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// --- Database Configuration ---

class MemoDatabase extends Dexie {
  memories!: EntityTable<Memory, "id">;
  users!: EntityTable<LocalUser, "id">;
  comments!: EntityTable<LocalComment, "id">;
  reactions!: EntityTable<LocalReaction, "id">;
  familyMembers!: EntityTable<LocalFamilyMember, "id">;
  stories!: EntityTable<LocalStory, "id">;
  tags!: EntityTable<LocalTag, "id">;
  notifications!: EntityTable<LocalNotification, "id">;

  syncQueue!: EntityTable<SyncQueue, "id">;
  offline_changes!: EntityTable<OfflineChange, "id">;

  constructor() {
    super("MemoDatabaseV2");
    this.version(2).stores({
      memories: "id, userId, createdAt, syncStatus, mood, *tags",
      users: "id, email, username, _syncStatus",
      comments: "id, memoryId, userId, createdAt, _syncStatus",
      reactions: "id, memoryId, userId, type, [memoryId+userId+type], _syncStatus",
      familyMembers: "id, userId, email, status, _syncStatus",
      stories: "id, userId, createdAt, status, _syncStatus",
      tags: "id, userId, name, usageCount, _syncStatus",
      notifications: "id, userId, read, createdAt, _syncStatus",

      syncQueue: "++id, entity, entityId, createdAt, retryCount",
      offline_changes: "++id, type, collection, timestamp",
    });
  }
}

export const db = new MemoDatabase();

// --- Utility Functions ---

export async function clearAllLocalData() {
  await Promise.all([
    db.memories.clear(),
    db.users.clear(),
    db.comments.clear(),
    db.reactions.clear(),
    db.familyMembers.clear(),
    db.stories.clear(),
    db.tags.clear(),
    db.notifications.clear(),
    db.syncQueue.clear(),
    db.offline_changes.clear(),
  ]);
}
