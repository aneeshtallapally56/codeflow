import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  userId: string | null;
    username: string | null;
 setUser: (userId: string, username: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
        username:  null,
setUser: (userId, username) => set({ userId, username }),
    }),
    {
      name: "user-storage", 
    }
  )
);