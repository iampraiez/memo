"use client";
import React, { useState } from "react";
import Timeline from "@/components/Timeline";
import { useMemories, useDeleteMemory, useUpdateMemory } from "@/hooks/useMemories";
import { Memory } from "@/types/types";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import MemoryDetail from "@/components/MemoryDetail"; // Corrected import
import CreateMemoryModal from "@/components/CreateMemoryModal";

export default function TimelinePage() {
  const { data: memoriesData, isLoading: isLoadingMemories } = useMemories();
  const deleteMemoryMutation = useDeleteMemory();
  const updateMemoryMutation = useUpdateMemory("");
  const [viewingMemoryDetail, setViewingMemoryDetail] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const memories = memoriesData?.memories || [];

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
       toast.success(memory.isPublic ? "Memory is now private" : "Memory shared with family");
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
        {isLoadingMemories ? (
          <div className="flex items-center justify-center py-20">
            <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : (
          <Timeline
            memories={memories}
            onMemoryClick={(m) => setViewingMemoryDetail(m.id)}
            onEditMemory={handleEditMemory}
            onDeleteMemory={handleDeleteMemory}
            onShareMemory={handleShareMemory}
            onAddMemory={() => {}} // Handle via dashboard layout
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
            // Re-using create mutation logic or fix hook
            toast.error("Update logic refinement needed");
            setEditModalOpen(false);
        }}
        editingMemory={selectedMemory || undefined}
      />
    </div>
  );
}
