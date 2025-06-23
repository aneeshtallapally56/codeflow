import axiosInstance from '../config/axios-config';
type CreateProjectPayload = {
  name: string;        
};
export const createProject = async (payload: CreateProjectPayload) => {
try {
      const res = await axiosInstance.post('api/v1/projects');
      console.log(res.data);
      return res.data;
} catch (error) {
      console.error('Error creating project:', error);
      throw error;
    
}
};
