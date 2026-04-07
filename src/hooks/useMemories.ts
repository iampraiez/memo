import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Memory } from "@/types/types";
import { memoryService, CreateMemoryData, UpdateMemoryData } from "@/services/memory.service";
import { useSession } from "next-auth/react";
import { useDebounce } from "./useDebounce";

export const useMemories = (isPublic?: boolean, limit = 20) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const query = useInfiniteQuery({
    queryKey: ["memories", { userId, isPublic, limit }],
    queryFn: ({ pageParam = 0 }) =>
      memoryService.getAll(userId!, isPublic, limit, pageParam as number),
    enabled: !!userId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.memories.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  return {
    ...query,
    data: query.data?.pages
      ? { memories: query.data.pages.flatMap((page) => page.memories) }
      : undefined,
  };
};

export const useStreak = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["streak", userId],
    queryFn: () => memoryService.getStreak(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useOnThisDay = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ["on-this-day", userId],
    queryFn: async () => {
      const results = await memoryService.getOnThisDayMemories(userId!);
      return results as Memory[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useMemory = (id: string) => {
  return useQuery({
    queryKey: ["memory", id],
    queryFn: () => memoryService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchMemories = (queryText: string, scope: "mine" | "circle" = "mine") => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const debouncedQuery = useDebounce(queryText, 400);

  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", "search", debouncedQuery, scope, userId],
    queryFn: () => memoryService.search(userId!, debouncedQuery, scope),
    enabled: !!userId && debouncedQuery.length >= 2,
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: (data: CreateMemoryData) => memoryService.create(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
};

export const useUpdateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemoryData }) =>
      memoryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["memory", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
};

export const useDeleteMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => memoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    },
  });
};
