import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { useEditorSocketStore } from "./editorSocketStore";

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

let debounceTimeout: NodeJS.Timeout | null = null;

export const useEditorTabStore = create<EditorTabStore>((set, get) => ({
  openTabs: [],
  activePath: null,

  setActivePath: (newPath) => {
  const { activePath, openTabs } = get();
  if (newPath === activePath) return;

  const newTab = openTabs.find((t) => t.path === newPath);
  const prevTab = openTabs.find((t) => t.path === activePath);
  const projectId = useTreeStructureStore.getState().projectId;

  if (!projectId) {
    console.error("❌ No project ID found in store");
    return;
  }

  const leavePath = prevTab?.path;
  const joinPath = newTab?.path;

  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (leavePath) {
      useEditorSocketStore.getState().emitLeaveFileRoom(projectId, leavePath);
      console.log("⬅️ [debounced] Leaving file room:", leavePath);
    }
    if (joinPath) {
      useEditorSocketStore.getState().emitJoinFileRoom(projectId, joinPath);
      console.log("➡️ [debounced] Joining file room:", joinPath);
    }
  }, 200);

  if (newTab) {
    useActiveFileTabStore.getState().setActiveFileTab({
      path: newTab.path,
      value: newTab.content,
      extension: newTab.extension,
    });
  }

  console.log("🔄 Switching to:", newPath);
  console.log("⬅️ Leaving:", prevTab?.path);
  console.log("➡️ Joining:", newTab?.path);

  set({ activePath: newPath });
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
    const isClosingActive = activePath === path;
    const newActive = isClosingActive
      ? remainingTabs[0] ?? null
      : openTabs.find((t) => t.path === activePath) ?? null;
console.log("❌ Closing tab:", path);
console.log("⬅️ Leaving (on close):", path);
console.log("➡️ Switching to (on close):", newActive?.path);
    const projectId = useTreeStructureStore.getState().projectId;
    if (!projectId) {
      console.error("❌ No project ID found in store");
      return;
    }

    // Immediate leave on close (no debounce)
    if (isClosingActive) {
      useEditorSocketStore.getState().emitLeaveFileRoom(projectId, path);
    }

    if (isClosingActive && newActive) {
      useActiveFileTabStore.getState().setActiveFileTab({
        path: newActive.path,
        value: newActive.content,
        extension: newActive.extension,
      });

      useEditorSocketStore.getState().emitJoinFileRoom(projectId, newActive.path);
    }

    if (isClosingActive && !newActive) {
      useActiveFileTabStore.getState().clearActiveFileTab();
    }

    set({
      openTabs: remainingTabs,
      activePath: newActive?.path || null,
    });
  },
}));