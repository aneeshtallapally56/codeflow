import { createProject } from "@/lib/api/projects"; 
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useCreateProject = () => {
     const queryClient = useQueryClient();
    const {mutateAsync, isPending , isSuccess} = useMutation({
        mutationFn: createProject,
       onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
        onError: (error) => {
            console.error("Error creating project:", error);
        }

    })
    return {
        createProjectMutation: mutateAsync,
        isPending,
        isSuccess
    }
};