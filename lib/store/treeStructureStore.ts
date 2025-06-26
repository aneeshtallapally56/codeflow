import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { getProjectTree } from '@/lib/api/projects';
import { useEditorSocketStore } from "@/lib/store/editorSocketStore";

type TreeNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
};

type TreeStructureStore = {
  treeStructure: TreeNode | null;
  projectId: string | null;
  setProjectId: (projectId: string) => void;
  setTreeStructure: () => Promise<void>;
   joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;

};

const queryClient = new QueryClient();

export const useTreeStructureStore = create<TreeStructureStore>((set, get) => ({
  treeStructure: null,
  projectId: null,

  setProjectId: (projectId: string) => {
    set({ projectId });
  },

  setTreeStructure: async () => {
    const projectId = get().projectId;
    if (!projectId) return;

    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['project-tree', projectId],
        queryFn: () => getProjectTree({ projectId }),
      });

      console.log(' Tree Structure fetched:', data);

      // Optional: Validate or fix missing 'type' fields
      set({ treeStructure: data });
    } catch (error) {
      console.error('❌Failed to fetch tree structure:', error);
    }
  },
  joinProjectRoom: (projectId) => {
  const { editorSocket } = useEditorSocketStore.getState();
  if (editorSocket?.connected) {
    console.log("📨 Emitting joinProjectRoom:", projectId);
    editorSocket.emit("joinProjectRoom", { projectId });
  }
},

leaveProjectRoom: (projectId) => {
  const editorSocket = useEditorSocketStore.getState().editorSocket; // ✅ get from correct store
  if (editorSocket && projectId) {
    console.log(`❌ Leaving file room: ${projectId}`);
    editorSocket.emit("leaveFileRoom", { projectId });
  }
},
}));