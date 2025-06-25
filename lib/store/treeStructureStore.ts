import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { getProjectTree } from '@/lib/api/projects';

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
}));