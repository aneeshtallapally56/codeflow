import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  userId: string;
  username?: string;
  email: string;
  avatarUrl?: string;
};

type UserState = {
  user: User | null;
  port: number | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setPort: (port: number) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      port: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setPort: (port) => set({ port }),
    }),
    {
      name: "user-storage", // persists in localStorage
    }
  )
);