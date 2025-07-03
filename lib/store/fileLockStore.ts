import { create } from "zustand";

type FileLockState = {
  lockedBy: { [filePath: string]: string | null }; // null = unlocked
  setLock: (filePath: string, userId: string | null) => void;
};

export const useFileLockStore = create<FileLockState>((set) => ({
  lockedBy: {},
  setLock: (filePath, userId) =>
    set((state) => ({
      lockedBy: { ...state.lockedBy, [filePath]: userId },
    })),
}));