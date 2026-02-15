import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MemoryState {
  selectedMemoryIds: string[];
  filters: {
    searchQuery: string;
    tags: string[];
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    mood: string | null;
  };

  setSelectedMemories: (ids: string[]) => void;
  toggleMemorySelection: (id: string) => void;
  clearSelection: () => void;

  setSearchQuery: (query: string) => void;
  setTagFilter: (tags: string[]) => void;
  setDateRangeFilter: (start: Date | null, end: Date | null) => void;
  setMoodFilter: (mood: string | null) => void;
  clearFilters: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  devtools((set) => ({
    selectedMemoryIds: [],
    filters: {
      searchQuery: "",
      tags: [],
      dateRange: {
        start: null,
        end: null,
      },
      mood: null,
    },

    setSelectedMemories: (ids) => set({ selectedMemoryIds: ids }),
    toggleMemorySelection: (id) =>
      set((state) => ({
        selectedMemoryIds: state.selectedMemoryIds.includes(id)
          ? state.selectedMemoryIds.filter((memId) => memId !== id)
          : [...state.selectedMemoryIds, id],
      })),
    clearSelection: () => set({ selectedMemoryIds: [] }),

    setSearchQuery: (query) =>
      set((state) => ({
        filters: { ...state.filters, searchQuery: query },
      })),
    setTagFilter: (tags) =>
      set((state) => ({
        filters: { ...state.filters, tags },
      })),
    setDateRangeFilter: (start, end) =>
      set((state) => ({
        filters: { ...state.filters, dateRange: { start, end } },
      })),
    setMoodFilter: (mood) =>
      set((state) => ({
        filters: { ...state.filters, mood },
      })),
    clearFilters: () =>
      set({
        filters: {
          searchQuery: "",
          tags: [],
          dateRange: { start: null, end: null },
          mood: null,
        },
      }),
  })),
);
