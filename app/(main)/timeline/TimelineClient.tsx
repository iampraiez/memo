"use client";
import { useState, useEffect } from "react";
import Timeline from "@/components/Timeline";
import { useMemories, useDeleteMemory, useUpdateMemory } from "@/hooks/useMemories";
import { Memory } from "@/types/types";
import Loading from "@/components/ui/Loading";
import { toast } from "sonner";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import OnThisDayWidget from "@/components/OnThisDayWidget";
import { useOnThisDay } from "@/hooks/useMemories";
import dynamic from "next/dynamic";

const TimelineMapView = dynamic(() => import("@/components/TimelineMapView"), {
  ssr: false,
  loading: () => <Loading text="Loading map..." />,
});

const MOODS = [
  { value: "joyful", label: "Joyful", emoji: "😊" },
  { value: "peaceful", label: "Peaceful", emoji: "😌" },
  { value: "excited", label: "Excited", emoji: "🤩" },
  { value: "nostalgic", label: "Nostalgic", emoji: "🌅" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "reflective", label: "Reflective", emoji: "💭" },
];

interface TimelineClientProps {
  initialMemories: Memory[];
}

export default function TimelineClient({ initialMemories }: TimelineClientProps) {
  const router = useRouter();
  const {
    data: memoriesData,
    isLoading: isLoadingMemories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemories(undefined, 20);

  const deleteMemoryMutation = useDeleteMemory();
  const updateMemoryMutation = useUpdateMemory();
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { data: onThisDayMemories = [] } = useOnThisDay();

  useEffect(() => {
    setIsMounted(true);
    const savedView = sessionStorage.getItem("timeline_view_mode");
    if (savedView === "list" || savedView === "grid" || savedView === "map") {
      setViewMode(savedView as "grid" | "list" | "map");
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem("timeline_view_mode", viewMode);
    }
  }, [viewMode, isMounted]);

  const memories = isMounted ? memoriesData?.memories || initialMemories : initialMemories;
  const isLoading = isMounted ? isLoadingMemories : true;

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      searchQuery === "" ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = !selectedMood || memory.mood === selectedMood;

    return matchesSearch && matchesMood;
  });

  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditModalOpen(true);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await deleteMemoryMutation.mutateAsync(memoryId);
        toast.success("Memory deleted");
      } catch {
        toast.error("Failed to delete memory");
      }
    }
  };

  const handleShareMemory = async (memory: Memory) => {
    try {
      await updateMemoryMutation.mutateAsync({
        id: memory.id,
        data: { isPublic: !memory.isPublic },
      });
      toast.success(
        memory.isPublic ? "Memory is now private" : "Memory shared with sanctuary circle",
      );
    } catch {
      toast.error("Failed to update share status");
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold text-neutral-900">Your Timeline</h1>
            <div className="flex rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Map
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search memories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:border-primary-300 focus:ring-primary-100 w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-10 pl-10 text-sm transition-all outline-none focus:ring-4"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="scrollbar-hide flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center space-x-1.5 rounded-xl border border-neutral-200 bg-white p-1">
                <button
                  onClick={() => setSelectedMood(null)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    !selectedMood
                      ? "bg-primary-50 text-primary-700 ring-primary-200 ring-1"
                      : "text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  All Moods
                </button>
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex items-center space-x-1 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedMood === mood.value
                        ? "bg-primary-50 text-primary-700 ring-primary-200 ring-1"
                        : "text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* On This Day Highlight */}
        {!searchQuery && !selectedMood && onThisDayMemories.length > 0 && viewMode !== "map" && (
          <OnThisDayWidget
            memories={onThisDayMemories}
            onMemoryClick={(m) => router.push(`/memory/${m.id}`)}
          />
        )}

        {isLoading && memories.length === 0 ? (
          <Loading fullPage text="Retrieving your memories..." />
        ) : viewMode === "map" ? (
          <div className="py-4">
            <TimelineMapView
              memories={filteredMemories}
              onMemoryClick={(m) => router.push(`/memory/${m.id}`)}
            />
          </div>
        ) : (
          <Timeline
            memories={filteredMemories}
            viewMode={viewMode}
            onMemoryClick={(m) => router.push(`/memory/${m.id}`)}
            onEditMemory={handleEditMemory}
            onDeleteMemory={handleDeleteMemory}
            onShareMemory={handleShareMemory}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage || false}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>

      <CreateMemoryModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMemory(null);
        }}
        onSave={async (val) => {
          if (selectedMemory) {
            await updateMemoryMutation.mutateAsync({ id: selectedMemory.id, data: val });
            toast.success("Memory updated");
          }
          setEditModalOpen(false);
          setSelectedMemory(null);
        }}
        editingMemory={selectedMemory || undefined}
      />
    </div>
  );
}
