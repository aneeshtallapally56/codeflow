// store/fileRoomMembersStore.ts
import { create } from 'zustand';

type LiveUser = {
  userId: string;
  username: string;
  socketId: string;
};

type State = {
  fileRoomUsers: LiveUser[];
  setFileRoomUsers: (users: LiveUser[]) => void;
  addFileRoomUser: (user: LiveUser) => void;
  removeFileRoomUser: (socketId: string) => void;
};

export const useFileRoomMembersStore = create<State>((set) => ({
  fileRoomUsers: [],

  setFileRoomUsers: (users) => {
    const map = new Map<string, LiveUser>();
    for (const user of users) map.set(user.userId, user);
    set({ fileRoomUsers: Array.from(map.values()) });
  },

  addFileRoomUser: (user) =>
    set((state) => {
      const exists = state.fileRoomUsers.some((u) => u.userId === user.userId);
      if (exists) return state;
      return { fileRoomUsers: [...state.fileRoomUsers, user] };
    }),

  removeFileRoomUser: (socketId) =>
    set((state) => ({
      fileRoomUsers: state.fileRoomUsers.filter((u) => u.socketId !== socketId),
    })),
}));