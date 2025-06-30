import { getCurrentUser } from '@/lib/api/getCurrentUser';
import {useQuery} from '@tanstack/react-query';

export const useGetUser = () => {
  const {isLoading,isError,data:projects,error}=useQuery({
     queryKey: ['current-user'],
    queryFn: getCurrentUser

  });
  return {isLoading,isError,projects,error};
};