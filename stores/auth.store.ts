import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  } | null;
  setUser: (user: AuthState["user"]) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        user: null,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        clearUser: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        name: "auth-storage",
      },
    ),
  ),
);
