import { deleteProject } from "@/lib/api/projects"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteProject = () => {
      const queryClient = useQueryClient();
    const {mutateAsync, isPending , isSuccess} = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (error) => {
            console.error("Error deleting project", error);
        }

    })
    return {
        deleteProjectMutation: mutateAsync,
        isPending,
        isSuccess
    }
};