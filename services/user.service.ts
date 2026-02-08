import { apiService } from "./api.service";

export interface UserSettings {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark" | "system";
    emailNotifications?: boolean;
    language?: string;
  };
}

export const userService = {
  getSettings: () => {
    return apiService.get<UserSettings>("/api/user/settings");
  },

  updateSettings: (data: Partial<UserSettings>) => {
    return apiService.patch<UserSettings>("/api/user/settings", data);
  },
};
