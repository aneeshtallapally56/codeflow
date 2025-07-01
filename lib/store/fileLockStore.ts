import { create } from "zustand";

type FileLock = {
  path: string;
  lockedBy: string;
   lockedByUsername: string;
};
type FileLockStore = {
  locks: FileLock[];
  setLocks: (locks: FileLock[]) => void;
  addLock: (lock: FileLock) => void;
  removeLock: (path: string) => void;
  removeAllLocksByUser: (userId: string) => void;
  isLocked: (path: string) => boolean;
  lockedByUser: (path: string, userId: string | null) => boolean;
  getLockInfo: (path: string) => FileLock | null; // New method
    getLockedByUsername: (path: string) => string | null;
  clearAllLocks: () => void; // New method for cleanup
};

export const useFileLockStore = create<FileLockStore>((set, get) => ({
  locks: [],
  setLocks: (locks) => set({ locks }),
  addLock: (lock) =>
    set((state) => ({
      locks: [...state.locks.filter((l) => l.path !== lock.path), lock],
    })),
  removeLock: (path) =>
    set((state) => ({
      locks: state.locks.filter((lock) => lock.path !== path),
    })),
    removeAllLocksByUser: (userId) =>
        set((state) => ({
            locks: state.locks.filter((lock) => lock.lockedBy !== userId),
        })),
  isLocked: (path) => get().locks.some((lock) => lock.path === path),
  lockedByUser: (path, userId) =>
    get().locks.some((lock) => lock.path === path && lock.lockedBy === userId),
   getLockedByUsername: (path) => {
    const lock = get().locks.find((lock) => lock.path === path);
    return lock?.lockedByUsername || null;
  },
   getLockInfo: (path) =>
        get().locks.find((lock) => lock.path === path) || null,
    clearAllLocks: () => set({ locks: [] }),
}));
