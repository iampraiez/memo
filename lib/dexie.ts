import Dexie, { Table } from "dexie";
import { Memory } from "@/types/types";

export interface OfflineChange {
  id?: number;
  type: "add" | "update" | "delete";
  collection: string;
  data: any;
  timestamp: number;
}

export interface Like {
  id?: string;
  memoryId: string;
  userId: string;
  timestamp: number;
  syncStatus: "synced" | "pending" | "offline";
}

export interface Comment {
  id?: string;
  memoryId: string;
  userId: string;
  content: string;
  timestamp: number;
  syncStatus: "synced" | "pending" | "offline";
}

export interface UserSettings {
  id?: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark" | "system";
  };
  syncStatus: "synced" | "pending" | "offline";
}

export class MemoryLaneDexie extends Dexie {
  memories!: Table<Memory, string>;
  offline_changes!: Table<OfflineChange, number>;
  likes!: Table<Like, string>;
  comments!: Table<Comment, string>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super("MemoryLaneDatabase");
    this.version(1).stores({
      memories:
        "id, title, date, mood, *tags, isAiGenerated, syncStatus, userId, createdAt", 
      offline_changes: "++id, type, collection, timestamp",
      likes: "id, memoryId, userId, timestamp, syncStatus",
      comments: "id, memoryId, userId, timestamp, syncStatus",
      userSettings: "id, userId, syncStatus",
    });
  }
}

export const db = new MemoryLaneDexie();
