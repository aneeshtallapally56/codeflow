import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  userId: string | null;
  username: string | null;
  port: number | null;
  setUser: (userId: string, username: string) => void;
  setPort: (port: number) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      port: null, 
      setUser: (userId, username) => set({ userId, username }),
      setPort: (port) => set({ port }),
    }),
    {
      name: "user-storage",
    }
  )
);