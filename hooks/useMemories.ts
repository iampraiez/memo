import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { Memory } from "@/types/types";
import { memoryService, CreateMemoryData, UpdateMemoryData } from "@/services/memory.service";
import { useSession } from "next-auth/react";
import { useDebounce } from "./useDebounce";

export const useMemories = (isPublic?: boolean, limit = 20) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Live query from Dexie for real-time UI (Recent first)
  const memories = useLiveQuery(async () => {
    if (!userId) return [];

    let query = db.memories.where("userId").equals(userId);
    const results = await query.reverse().sortBy("createdAt");

    if (isPublic !== undefined) {
      return results.filter((m) => m.isPublic === isPublic);
    }

    return results;
  }, [userId, isPublic]);

  // Use Infinite Query for paginated fetching
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
    structuralSharing: true,
  });

  return {
    ...query,
    // Explicit isLoading flag for when data isn't yet available (item 5.10)
    isLoading: query.isLoading || (userId && memories === undefined),
    data: memories ? { memories: memories as Memory[] } : query.data?.pages[0],
  };
};

export const useStreak = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["streak", userId],
    queryFn: () => memoryService.getStreak(userId!),
    enabled: !!userId,
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
  });
};

export const useMemory = (id: string) => {
  const memory = useLiveQuery(() => db.memories.get(id), [id]);

  const query = useQuery({
    queryKey: ["memory", id],
    queryFn: () => memoryService.getById(id),
    enabled: !!id,
    structuralSharing: true,
  });

  return {
    ...query,
    data: memory ? { memory: memory as Memory } : query.data,
  };
};

export const useSearchMemories = (queryText: string, scope: "mine" | "circle" = "mine") => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const debouncedQuery = useDebounce(queryText, 400);

  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", "search", debouncedQuery, scope, userId],
    queryFn: () => memoryService.search(userId!, debouncedQuery, scope),
    enabled: !!userId && debouncedQuery.length >= 2,
    structuralSharing: true,
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
