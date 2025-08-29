"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Timeline from "@/components/Timeline";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import MemoryDetailPage from "@/pages/MemoryDetailPage";
import SearchPage from "@/pages/SearchPage";
import TagsPage from "@/pages/TagsPage";
import StoryGeneratorPage from "@/pages/StoryGeneratorPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import FamilyTimelinePage from "@/pages/FamilyTimelinePage";
import PrivacySettingsPage from "@/pages/PrivacySettingPage";
import OfflineBanner from "@/components/ui/OfflineBanner";
import NotificationToast from "@/components/ui/NotificationToast";
import { notification, sampleMemories } from "@/data/sampleData";
import { Memory } from "@/types/types";
import { useNetworkStatus, db } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { Comment, Like, UserSettings } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function App() {
  const [currentPage, setCurrentPage] = useState("timeline");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  // if online or offline
  const isOnline = useNetworkStatus();
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewingMemoryDetail, setViewingMemoryDetail] = useState<string | null>(
    null
  );
  const memories = useLiveQuery(() => db.memories.toArray(), []) || [];
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(notification);
  // redirect to login page which checks for id or something before redirecting here with a useEffect

  const pathname = usePathname();
  const route = useRouter();
  const { data: session, status } = useSession();
  // easiest way to make it run infintely
  useEffect(() => {
    if (status == undefined || status === "loading") return;
    if (!session && (pathname == "/onboading" || pathname == "/mainpage")) {
      route.push("/auth/login");
    }
  }, [pathname, status]);
  console.log(status);

  console.log(session);

  useEffect(() => {
    const loadInitialMemories = async () => {
      const count = await db.memories.count();
      if (count === 0) {
        // Only load sample data if the database is empty
        sampleMemories.forEach(async (mem) => {
          await db.memories.put(mem);
        });
      }
    };
    loadInitialMemories();
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncOfflineChanges();
    }
  }, [isOnline]);

  const syncOfflineChanges = async () => {
    console.log("Attempting to sync offline changes...");
    const changes = await db.offline_changes.toArray();
    console.log(changes);

    for (const change of changes) {
      try {
        console.log(
          `Syncing ${change.type} for ${change.collection} with data:`,
          change.data
        );
        // In a real app, make your actual API call here based on change.type (add/update/delete)
        // Example: await fetch('/api/memories', { method: 'POST', body: JSON.stringify(change.data) });

        switch (change.collection) {
          case "memories":
            const syncedMemory: Memory = {
              ...(change.data as Memory),
              syncStatus: "synced",
            };
            await db.memories.put(syncedMemory);
            break;
          case "likes":
            const syncedLike: Like = {
              ...(change.data as Like),
              syncStatus: "synced",
            };
            await db.likes.put(syncedLike);
            break;
          case "comments":
            const syncedComment: Comment = {
              ...(change.data as Comment),
              syncStatus: "synced",
            };
            await db.comments.put(syncedComment);
            break;
          case "userSettings":
            const syncedUserSettings: UserSettings = {
              ...(change.data as UserSettings),
              syncStatus: "synced",
            };
            await db.userSettings.put(syncedUserSettings);
            break;
          default:
            console.warn(
              "Unknown collection type for sync:",
              change.collection
            );
            continue; // Skip this change and go to the next
        }

        await db.offline_changes.delete(change.id!); // Remove from offline_changes after successful sync
      } catch (error) {
        console.error("Error syncing offline change:", change, error);
        // Handle errors: maybe retry later, or notify user
      }
    }
  };

  const handleCreateMemory = (newMemory: Partial<Memory>) => {
    // No need to setMemories directly here, useLiveQuery will handle it
    // The CreateMemoryModal already saves to db.memories
    // if err it's here
    db.memories.add(newMemory as Memory);
  };

  const handleMemoryClick = (memory: Memory) => {
    setViewingMemoryDetail(memory.id);
  };

  const handleBackToTimeline = () => {
    setViewingMemoryDetail(null);
  };

  // Pass memory to CreateMemoryModal for editing
  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setCreateModalOpen(true);
    setViewingMemoryDetail(null);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    const result = window.confirm(
      "Are you sure you want to delete this memory?"
    );
    if (!result) return;
    console.log("Attempting to delete memory:", memoryId);

    const memoryToDelete = memories.find((mem) => mem.id === memoryId);
    if (!memoryToDelete) {
      console.error("Memory not found for deletion:", memoryId);
      return;
    }

    if (isOnline) {
      console.log("Simulating backend delete for memory:", memoryId);
      // Actual backend delete API call here
    } else {
      console.log("Queueing offline delete for memory:", memoryId);
      await db.offline_changes.add({
        type: "delete",
        collection: "memories",
        data: { ...memoryToDelete, syncStatus: "pending" } as Memory, // Include full memory data and pending status for delete
        timestamp: Date.now(),
      });
    }
    await db.memories.delete(memoryId); // Delete from local Dexie store
  };

  const handleShareMemory = async (memory: Memory) => {
    const updatedMemory = {
      ...memory,
      isPublic: !memory.isPublic,
      updatedAt: new Date().toISOString(),
      syncStatus: (isOnline ? "synced" : "offline") as
        | "synced"
        | "pending"
        | "offline", // Explicitly cast to literal type
    }; // Toggle isPublic

    if (isOnline) {
      console.log(
        "Simulating backend update for memory share status:",
        updatedMemory.id
      );
      // Actual backend update API call here to toggle isPublic
    } else {
      console.log(
        "Queueing offline update for memory share status:",
        updatedMemory.id
      );
      await db.offline_changes.add({
        type: "update",
        collection: "memories",
        data: updatedMemory,
        timestamp: Date.now(),
      });
    }
    await db.memories.put(updatedMemory); // Update in local Dexie store
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  // Memory Detail View
  if (viewingMemoryDetail) {
    return (
      <MemoryDetailPage
        memoryId={viewingMemoryDetail}
        onBack={handleBackToTimeline}
        onEdit={handleEditMemory}
        onShareMemory={handleShareMemory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Offline Banner */}

      {/* Header */}
      <Header
        onCreateMemory={() => setCreateModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        //set sync status
        syncStatus={isOnline ? "online" : "offline"}
        notificationCount={notifications.filter((n) => !n.read).length}
        onNavigate={setCurrentPage} // Pass setCurrentPage as onNavigate
      />
      <OfflineBanner isVisible={!isOnline} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {currentPage === "timeline" && (
            <div className="min-h-fit bg-neutral-50">
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-display font-bold text-neutral-900">
                        Your Timeline
                      </h1>
                      <p className="text-neutral-600 mt-1">
                        Explore your memories organized by time
                      </p>
                    </div>
                  </div>

                  <Timeline
                    memories={memories}
                    onMemoryClick={handleMemoryClick}
                    onEditMemory={handleEditMemory}
                    onDeleteMemory={handleDeleteMemory}
                    onShareMemory={handleShareMemory}
                  />
                </div>
              </div>
            </div>
          )}

          {currentPage === "search" && (
            <SearchPage
              onMemoryClick={handleMemoryClick}
              onEditMemory={handleEditMemory}
              onDeleteMemory={handleDeleteMemory}
              onShareMemory={handleShareMemory}
            />
          )}
          {currentPage === "tags" && (
            <TagsPage
              onMemoryClick={handleMemoryClick}
              onEditMemory={handleEditMemory}
              onDeleteMemory={handleDeleteMemory}
              onShareMemory={handleShareMemory}
            />
          )}
          {currentPage === "stories" && <StoryGeneratorPage />}
          {currentPage === "settings" && <SettingsPage />}
          {currentPage === "family" && <FamilyTimelinePage />}
          {currentPage === "privacy" && <PrivacySettingsPage />}
          {currentPage === "analytics" && <AnalyticsPage />}
          {currentPage === "admin" && <AdminPage />}
        </main>
      </div>

      {/* Create Memory Modal */}
      <CreateMemoryModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedMemory(null); // Reset selectedMemory when modal closes
        }}
        onSave={handleCreateMemory}
        editingMemory={selectedMemory || undefined}
      />

      <NotificationToast
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClose={() => setShowNotifications(false)}
        isOpen={showNotifications}
      />
      {/* close sidebar if outside is clicked */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
