import { apiService } from "./api.service";
import { AxiosError } from "axios";

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
    try {
      return await apiService.get<UserSettings>("/user/settings");
    } catch (error) {
      console.error("[UserService] Fetch settings failed:", error);
      return null as unknown as UserSettings;
    }
  },

  // Update settings (direct)
  updateSettings: async (data: Partial<UserSettings> & { image?: string; avatar?: string }) => {
    // Normalize image field (handle both 'image' and 'avatar' keys)
    const normalizedData = { ...data };
    if (data.avatar && !data.image) {
      normalizedData.image = data.avatar;
    }

    try {
      return await apiService.patch<UserSettings, Partial<UserSettings> & { image?: string }>(
        "/user/settings",
        normalizedData,
      );
    } catch (error) {
      console.error("[UserService] Update settings failed:", error);
      throw error;
    }
  },

  getProfile: async (userId: string) => {
    try {
      return await apiService.get<
        UserSettings & {
          followersCount: number;
          followingCount: number;
          memoriesCount: number;
          isFollowing: boolean;
        }
      >(`/user/profile/${userId}`);
    } catch (error) {
      if (error instanceof AxiosError && error.status === 404) {
        throw error;
      }
      console.error("[UserService] Get profile failed:", error);
      throw error;
    }
  },

  // Helper
  getCurrentUserId: async (): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentUserId");
    }
    return null;
  },
};
