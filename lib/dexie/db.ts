import Dexie, { type EntityTable } from 'dexie';

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
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  timestamp: number;
  syncStatus: "synced" | "pending" | "offline";
}

export interface Like {
  id: string;
  memoryId: string;
  userId: string;
  timestamp: number;
  syncStatus: "synced" | "pending" | "offline";
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
  syncStatus: "synced" | "pending" | "offline";
}

export interface SyncQueue {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  entity: 'memory' | 'comment' | 'reaction' | 'notification' | 'family' | 'story' | 'tag' | 'user';
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
  memories!: EntityTable<Memory, 'id'>;
  users!: EntityTable<LocalUser, 'id'>;
  comments!: EntityTable<Comment, 'id'>;
  likes!: EntityTable<Like, 'id'>;
  syncQueue!: EntityTable<SyncQueue, 'id'>;
  offline_changes!: EntityTable<OfflineChange, 'id'>;

  constructor() {
    super('MemoDatabaseV2');
    this.version(1).stores({
      memories: 'id, userId, createdAt, syncStatus, mood, *tags',
      users: 'id, email, username, syncStatus',
      comments: 'id, memoryId, userId, timestamp, syncStatus',
      likes: 'id, memoryId, userId, timestamp, syncStatus',
      syncQueue: '++id, entity, entityId, createdAt, retryCount',
      offline_changes: '++id, type, collection, timestamp',
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
    db.likes.clear(),
    db.syncQueue.clear(),
    db.offline_changes.clear(),
  ]);
}
