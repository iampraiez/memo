import { apiService } from "./api.service";
import { db, type LocalUser } from "@/lib/dexie/db";
import { syncService } from "./sync.service";

export interface UserSettings {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  username?: string;
  createdAt: string;
  preferences: {
    theme: "light" | "dark" | "system";
    aiEnabled: boolean;
    autoBackup: boolean;
    privacyMode: "private" | "selective" | "family";
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

export const userService = {
  getSettings: async () => {
    const userId = await userService.getCurrentUserId();
    const cachedUser = await db.users.get(userId || '');
    if (syncService.getOnlineStatus()) {
      try {
        const res = await apiService.get<UserSettings>("/user/settings");
        
        await db.users.put({
          ...res,
          isOnboarded: true, 
          _syncStatus: 'synced',
          _lastSync: Date.now(),
        } as unknown as LocalUser);

        return res;
      } catch (error) {
        console.error("[UserService] Fetch settings failed, using cache:", error);
        if (cachedUser) {
          return cachedUser as unknown as UserSettings;
        }
      }
    }

    if (!cachedUser) {
      // Fallback or empty state
      return null as unknown as UserSettings;
    }

    return cachedUser as unknown as UserSettings;
  },

  // Update settings (optimistic)
  updateSettings: async (data: Partial<UserSettings>) => {
    const userId = await userService.getCurrentUserId();
    const existing = await db.users.get(userId || '');

    if (existing) {
      const updated: LocalUser = {
        ...existing,
        ...data, // data is Partial<UserSettings>, spreading it is fine
        _syncStatus: 'pending',
        _lastSync: Date.now(),
      };
      await db.users.put(updated);
    }

    await syncService.queueOperation({
      operation: 'update',
      entity: 'user',
      entityId: userId || 'current',
      data: data as unknown as Record<string, unknown>,
    });

    return data as UserSettings; // Cast to UserSettings is appropriate here
  },
  
  // Profile is usually dynamic, but we can cache viewed profiles
  getProfile: async (userId: string) => {
    // Try cache first
    const cached = await db.users.get(userId);

    if (syncService.getOnlineStatus()) {
      try {
        const res = await apiService.get<
          UserSettings & {
            followersCount: number;
            followingCount: number;
            memoriesCount: number;
            isFollowing: boolean;
          }
        >(`/user/profile/${userId}`);

        await db.users.put({
          ...res,
          isOnboarded: true,
          _syncStatus: 'synced',
          _lastSync: Date.now(),
        } as unknown as LocalUser);

        return res;
      } catch (error) {
        console.error("[UserService] Get profile failed:", error);
      }
    }

    if (cached) {
      return cached
    }

    throw new Error("Profile not available offline");
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentUserId');
    }
    return null;
  },
};
