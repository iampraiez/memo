import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Story {
  id: string;
  title: string;
  content: string;
  tone: string;
  length: string;
  dateRange: { start: string; end: string };
  status: string;
  createdAt: string;
}

export const useStories = () => {
  return useQuery<{ stories: Story[] }>({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories");
      if (!response.ok) throw new Error("Failed to fetch stories");
      return response.json();
    },
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; tone: string; length: string; dateRange: { start: string; end: string } }) => {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create story");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};
