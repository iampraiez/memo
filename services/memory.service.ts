import { apiService } from "./api.service";
import { Memory } from "@/types/types";

export interface CreateMemoryData {
  title: string;
  content: string;
  date: string;
  mood?: string | null;
  tags?: string[];
  location?: string | null;
  images?: string[];
  isPublic?: boolean;
}

export interface UpdateMemoryData extends Partial<CreateMemoryData> {}

export const memoryService = {
  getAll: (isPublic?: boolean, limit = 100, offset = 0) => {
    const params = new URLSearchParams();
    if (isPublic !== undefined) params.append("isPublic", String(isPublic));
    params.append("limit", String(limit));
    params.append("offset", String(offset));
    return apiService.get<{ memories: Memory[] }>(
      `/memories?${params.toString()}`,
    );
  },

  getById: (id: string) => {
    return apiService.get<{ memory: Memory }>(`/memories/${id}`);
  },

  create: (data: CreateMemoryData) => {
    return apiService.post<{ memory: Memory }>("/memories", data);
  },

  update: (id: string, data: UpdateMemoryData) => {
    return apiService.patch<{ memory: Memory }>(`/memories/${id}`, data);
  },

  delete: (id: string) => {
    return apiService.delete<{ success: boolean }>(`/memories/${id}`);
  },

  search: (query: string, scope: 'mine' | 'circle' = 'mine') => {
    return apiService.get<{ memories: Memory[] }>(
      `/memories/search?q=${encodeURIComponent(query)}&scope=${scope}`,
    );
  },
};
