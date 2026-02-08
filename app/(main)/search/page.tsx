"use client";
import React, { useState, useEffect } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Clock,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import MemoryCard from "@/components/MemoryCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Memory } from "@/types/types";
import DatePicker from "@/components/ui/DatePicker";
import MultiSelect from "@/components/ui/MultiSelect";
import { useMemories } from "@/hooks/useMemories";
import { useTags } from "@/hooks/useTags";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const router = useRouter();

  const { data: memoriesData, isLoading } = useMemories();
  const { data: tagsData } = useTags();

  const allMemories = memoriesData?.memories || [];
  const availableTags = tagsData?.tags.map((t) => t.name) || [];

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = allMemories.filter((m) => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, allMemories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-900">Search Memories</h1>
        <p className="text-neutral-600 mt-1">Find memories by content, tags, or location</p>
      </div>

      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memories..."
          className="pl-12 py-4"
        />
        <MagnifyingGlass className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(searchQuery ? searchResults : []).map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onClick={() => router.push(`/memory/${memory.id}`)}
          />
        ))}
      </div>

      {!searchQuery && (
        <EmptyState
          icon={<MagnifyingGlass size={48} className="text-secondary-400" weight="duotone" />}
          title="Search Sanctuary"
          description="Rediscover your journey by searching through your thoughts, locations, and milestones."
        />
      )}

      {searchQuery && searchResults.length === 0 && (
        <EmptyState
          icon={<MagnifyingGlass size={48} />}
          title="No results found"
          description={`No memories match "${searchQuery}"`}
        />
      )}
    </div>
  );
}
