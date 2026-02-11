import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserSettings } from "@/services/user.service";

export const useUserSettings = () => {
  return useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => userService.getSettings(),
    staleTime: 0,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => userService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });
};
