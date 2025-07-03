// store/editorSocketStore.ts
import { create } from 'zustand';
import { Socket } from 'socket.io-client';

type EditorSocketState = {
  editorSocket: Socket | null;

  // Init + connection
  setEditorSocket: (incomingSocket: Socket) => void;

  // File-level rooms
  emitJoinFileRoom: (projectId: string, path: string) => void;
  emitLeaveFileRoom: (projectId: string, path: string) => void;

  // Project-level rooms
  emitJoinProjectRoom: (projectId: string) => void;
  emitLeaveProjectRoom: (projectId: string) => void;

  // Future: generic emitter
  emitSocketEvent: (event: string, payload: any) => void;
};

export const useEditorSocketStore = create<EditorSocketState>((set, get) => ({
  editorSocket: null,

  setEditorSocket: (incomingSocket: Socket) => {
    set({ editorSocket: incomingSocket });
  },

  emitJoinFileRoom: (projectId, path) => {
    get().editorSocket?.emit("joinFileRoom", { projectId, filePath: path });
  },

  emitLeaveFileRoom: (projectId, path) => {
    get().editorSocket?.emit("leaveFileRoom", { projectId, filePath: path });
  },

  emitJoinProjectRoom: (projectId) => {
    get().editorSocket?.emit("joinProjectRoom", { projectId });
  },

  emitLeaveProjectRoom: (projectId) => {
    get().editorSocket?.emit("leaveProjectRoom", { projectId });
  },

  emitSocketEvent: (event, payload) => {
    get().editorSocket?.emit(event, payload);
  },
}));