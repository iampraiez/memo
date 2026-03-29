"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/ui/Button";
import OfflineBanner from "@/components/ui/OfflineBanner";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname } from "next/navigation";
import { useSync } from "@/components/providers/SyncProvider";
import CreateMemoryModal from "@/components/CreateMemoryModal";
import { useCreateMemory, useUpdateMemory, useStreak } from "@/hooks/useMemories";
import { CreateMemoryData } from "@/services/memory.service";
import { Trophy, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "@phosphor-icons/react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useNotifications();
  const { isOnline } = useSync();
  const pathname = usePathname();
  const createMemoryMutation = useCreateMemory();
  const updateMemoryMutation = useUpdateMemory();
  const { data: streak } = useStreak();
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebratedMilestone, setCelebratedMilestone] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setSidebarOpen(false);

    // Global keyboard shortcut (Cmd/Ctrl + N)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]);

  const handleSaveMemory = async (memoryData: CreateMemoryData & { id?: string }) => {
    try {
      if (createModalOpen && !memoryData.id) {
        // Create mode
        const { title, content, date } = memoryData;
        if (!title || !content || !date) {
          throw new Error("Missing required fields for memory creation");
        }
        await createMemoryMutation.mutateAsync(memoryData);

        // Haptic Feedback for success (Audit 9.10)
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          window.navigator.vibrate(50);
        }

        toast.success("Memory created successfully!");
      } else if (memoryData.id) {
        // Update mode
        const { id, ...data } = memoryData;
        await updateMemoryMutation.mutateAsync({ id, data });
        toast.success("Memory updated successfully!");
      }
      setCreateModalOpen(false);

      // Check for streak milestones
      if (streak !== undefined && [7, 30, 100, 365].includes(streak)) {
        setCelebratedMilestone(streak);
        setShowStreakCelebration(true);
        setTimeout(() => setShowStreakCelebration(false), 5000);
      }
    } catch (error) {
      console.error("Failed to save memory:", error);
      toast.error("Failed to save memory. Please try again.");
    }
  };

  return (
    <div className="selection:bg-primary-100 selection:text-primary-900 min-h-screen bg-neutral-50">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        syncStatus={mounted ? (isOnline ? "online" : "offline") : "offline"}
        notificationCount={unreadCount}
      />
      {mounted && <OfflineBanner />}

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />

        <main className="flex-1 transition-all duration-300 lg:ml-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto min-h-[calc(100vh-80px)] max-w-5xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Quick Capture FAB - Persistent but specialized placement */}
      <button
        onClick={() => setCreateModalOpen(true)}
        className="bg-primary-600 hover:bg-primary-700 fixed right-8 bottom-8 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95 lg:flex"
        aria-label="Create new memory"
      >
        <Plus className="h-6 w-6" weight="bold" />
      </button>

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
      {/* Streak Celebration Overlay */}
      <AnimatePresence>
        {showStreakCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-primary-900 border-secondary-400 relative overflow-hidden rounded-4xl border-4 p-12 text-center text-white shadow-2xl"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="bg-secondary-400 absolute inset-0 scale-150 -rotate-12 animate-pulse blur-3xl" />
              </div>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-secondary-400 mb-6 flex justify-center"
              >
                <Trophy size={120} weight="fill" />
              </motion.div>

              <h2 className="font-display mb-2 text-5xl font-bold tracking-tight">
                {celebratedMilestone} Day Streak!
              </h2>
              <p className="text-secondary-400 mb-8 text-xl font-medium">
                Your dedication to your heritage is legendary.
              </p>

              <div className="flex justify-center space-x-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
                  >
                    <Star weight="fill" className="text-secondary-500 h-6 w-6" />
                  </motion.div>
                ))}
              </div>

              <Button
                variant="secondary"
                className="mt-8 rounded-2xl px-12 py-4 text-lg font-bold"
                onClick={() => setShowStreakCelebration(false)}
              >
                Continue Your Journey
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
