import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { tagService, Tag } from "@/services/tag.service";

export const useTags = () => {
  const tags = useLiveQuery(async () => {
    const userId = await tagService.getCurrentUserId();
    if (!userId) return [];
    return await db.tags.where("userId").equals(userId).toArray();
  });

  const query = useQuery<{ tags: Tag[] }>({
    queryKey: ["tags"],
    queryFn: () => tagService.getAll(),
  });

  return {
    ...query,
    data: tags ? { tags: tags as unknown as Tag[] } : query.data,
  };
};
