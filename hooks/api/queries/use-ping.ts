import {useQuery} from '@tanstack/react-query';
import {pingApi} from '@/lib/api/ping';

export const usePing = () => {
  const {isLoading,isError,data,error}=useQuery({
    queryKey: ['ping'],
    queryFn: pingApi,
    staleTime:10000,

  });
  return {isLoading,isError,data,error};
};