import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { userService, UserSettings } from "@/services/user.service";

export const useUserSettings = () => {
  const settings = useLiveQuery(async () => {
    const userId = await userService.getCurrentUserId();
    if (!userId) return null;
    return await db.users.get(userId);
  });

  const query = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => userService.getSettings(),
    staleTime: 0,
  });

  return {
    ...query,
    data: settings ? (settings as unknown as UserSettings) : query.data,
  };
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
