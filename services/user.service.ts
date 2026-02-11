import { apiService } from "./api.service";

export interface UserSettings {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
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
    console.log("[UserService] Fetching settings from database...");
    const res = await apiService.get<UserSettings>("/user/settings");
    console.log("[UserService] Fetched settings successfully:", {
      username: res.username,
      name: res.name,
      avatar: !!res.avatar ? "Present" : "Missing",
      theme: res.preferences?.theme
    });
    return res;
  },

  updateSettings: (data: Partial<UserSettings>) => {
    return apiService.patch<UserSettings>("/user/settings", data);
  },
  
  getProfile: (userId: string) => {
    return apiService.get<
      UserSettings & {
        followersCount: number;
        followingCount: number;
        memoriesCount: number;
        isFollowing: boolean;
      }
    >(`/user/profile/${userId}`);
  },
};
