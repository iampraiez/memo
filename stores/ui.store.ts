import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Toast
  toast: {
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  hideToast: () => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    // Sidebar
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    // Modals
    activeModal: null,
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),

    // Toast
    toast: null,
    showToast: (message, type) => set({ toast: { message, type } }),
    hideToast: () => set({ toast: null }),

    // Loading
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
  })),
);
