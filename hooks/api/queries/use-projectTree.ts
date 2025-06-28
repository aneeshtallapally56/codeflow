import { getProjectTree } from '@/lib/api/projects';
import {useQuery} from '@tanstack/react-query';



export const useProjectTree = (projectId:string) => {
  const {isLoading,isError,data:projectTree,error}=useQuery({
     queryKey: ['project-tree', projectId],
    queryFn: ()=>getProjectTree({projectId}),
     enabled: !!projectId,
  });
  return {isLoading,isError,projectTree,error};
};