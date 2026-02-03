import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Memory } from "@/types/types";

interface CreateMemoryData {
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  location?: string;
  images?: string[];
  isPublic?: boolean;
}

interface UpdateMemoryData {
  title?: string;
  content?: string;
  date?: string;
  mood?: string;
  tags?: string[];
  location?: string;
  images?: string[];
  isPublic?: boolean;
}

export const useMemories = (isPublic?: boolean, limit = 100, offset = 0) => {
  return useQuery<{ memories: Memory[] }>({
    queryKey: ["memories", { isPublic, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isPublic !== undefined) params.append("isPublic", String(isPublic));
      params.append("limit", String(limit));
      params.append("offset", String(offset));

      const response = await fetch(`/api/memories?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch memories");
      }
      return response.json();
    },
  });
};

export const useMemory = (id: string) => {
  return useQuery<{ memory: Memory }>({
    queryKey: ["memory", id],
    queryFn: async () => {
      const response = await fetch(`/api/memories/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch memory");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemoryData) => {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create memory");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useUpdateMemory = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMemoryData) => {
      const response = await fetch(`/api/memories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update memory");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory", id] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useDeleteMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/memories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete memory");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
