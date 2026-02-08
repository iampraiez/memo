import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Memory } from "@/types/types";
import { memoryService, CreateMemoryData, UpdateMemoryData } from "@/services/memory.service";

export const useMemories = (isPublic?: boolean, limit = 100, offset = 0) => {
  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", { isPublic, limit, offset }],
    queryFn: () => memoryService.getAll(isPublic, limit, offset),
  });
};

export const useMemory = (id: string) => {
  return useQuery<{ memory: Memory }>({
    queryKey: ["memory", id],
    queryFn: () => memoryService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemoryData) => memoryService.create(data),
    onSuccess: () => {
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
