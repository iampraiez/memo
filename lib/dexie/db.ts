import Dexie, { type EntityTable } from 'dexie';
import type { Memory, Comment, Reaction } from '@/types/types';

export interface LocalMemory extends Omit<Memory, 'mood'> {
  mood?: string | null;
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  isOnboarded: boolean;
  createdAt: string;
  preferences?: any;
  followersCount?: number;
  followingCount?: number;
  memoriesCount?: number;
  isFollowing?: boolean;
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalComment extends Comment {
  id: string; 
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalReaction extends Reaction {
  id: string; 
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalNotification {
  id: string;
  userId: string;
  type: 'comment' | 'reaction' | 'follow' | 'family_invite' | 'memory_share';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalFamilyMember {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  avatar?: string;
  relationship: string;
  status: 'pending' | 'accepted';
  role: 'member' | 'admin';
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalStory {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  memoryIds: string[];
  createdAt: string;
  updatedAt: string;
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface LocalTag {
  id: string;
  name: string;
  userId: string;
  _syncStatus?: 'synced' | 'pending' | 'error';
  _lastSync?: number;
}

export interface SyncQueue {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  entity: 'memory' | 'comment' | 'reaction' | 'notification' | 'family' | 'story' | 'tag' | 'user';
  entityId: string;
  data: any;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

// Dexie Database
class MemoDB extends Dexie {
  memories!: EntityTable<LocalMemory, 'id'>;
  users!: EntityTable<LocalUser, 'id'>;
  comments!: EntityTable<LocalComment, 'id'>;
  reactions!: EntityTable<LocalReaction, 'id'>;
  notifications!: EntityTable<LocalNotification, 'id'>;
  familyMembers!: EntityTable<LocalFamilyMember, 'id'>;
  stories!: EntityTable<LocalStory, 'id'>;
  tags!: EntityTable<LocalTag, 'id'>;
  syncQueue!: EntityTable<SyncQueue, 'id'>;

  constructor() {
    super('MemoDatabase');
    
    this.version(1).stores({
      memories: 'id, userId, createdAt, _syncStatus, _lastSync',
      users: 'id, email, username, _syncStatus, _lastSync',
      comments: 'id, memoryId, userId, createdAt, _syncStatus, _lastSync',
      reactions: 'id, memoryId, userId, type, _syncStatus, _lastSync',
      notifications: 'id, userId, type, read, createdAt, _syncStatus, _lastSync',
      familyMembers: 'id, userId, email, status, _syncStatus, _lastSync',
      stories: 'id, userId, createdAt, _syncStatus, _lastSync',
      tags: 'id, userId, name, _syncStatus, _lastSync',
      syncQueue: '++id, entity, entityId, createdAt, retryCount',
    });
  }
}

export const db = new MemoDB();

// Utility functions
export async function clearAllData() {
  await db.memories.clear();
  await db.users.clear();
  await db.comments.clear();
  await db.reactions.clear();
  await db.notifications.clear();
  await db.familyMembers.clear();
  await db.stories.clear();
  await db.tags.clear();
  await db.syncQueue.clear();
}

export async function getStorageStats() {
  const stats = {
    memories: await db.memories.count(),
    users: await db.users.count(),
    comments: await db.comments.count(),
    reactions: await db.reactions.count(),
    notifications: await db.notifications.count(),
    familyMembers: await db.familyMembers.count(),
    stories: await db.stories.count(),
    tags: await db.tags.count(),
    syncQueue: await db.syncQueue.count(),
  };

  return stats;
}
