import { useQuery } from "@tanstack/react-query";

interface Tag {
  id: string;
  name: string;
  count: number;
  color: string;
}

export const useTags = () => {
  return useQuery<{ tags: Tag[] }>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
