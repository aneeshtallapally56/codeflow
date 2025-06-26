import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { useActiveFileTabStore } from './activeFileTabStore';
import path from 'path';

type EditorSocketState = {
  editorSocket: Socket | null;
  setEditorSocket: (incomingSocket: Socket) => void;
};

export const useEditorSocketStore = create<EditorSocketState>((set) => ({
  
  editorSocket: null,
  setEditorSocket: (incomingSocket) => {
    const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
    // Listen for the 'readFileSuccess' event from the incoming socket
    incomingSocket?.on('readFileSuccess', (data) => {
    console.log('readFileSuccess event received',data);
    activeFileTabSetter(data.path,data.value , data.extension);
  });
  //listen for the 'writeFileSuccess' event from the incoming socket
  incomingSocket?.on('writeFileSuccess', (data) => {
    console.log('writeFileSuccess event received', data);
   incomingSocket?.emit('readFile',{
      pathToFileOrFolder: data.path,
    })});
   
    set({ editorSocket: incomingSocket });
  },
}));