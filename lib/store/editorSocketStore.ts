import { create } from 'zustand';
import { Socket } from 'socket.io-client';

type EditorSocketState = {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
  joinFileRoom: (projectId: string, pathToFileOrFolder: string) => void;
  leaveFileRoom: (projectId: string, pathToFileOrFolder: string) => void;
};

export const useEditorSocketStore = create<EditorSocketState>((set, get) => ({
  editorSocket: null,

  setEditorSocket: (incomingSocket) => {
    set({ editorSocket: incomingSocket });
  },

  joinFileRoom: (projectId, pathToFileOrFolder) => {
    get().editorSocket?.emit("joinFileRoom", { projectId, pathToFileOrFolder });
  },

  leaveFileRoom: (projectId, pathToFileOrFolder) => {
    get().editorSocket?.emit("leaveFileRoom", { projectId, pathToFileOrFolder });
  },
}));