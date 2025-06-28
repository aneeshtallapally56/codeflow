
import { create } from 'zustand';

type LiveUser = {
  userId: string;
  socketId: string;
};

type State = {
  liveUsers: LiveUser[];
  setLiveUsers: (users: LiveUser[]) => void;
  addLiveUser: (user: LiveUser) => void;
  removeLiveUser: (socketId: string) => void;
};

export const useRoomMembersStore = create<State>((set) => ({
  liveUsers: [],
  setLiveUsers: (users) => {
    set({ liveUsers: users })
  },
  addLiveUser: (user) =>
    set((state) => ({
      liveUsers: [...state.liveUsers.filter(u => u.socketId !== user.socketId), user],
    })),
  removeLiveUser: (socketId) =>
    set((state) => ({
      liveUsers: state.liveUsers.filter((u) => u.socketId !== socketId),
    })),
}));