"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/ui/OfflineBanner";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname } from "next/navigation";
import { useSync } from "@/components/providers/SyncProvider";
import { useSession } from "next-auth/react";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { useCreateMemory, useUpdateMemory } from "@/hooks/useMemories";
import { CreateMemoryData } from "@/services/memory.service";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useNotifications();
  const { isOnline } = useSync();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const createMemoryMutation = useCreateMemory();
  const updateMemoryMutation = useUpdateMemory();

  useEffect(() => {
    setMounted(true);
    setSidebarOpen(false);
  }, [pathname]);

  const handleSaveMemory = async (memoryData: CreateMemoryData & { id?: string }) => {
    try {
      if (createModalOpen && !memoryData.id) {
        // Create mode - ensure required fields for CreateMemoryData
        const { title, content, date } = memoryData;
        if (!title || !content || !date) {
          throw new Error("Missing required fields for memory creation");
        }
        await createMemoryMutation.mutateAsync(memoryData);
        toast.success("Memory created successfully!");
      } else if (memoryData.id) {
        // Update mode
        const { id, ...data } = memoryData;
        await updateMemoryMutation.mutateAsync({ id, data });
        toast.success("Memory updated successfully!");
      }
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to save memory:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save memory");
    }
  };

  if (!session && status !== "loading") return null;

  return (
    <div className="selection:bg-primary-100 selection:text-primary-900 min-h-screen bg-neutral-50">
      <Header
        onCreateMemory={() => setCreateModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        syncStatus={mounted ? (isOnline ? "online" : "offline") : "offline"}
        notificationCount={unreadCount}
      />
      {mounted && <OfflineBanner />}

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />

        <main className="flex-1 transition-all duration-300 lg:ml-64">
          <div className="mx-auto min-h-[calc(100vh-80px)] max-w-400">{children}</div>
        </main>
      </div>

      {mounted && (
        <>
          <CreateMemoryModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleSaveMemory}
          />

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </>
      )}
    </div>
  );
}
