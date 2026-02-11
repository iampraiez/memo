"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/ui/OfflineBanner";
import NotificationToast from "@/components/ui/NotificationToast";
import { useNetworkStatus } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { useCreateMemory } from "@/hooks/useMemories";
import { toast } from "sonner";
import Loading from "@/app/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const isOnline = useNetworkStatus();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const createMemoryMutation = useCreateMemory();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //   }
  // }, [status, router]);

  const handleCreateMemory = async (newMemory: any) => {
    try {
      await createMemoryMutation.mutateAsync(newMemory);
      toast.success("Memory created successfully!");
      setCreateModalOpen(false);
    } catch {
      toast.error("Failed to save memory");
    }
  };

  if (status === "loading") {
    return null;
  }

  if (!session) return null;

  const currentPage = pathname.split("/").pop() || "timeline";

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary-100 selection:text-primary-900">
      <Header
        onCreateMemory={() => setCreateModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        syncStatus={isOnline ? "online" : "offline"}
        notificationCount={notifications.filter((n) => !n.read).length}
        onNavigate={(page) => router.push(`/${page}`)}
      />
      <OfflineBanner isVisible={!isOnline} />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          currentPage={currentPage}
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
        onSave={handleCreateMemory}
      />

      <NotificationToast
        notifications={notifications}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
        onClose={() => setShowNotifications(false)}
        isOpen={showNotifications}
      />
    </div>
  );
}
