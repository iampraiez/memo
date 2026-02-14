"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/ui/OfflineBanner";
import NotificationPanel from "@/components/NotificationPanel"
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname, useRouter } from "next/navigation";
import { useSync } from "@/components/providers/SyncProvider";
import { useSession } from "next-auth/react";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { useCreateMemory, useUpdateMemory } from "@/hooks/useMemories";
import { Memory } from "@/types/types";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const { isOnline } = useSync();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const createMemoryMutation = useCreateMemory();
  const updateMemoryMutation = useUpdateMemory();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //   }
  // }, [status, router]);

  const handleSaveMemory = async (memory: Memory) => {
    try {
      // Check if it's a temp ID or existing ID
      const isUpdate = memory.id && !memory.id.startsWith('memory-');
      
      if (isUpdate) {
        // Extract only updateable data
        const { id, ...data } = memory;
        await updateMemoryMutation.mutateAsync({ id, data });
        toast.success("Memory updated successfully!");
      } else {
        await createMemoryMutation.mutateAsync(memory);
        toast.success("Memory created successfully!");
      }
      setCreateModalOpen(false);
    } catch {
      toast.error("Failed to save memory");
    }
  };

  if (status === "loading") {
    return null;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary-100 selection:text-primary-900">
      <Header
        onCreateMemory={() => setCreateModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        syncStatus={isOnline ? "online" : "offline"}
        notificationCount={unreadCount}
        onNavigate={(page) => router.push(`/${page}`)}
      />
      <OfflineBanner />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onNavigate={(page) => {
            router.push(`/${page}`);
            setSidebarOpen(false);
          }}
          onClick={() => setSidebarOpen(false)}
        />

        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="max-w-400 mx-auto min-h-[calc(100vh-80px)]">
            {children}
          </div>
        </main>
      </div>

      <CreateMemoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveMemory}
      />

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
