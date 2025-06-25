import axiosInstance from '../config/axios-config';
type CreateProjectPayload = {
  name: string;        
};
type GetProjectTreePayload = {
  projectId: string;
};

export const createProject = async (payload: CreateProjectPayload) => {
try {
      const res = await axiosInstance.post('api/v1/projects/create-project',payload);
      console.log(res.data);
      return res.data;
} catch (error) {
      console.error('Error creating project:', error);
      throw error;
    
}
};

export const getProjectTree = async ({ projectId }: GetProjectTreePayload) => {
try {
      const res = await axiosInstance.get(`api/v1/projects/${projectId}/tree`);
      console.log(res.data);
      return res.data?.tree;
} catch (error) {
      console.error('Error creating project:', error);
      throw error;
    
}
};