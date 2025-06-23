import { createProject } from "@/lib/api/projects"; 
import { useMutation } from "@tanstack/react-query";

export const useCreateProject = () => {
    const {mutateAsync, isPending , isSuccess} = useMutation({
        mutationFn: createProject,
        onSuccess: (data) => {
            console.log("Project created successfully:", data);
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