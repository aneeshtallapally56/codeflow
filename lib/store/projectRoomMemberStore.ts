// store/projectRoomMembersStore.ts
import { create } from 'zustand';

type LiveUser = {
  userId: string;
  username: string;
  avatarUrl: string;
  socketId: string;
};

type State = {
  projectRoomUsers: LiveUser[];
  setProjectRoomUsers: (users: LiveUser[]) => void;
  addProjectRoomUser: (user: LiveUser) => void;
  removeProjectRoomUser: (socketId: string) => void;
};

export const useProjectRoomMembersStore = create<State>((set) => ({
  projectRoomUsers: [],

  setProjectRoomUsers: (users) => {
    const map = new Map<string, LiveUser>();
    for (const user of users) map.set(user.userId, user);
    set({ projectRoomUsers: Array.from(map.values()) });
  },

  addProjectRoomUser: (user) =>
    set((state) => {
      const exists = state.projectRoomUsers.some((u) => u.userId === user.userId);
      if (exists) return state;
      return { projectRoomUsers: [...state.projectRoomUsers, user] };
    }),

  removeProjectRoomUser: (socketId: string) =>
    set((state) => ({
      projectRoomUsers: state.projectRoomUsers.filter((u) => u.socketId !== socketId),
    })),
}));