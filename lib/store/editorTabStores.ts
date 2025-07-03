import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { useEditorSocketStore } from "./editorSocketStore";
import { useFileLockStore } from "./fileLockStore";
import { useUserStore } from "./userStore";


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
  updateFileContent: (path: string, content: string) => void;
};

let debounceTimeout: NodeJS.Timeout | null = null;
const projectId = useTreeStructureStore.getState().projectId;
const extractProjectId = (fullPath: string) => {
  const segments = fullPath.split('/');
  const index = segments.indexOf('generated-projects');
  return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
};

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
  updateFileContent: (path, content) => {
    const { openTabs } = get();
    const updatedTabs = openTabs.map(tab => 
      tab.path === path ? { ...tab, content } : tab
    );
    
    set({ openTabs: updatedTabs });
    
    // Update active file tab if this is the active file
    const activeTab = useActiveFileTabStore.getState().activeFileTab;
    if (activeTab && activeTab.path === path) {
      useActiveFileTabStore.getState().setActiveFileTab({
        ...activeTab,
        value: content
      });
    }
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

    // Handle file unlock before leaving room
    const userId = useUserStore.getState().userId;
    const fileLockStore = useFileLockStore.getState();
    const editorSocketStore = useEditorSocketStore.getState();
    
    if (isClosingActive && fileLockStore.lockedByUser(path, userId)) {
      console.log("🔓 Unlocking file on close:", path);
      const fileProjectId = extractProjectId(path);
      editorSocketStore.emitSocketEvent('unlockFile', { 
        projectId: fileProjectId, 
        filePath: path 
      });
    }

    // Immediate leave on close (no debounce)
    if (isClosingActive) {
      useEditorSocketStore.getState().emitLeaveFileRoom(projectId, path);
    }

    // Handle switching to new active tab
    if (isClosingActive && newActive) {
      useActiveFileTabStore.getState().setActiveFileTab({
        path: newActive.path,
        value: newActive.content,
        extension: newActive.extension,
      });

      useEditorSocketStore.getState().emitJoinFileRoom(projectId, newActive.path);
    }

    // Only clear active file tab if no remaining tabs
    if (isClosingActive && !newActive) {
      useActiveFileTabStore.getState().clearActiveFileTab();
    }

    set({
      openTabs: remainingTabs,
      activePath: newActive?.path || null,
    });
  },
}));