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
    emailNotifications?: boolean;
    language?: string;
  };
}

export const userService = {
  getSettings: () => {
    return apiService.get<UserSettings>("/user/settings");
  },

  updateSettings: (data: Partial<UserSettings>) => {
    return apiService.patch<UserSettings>("/user/settings", data);
  },
  
  getProfile: (userId: string) => {
    return apiService.get<
      UserSettings & {
        followersCount: number;
        followingCount: number;
        isFollowing: boolean;
      }
    >(`/user/profile/${userId}`);
  },
};
