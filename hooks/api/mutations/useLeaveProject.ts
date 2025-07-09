import { leaveProject } from "@/lib/api/projects"; 
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useLeaveProject = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationKey: ['leaveProject'],
    mutationFn: (projectId: string) => leaveProject(projectId), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error leaving project:", error);
    }
  });

  return {
    leaveProjectMutation: mutateAsync,
    isPending,
    isSuccess,
    error,
  };
};