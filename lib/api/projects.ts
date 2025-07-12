import axiosInstance from '../config/axios-config';
type CreateProjectPayload = {
  title: string; 
  type:string       
};
type GetProjectTreePayload = {
  projectId: string;
};

export const createProject = async (payload: CreateProjectPayload) => {
try {
      const res = await axiosInstance.post('api/v1/projects/create-project',payload);

      return res.data;
} catch (error) {
      console.error('Error creating project:', error);
      throw error;
    
}
};

export const getProjectTree = async ({ projectId }: GetProjectTreePayload) => {
try {
      const res = await axiosInstance.get(`api/v1/projects/${projectId}/tree`);

      return res.data?.tree;
} catch (error) {
      console.error('Error creating project:', error);
      throw error;
    
}
};

 export const deleteProject = async (projectId: string) => {
   try {const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = `${BASE_URL}/api/v1/projects/${projectId}`;

 await axiosInstance.delete(endpoint);
}
      
     catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  export const getProjects = async()=>{
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const endpoint = `${BASE_URL}/api/v1/projects`;
        const res = await axiosInstance.get(endpoint);

        return res.data.projects;
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
  }

  export const getProjectById = async (projectId: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const endpoint = `${BASE_URL}/api/v1/project/${projectId}`;
      const res = await axiosInstance.get(endpoint);

      return res.data.project;
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      throw error;
    }
  }

  export const joinProject = async (projectId: string) => {
  try {
     const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
       const endpoint = `${BASE_URL}/api/v1/projects/join`;
         await axiosInstance.post(endpoint, { projectId });


  } catch (error) {
      console.error("Error fetching project by ID:", error);
      throw error;
  }

};
export const leaveProject = async (projectId: string) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = `${BASE_URL}/api/v1/projects/leave`;
    await axiosInstance.post(endpoint, { projectId });

  } catch (error) {
    console.error("Error leaving project:", error);
    throw error;
  }
}