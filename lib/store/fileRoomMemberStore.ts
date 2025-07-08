import { create } from 'zustand';

type LiveUser = {
  userId: string;
  username: string;
  avatarUrl: string;
  socketId: string;
};

type State = {
  fileRoomUsersMap: Record<string, LiveUser[]>;
  getUsersForFile: (filePath: string) => LiveUser[];
  setUsersForFile: (filePath: string, users: LiveUser[]) => void;
  addFileRoomUser: (filePath: string, user: LiveUser) => void;
  removeFileRoomUser: (filePath: string, userId: string) => void;
  clearFileRoomUsers: (filePath: string) => void;
};

export const useFileRoomMembersStore = create<State>((set, get) => ({
  fileRoomUsersMap: {},

 getUsersForFile: (filePath) => {
  const state = get();
  const users = state.fileRoomUsersMap[filePath] || [];
  return users;
},

  setUsersForFile: (filePath, users) => {
    const map = new Map<string, LiveUser>();
    for (const user of users) map.set(user.userId, user);
    set((state) => ({
      fileRoomUsersMap: {
        ...state.fileRoomUsersMap,
        [filePath]: Array.from(map.values()),
      },
    }));
  },

  addFileRoomUser: (filePath, user) => {
    set((state) => {
      const currentUsers = state.fileRoomUsersMap[filePath] || [];
      const exists = currentUsers.some((u) => u.userId === user.userId);
      if (exists) return state;

      return {
        fileRoomUsersMap: {
          ...state.fileRoomUsersMap,
          [filePath]: [...currentUsers, user],
        },
      };
    });
  },

  removeFileRoomUser: (filePath, userId) => {
    set((state) => {
      const currentUsers = state.fileRoomUsersMap[filePath] || [];
      return {
        fileRoomUsersMap: {
          ...state.fileRoomUsersMap,
          [filePath]: currentUsers.filter((u) => u.userId !== userId),
        },
      };
    });
  },

  clearFileRoomUsers: (filePath) =>
    set((state) => {
      const newMap = { ...state.fileRoomUsersMap };
      delete newMap[filePath];
      return { fileRoomUsersMap: newMap };
    }),
}));