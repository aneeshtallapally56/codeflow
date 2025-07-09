import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/lib/store/userStore';
import { logout } from '@/lib/api/logout'; 


export const useLogout = () => {
  const { clearUser } = useUserStore();


  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: logout, 
    onSuccess: () => {
      clearUser();
      

    },
    onError: (error) => {
      console.error("Logout failed:", error);
    }
  });

  return {
    logoutMutation: mutateAsync,
    isPending,
    isSuccess,
  };
};