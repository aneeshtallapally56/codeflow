import { create } from 'zustand';

type LiveUser = {
  userId: string;
  username: string;
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

    const map = new Map<string, LiveUser>();
    for (const user of users) {
      map.set(user.userId, user); 
    }
    set({ liveUsers: Array.from(map.values()) });
  },

  addLiveUser: (user) =>
    set((state) => {
      const exists = state.liveUsers.some((u) => u.userId === user.userId);
      if (exists) return state;
      return { liveUsers: [...state.liveUsers, user] };
    }),

  removeLiveUser: (socketId) =>
    set((state) => ({
      liveUsers: state.liveUsers.filter((u) => u.socketId !== socketId),
    })),
}));