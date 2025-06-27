import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";

type FileTab = {
  path: string;
  name: string;
  content: string;
  extension: string;
};

type State = {
  openTabs: FileTab[];
  activePath: string | null;
  setActivePath: (path: string) => void;
  openFile: (file: FileTab) => void;
  closeFile: (path: string) => void;
};

export const useEditorTabStore = create<State>((set) => ({
  openTabs: [],
  activePath: null,

  setActivePath: (path) => {
    set((state) => {
      const tab = state.openTabs.find((t) => t.path === path);
      if (tab) {
        const setActiveFileTab = useActiveFileTabStore.getState().setActiveFileTab;
        setActiveFileTab(tab.path, tab.content, tab.extension);
      }
      return { activePath: path };
    });
  },

  openFile: (file) =>
    set((state) => {
      const exists = state.openTabs.some((tab) => tab.path === file.path);
      const newTabs = exists ? state.openTabs : [...state.openTabs, file];

      const setActiveFileTab = useActiveFileTabStore.getState().setActiveFileTab;
      setActiveFileTab(file.path, file.content, file.extension);

      return {
        openTabs: newTabs,
        activePath: file.path,
      };
    }),

  closeFile: (path) =>
    set((state) => {
      const remainingTabs = state.openTabs.filter((tab) => tab.path !== path);
      const newActivePath =
        state.activePath === path
          ? remainingTabs[0]?.path || null
          : state.activePath;

      if (state.activePath === path) {
        const nextTab = remainingTabs[0];
        if (nextTab) {
          const setActiveFileTab = useActiveFileTabStore.getState().setActiveFileTab;
          setActiveFileTab(nextTab.path, nextTab.content, nextTab.extension);
        } else {
          useActiveFileTabStore.getState().clearActiveFileTab();
        }
      }

      return {
        openTabs: remainingTabs,
        activePath: newActivePath,
      };
    }),
}));