import { apiService } from "./api.service";

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export const tagService = {
  getAll: () => {
    return apiService.get<{ tags: Tag[] }>("/api/tags");
  },
};
