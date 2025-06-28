import { getProjects } from '@/lib/api/projects';
import {useQuery} from '@tanstack/react-query';

export const useProjects = () => {
  const {isLoading,isError,data:projects,error}=useQuery({
     queryKey: ['projects'],
    queryFn: getProjects

  });
  return {isLoading,isError,projects,error};
};