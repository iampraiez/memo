"use client";
import React, { useState, useEffect } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Clock,
  ArrowsClockwise,
  GlobeHemisphereWest,
  User,
} from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import MemoryCard from "@/components/MemoryCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Memory } from "@/types/types";
import DatePicker from "@/components/ui/DatePicker";
import MultiSelect from "@/components/ui/MultiSelect";
import { useSearchMemories } from "@/hooks/useMemories";
import { useTags } from "@/hooks/useTags";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scope, setScope] = useState<"mine" | "circle">("mine");
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchData, isLoading } = useSearchMemories(debouncedQuery, scope);
  const searchResults = searchData?.memories || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Search Memories</h1>
          <p className="text-neutral-600 mt-1">Find memories by content throughout your sanctuary</p>
        </div>
        <div className="w-full md:w-64">
           {/* Scope Select */}
           <div className="bg-white p-1 rounded-xl border border-neutral-200 flex shadow-sm">
                <button 
                    onClick={() => setScope("mine")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${scope === 'mine' ? 'bg-primary-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                    <User weight="bold" />
                    <span>My Memories</span>
                </button>
                <button 
                    onClick={() => setScope("circle")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${scope === 'circle' ? 'bg-primary-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                    <GlobeHemisphereWest weight="bold" />
                    <span>All Circle</span>
                </button>
           </div>
        </div>
      </div>

      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={scope === 'mine' ? "Search your memories..." : "Search stories from your circle..."}
          className="pl-12 py-4 shadow-soft text-lg"
        />
        <MagnifyingGlass className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>

      <div className="space-y-4">
          {isLoading && debouncedQuery ? (
              <div className="py-20 flex justify-center">
                  <Loading text="Searching the archives..." />
              </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.map((memory) => (
                <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onClick={() => router.push(`/memory/${memory.id}`)}
                />
                ))}
            </div> 
          )}
      </div>

      {!debouncedQuery && (
        <EmptyState
          icon={<MagnifyingGlass size={48} className="text-secondary-400" weight="duotone" />}
          title="Search Sanctuary"
          description="Rediscover your journey by searching through your thoughts, locations, and milestones."
        />
      )}

      {debouncedQuery && !isLoading && searchResults.length === 0 && (
        <EmptyState
          icon={<MagnifyingGlass size={48} />}
          title="No results found"
          description={`No memories match "${debouncedQuery}" in ${scope === 'mine' ? 'your collection' : 'your circle'}.`}
        />
      )}
    </div>
  );
}
