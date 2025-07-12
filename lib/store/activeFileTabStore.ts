import { create } from 'zustand';

type ActiveFileTab = {
  path: string;
  value: string;
  extension: string;
};

type State = {
  activeFileTab: ActiveFileTab | null;
  setActiveFileTab: (tab: ActiveFileTab) => void;
  clearActiveFileTab: () => void;
};

export const useActiveFileTabStore = create<State>((set) => ({
  activeFileTab: null,

  setActiveFileTab: (tab) => {

    set({ activeFileTab: tab })},

  clearActiveFileTab: () => set({ activeFileTab: null }),
}));