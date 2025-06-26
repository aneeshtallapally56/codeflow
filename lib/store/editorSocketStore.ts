import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { useActiveFileTabStore } from './activeFileTabStore';

type EditorSocketState = {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
  joinFileRoom: (projectId: string, pathToFileOrFolder: string) => void;
  leaveFileRoom: (projectId: string, pathToFileOrFolder: string) => void;
};

export const useEditorSocketStore = create<EditorSocketState>((set, get) => ({
  editorSocket: null,

  setEditorSocket: (incomingSocket) => {
    const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;

    incomingSocket?.on('readFileSuccess', (data) => {
      console.log('✅ readFileSuccess event received:', data);
      activeFileTabSetter(data.path, data.value, data.extension);
    });

    incomingSocket?.on('writeFileSuccess', (data) => {
      console.log('✅ writeFileSuccess event received:', data);
      incomingSocket.emit('readFile', {
        pathToFileOrFolder: data.path,
      });
    });

    set({ editorSocket: incomingSocket });
  },

  joinFileRoom: (projectId, pathToFileOrFolder) => {
    const { editorSocket } = get();
    if (editorSocket && projectId && pathToFileOrFolder) {
      console.log(`🔗 Joining file room: ${projectId}:${pathToFileOrFolder}`);
      editorSocket.emit('joinFileRoom', { projectId, pathToFileOrFolder });
    }
  },

  leaveFileRoom: (projectId, pathToFileOrFolder) => {
    const { editorSocket } = get();
    if (editorSocket && projectId && pathToFileOrFolder) {
      console.log(`❌ Leaving file room: ${projectId}:${pathToFileOrFolder}`);
      editorSocket.emit('leaveFileRoom', { projectId, pathToFileOrFolder });
    }
  },
}));