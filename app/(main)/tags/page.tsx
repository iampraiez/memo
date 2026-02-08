"use client";
import React, { useState } from "react";
import { Tag as TagIcon, TrendUp, Calendar, MagnifyingGlass, ArrowsClockwise } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import MemoryCard from "@/components/MemoryCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Memory } from "@/types/types";
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
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {!selectedTag ? (
        <React.Fragment>
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">Tags & Categories</h1>
            <p className="text-neutral-600 mt-1">Explore your memories by topics and themes</p>
          </div>

          <div className="max-w-md relative">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <MagnifyingGlass className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">{tags.length}</h3>
              <p className="text-neutral-600">Total Tags</p>
            </Card>
            <Card className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">{tags[0]?.name || "N/A"}</h3>
              <p className="text-neutral-600">Most Used</p>
            </Card>
             <Card className="text-center space-y-2">
               <h3 className="text-2xl font-bold text-neutral-900">{allMemories.length}</h3>
               <p className="text-neutral-600">Tagged Memories</p>
             </Card>
          </div>

          {filteredTags.length > 0 ? (
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Tag Cloud</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.name)}
                    className="text-lg font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState 
              icon={<TagIcon className="w-12 h-12 text-secondary-400" weight="duotone" />}
              title="No Categories Yet"
              description="Tags will appear here once you start categorizing your memories. Use them to organize your story by themes, people, or places."
            />
          )}
        </React.Fragment>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTag(null)}>← Back to Tags</Button>
          <h1 className="text-3xl font-display font-bold text-neutral-900">{selectedTag}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
