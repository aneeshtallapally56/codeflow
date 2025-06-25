import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { getProjectTree } from '@/lib/api/projects';

type TreeStructureStore = {
  treeStructure: any;
  projectId: string | null;
  setProjectId: (projectId: string) => void;
  setTreeStructure: () => Promise<void>;
};

const queryClient = new QueryClient();

export const useTreeStructureStore = create<TreeStructureStore>((set,get) => ({
  treeStructure: null,
  projectId: null,
  setTreeStructure: async () => {
    const projectId = get().projectId;
     if (!projectId) return; 
    const data = await queryClient.fetchQuery({
      queryKey: ['project-tree', projectId],
      queryFn: () => getProjectTree({ projectId }),
    });

    console.log('Tree Structure:', data);
    set({ treeStructure: data });
  },
  setProjectId: (projectId: string) => {
    set({ projectId });
  },
}));