import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";

export type FileTab = {
  path: string;
  name: string;
  content: string;
  extension: string;
};

type EditorTabStore = {
  openTabs: FileTab[];
  activePath: string | null;
  setActivePath: (path: string) => void;
  openFile: (file: FileTab) => void;
  closeFile: (path: string) => void;
};

export const useEditorTabStore = create<EditorTabStore>((set, get) => ({
  openTabs: [],
  activePath: null,

  setActivePath: (path) => {
    const tab = get().openTabs.find((t) => t.path === path);
    if (tab) {
      useActiveFileTabStore.getState().setActiveFileTab({
        path: tab.path,
        value: tab.content,
        extension: tab.extension,
      });
      set({ activePath: path });
    }
  },

  openFile: (file) => {
    const exists = get().openTabs.some((tab) => tab.path === file.path);
    const updatedTabs = exists ? get().openTabs : [...get().openTabs, file];

    useActiveFileTabStore.getState().setActiveFileTab({
      path: file.path,
      value: file.content,
      extension: file.extension,
    });

    set({
      openTabs: updatedTabs,
      activePath: file.path,
    });
  },

  closeFile: (path) => {
    const { openTabs, activePath } = get();
    const remainingTabs = openTabs.filter((tab) => tab.path !== path);
    const newActive =
      activePath === path
        ? remainingTabs[0] ?? null
        : openTabs.find((t) => t.path === activePath) ?? null;

    if (activePath === path) {
      if (newActive) {
        useActiveFileTabStore.getState().setActiveFileTab({
          path: newActive.path,
          value: newActive.content,
          extension: newActive.extension,
        });
      } else {
        useActiveFileTabStore.getState().clearActiveFileTab();
      }
    }

    set({
      openTabs: remainingTabs,
      activePath: newActive?.path || null,
    });
  },
}));