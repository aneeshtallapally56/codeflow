import { create } from 'zustand';
import { Socket } from 'socket.io-client';

type EditorSocketState = {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
};

export const useEditorSocketStore = create<EditorSocketState>((set) => ({
  editorSocket: null,
  setEditorSocket: (incomingSocket) => {
    set({ editorSocket: incomingSocket });
  },
}));