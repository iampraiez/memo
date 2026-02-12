"use client";
import React, { useState } from "react";
import Timeline from "@/components/Timeline";
import { useMemories, useDeleteMemory, useUpdateMemory } from "@/hooks/useMemories";
import { Memory } from "@/types/types";
import Loading from "@/components/ui/Loading";
import { toast } from "sonner";
import MemoryDetail from "@/components/MemoryDetail";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { memoryService } from "@/services/memory.service";

interface TimelineClientProps {
  initialMemories: Memory[];
}

export default function TimelineClient({ initialMemories }: TimelineClientProps) {
  const { data: memoriesData, isLoading: isLoadingMemories } =
    useMemories(undefined, 100, 0);
  
  const deleteMemoryMutation = useDeleteMemory();
  const updateMemoryMutation = useUpdateMemory();
  const [viewingMemoryDetail, setViewingMemoryDetail] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const memories = memoriesData?.memories || initialMemories;

  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditModalOpen(true);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await deleteMemoryMutation.mutateAsync(memoryId);
        toast.success("Memory deleted");
      } catch (error) {
        toast.error("Failed to delete memory");
      }
    }
  };

  const handleShareMemory = async (memory: Memory) => {
    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !memory.isPublic })
       });
       if(!response.ok) throw new Error("Failed");
       toast.success(memory.isPublic ? "Memory is now private" : "Memory shared with sanctuary circle");
    } catch (error) {
      toast.error("Failed to update share status");
    }
  };

  if (viewingMemoryDetail) {
    return (
      <MemoryDetail
        memoryId={viewingMemoryDetail}
        onBack={() => setViewingMemoryDetail(null)}
        onEdit={handleEditMemory}
        onShareMemory={handleShareMemory}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-neutral-900">
          Your Timeline
        </h1>
        {isLoadingMemories && memories.length === 0 ? (
          <Loading fullPage text="Retrieving your memories..." />
        ) : (
          <Timeline
            memories={memories}
            onMemoryClick={(m) => setViewingMemoryDetail(m.id)}
            onEditMemory={handleEditMemory}
            onDeleteMemory={handleDeleteMemory}
            onShareMemory={handleShareMemory}
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
