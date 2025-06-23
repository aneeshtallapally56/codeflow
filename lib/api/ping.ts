import axiosInstance from '../config/axios-config';

export const pingApi = async () => {
try {
      const res = await axiosInstance.get('api/v1/pingcheck');
      console.log(res.data);
      return res.data;
} catch (error) {
      console.error('Error pinging API:', error);
      throw error;
    
}
};
