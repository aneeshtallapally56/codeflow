import { joinProject } from "@/lib/api/projects"; 
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useJoinProject = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationKey: ['joinProject'],
    mutationFn: (projectId: string) => joinProject(projectId), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error joining project:", error);
    }
  });

  return {
    joinProjectMutation: mutateAsync,
    isPending,
    isSuccess,
    error,
  };
};