import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserSettings } from "@/services/user.service";

export const useUserSettings = () => {
  return useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => userService.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings> & { avatar?: string }) =>
      userService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });
};
