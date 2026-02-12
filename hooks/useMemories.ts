import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { Memory } from "@/types/types";
import { memoryService, CreateMemoryData, UpdateMemoryData } from "@/services/memory.service";

export const useMemories = (isPublic?: boolean, limit = 100, offset = 0) => {
  // Live query from Dexie for real-time UI
  const memories = useLiveQuery(async () => {
    const userId = await memoryService.getCurrentUserId();
    if (!userId) return [];
    
    let query = db.memories.where('userId').equals(userId);
    
    // We can't easily filter by isPublic in Dexie without multi-index, 
    // but we can filter the result for now or add index later.
    const results = await query.reverse().sortBy('createdAt');
    
    if (isPublic !== undefined) {
      return results.filter(m => m.isPublic === isPublic);
    }
    
    return results;
  }, [isPublic, limit, offset]);

  // Use React Query in background to trigger sync/refetch
  const query = useQuery({
    queryKey: ["memories", { isPublic, limit, offset }],
    queryFn: () => memoryService.getAll(isPublic, limit, offset),
    enabled: true, // Always fetch to update Dexie in background
  });

  return {
    ...query,
    data: memories ? { memories: memories as Memory[] } : query.data,
  };
};

export const useMemory = (id: string) => {
  const memory = useLiveQuery(() => db.memories.get(id), [id]);

  const query = useQuery({
    queryKey: ["memory", id],
    queryFn: () => memoryService.getById(id),
    enabled: !!id,
  });

  return {
    ...query,
    data: memory ? { memory: memory as Memory } : query.data,
  };
};

export const useSearchMemories = (query: string, scope: 'mine' | 'circle' = 'mine') => {
  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", "search", query, scope],
    queryFn: () => memoryService.search(query, scope),
    enabled: query.length >= 2,
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemoryData) => memoryService.create(data),
    onSuccess: () => {
      // No need to invalidate for UI updates since useLiveQuery handles it,
      // but still good for background sync state.
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
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
    },
  });
};
