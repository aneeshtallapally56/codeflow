import { create } from "zustand";
import { useActiveFileTabStore } from "./activeFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { useEditorSocketStore } from "./editorSocketStore";
import { useFileRoomMembersStore } from "./fileRoomMemberStore";
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

const extractProjectId = (fullPath: string) => {
  const segments = fullPath.split('/');
  const index = segments.indexOf('generated-projects');
  return index !== -1 && segments[index + 1] ? segments[index + 1] : '';
};

export const useEditorTabStore = create<EditorTabStore>((set, get) => ({
  openTabs: [],
  activePath: null,

  setActivePath: (path) => {
    const { openTabs, activePath } = get();
    if (path === activePath) return;

    const newTab = openTabs.find(tab => tab.path === path);
    const prevTab = openTabs.find(tab => tab.path === activePath);
    const projectId = useTreeStructureStore.getState().projectId;
    const editorSocket = useEditorSocketStore.getState();

    if (!projectId || !newTab) return;

    if (prevTab?.path) {
      editorSocket.emitLeaveFileRoom(projectId, prevTab.path);
    }

    editorSocket.emitJoinFileRoom(projectId, newTab.path);

    useActiveFileTabStore.getState().setActiveFileTab({
      path: newTab.path,
      value: newTab.content,
      extension: newTab.extension,
    });

    set({ activePath: path });
  },

  openFile: (file) => {
    const { openTabs } = get();
      const projectId = useTreeStructureStore.getState().projectId;
  const editorSocket = useEditorSocketStore.getState();
    const exists = openTabs.some(tab => tab.path === file.path);
    const updatedTabs = exists ? openTabs : [...openTabs, file];

    useActiveFileTabStore.getState().setActiveFileTab({
      path: file.path,
      value: file.content,
      extension: file.extension,
    });

    set({
      openTabs: updatedTabs,
      activePath: file.path,
    });
      if (projectId) {
    editorSocket.emitJoinFileRoom(projectId, file.path);
  }
  },

  updateFileContent: (path, content) => {
    const { openTabs } = get();
    const updatedTabs = openTabs.map(tab =>
      tab.path === path ? { ...tab, content } : tab
    );

    set({ openTabs: updatedTabs });

    const activeTab = useActiveFileTabStore.getState().activeFileTab;
    if (activeTab?.path === path) {
      useActiveFileTabStore.getState().setActiveFileTab({
        ...activeTab,
        value: content,
      });
    }
  },

  closeFile: (path) => {
    const { openTabs, activePath } = get();
    const remainingTabs = openTabs.filter(tab => tab.path !== path);
    const projectId = useTreeStructureStore.getState().projectId;
    const editorSocket = useEditorSocketStore.getState();

    if (!projectId) return;

    //Remoce the file lock if it exists
    const lockedBy = useFileLockStore.getState().lockedBy[path];
const userId = useUserStore.getState().userId;

if (lockedBy === userId) {
  editorSocket.emitSocketEvent("releaseLock", {
    filePath: path,
    projectId,
  });
}
    // Always leave file room
    editorSocket.emitLeaveFileRoom(projectId, path);

    if (activePath === path) {
      // If there's another tab, switch to it
      const next = remainingTabs[0];
      if (next) {
        useActiveFileTabStore.getState().setActiveFileTab({
          path: next.path,
          value: next.content,
          extension: next.extension,
        });

        editorSocket.emitJoinFileRoom(projectId, next.path);
        set({ activePath: next.path });
      } else {
        useActiveFileTabStore.getState().clearActiveFileTab();
        useFileRoomMembersStore.getState().clearFileRoomUsers();
        set({ activePath: null });
      }
    }

    set({ openTabs: remainingTabs });
  },
}));