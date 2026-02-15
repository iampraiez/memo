"use client";
import React, { useState } from "react";
import { Tag as TagIcon, MagnifyingGlass } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import MemoryCard from "@/components/MemoryCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useTags } from "@/hooks/useTags";
import { useMemories } from "@/hooks/useMemories";
import { useRouter } from "next/navigation";

export default function TagsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const { data: memoriesData, isLoading: memoriesLoading } = useMemories();

  const tags = tagsData?.tags || [];
  const allMemories = memoriesData?.memories || [];

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tagMemories = selectedTag
    ? allMemories.filter((memory) => {
        const memoryTags = memory.tags as unknown as string[] | null;
        return memoryTags?.includes(selectedTag);
      })
    : [];

  if (tagsLoading || memoriesLoading) {
    return <Loading fullPage text="Organizing your sanctuary..." />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {!selectedTag ? (
        <React.Fragment>
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-900">Tags & Categories</h1>
            <p className="mt-1 text-neutral-600">Explore your memories by topics and themes</p>
          </div>

          <div className="relative max-w-md">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-neutral-400" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-neutral-900">{tags.length}</h3>
              <p className="text-neutral-600">Total Tags</p>
            </Card>
            <Card className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-neutral-900">{tags[0]?.name || "N/A"}</h3>
              <p className="text-neutral-600">Most Used</p>
            </Card>
            <Card className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-neutral-900">{allMemories.length}</h3>
              <p className="text-neutral-600">Tagged Memories</p>
            </Card>
          </div>

          {filteredTags.length > 0 ? (
            <Card className="p-8">
              <h2 className="mb-6 text-xl font-semibold text-neutral-900">Tag Cloud</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.name)}
                    className="text-primary-600 hover:text-primary-700 text-lg font-medium transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={<TagIcon className="text-secondary-400 h-12 w-12" weight="duotone" />}
              title="No Categories Yet"
              description="Tags will appear here once you start categorizing your memories. Use them to organize your story by themes, people, or places."
            />
          )}
        </React.Fragment>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTag(null)}>
            ← Back to Tags
          </Button>
          <h1 className="font-display text-3xl font-bold text-neutral-900">{selectedTag}</h1>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {tagMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => router.push(`/memory/${memory.id}`)}
                onEdit={() => {}}
                onDelete={() => {}}
                onShareMemory={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
