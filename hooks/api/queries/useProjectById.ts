import { getProjectById } from '@/lib/api/projects';
import {useQuery} from '@tanstack/react-query';

export const useProjectById = (projectId: string) => {
  const {
    isLoading,
    isError,
    data: project,
    error,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: ()=> {
         if (!projectId) throw new Error("Project ID is missing");
        return getProjectById(projectId)},
    enabled: !!projectId,
    retry: false,
  });

  return { isLoading, isError, project, error };
};
