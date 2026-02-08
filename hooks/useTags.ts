import { useQuery } from "@tanstack/react-query";
import { tagService, Tag } from "@/services/tag.service";

export const useTags = () => {
  return useQuery<{ tags: Tag[] }>({
    queryKey: ["tags"],
    queryFn: () => tagService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
