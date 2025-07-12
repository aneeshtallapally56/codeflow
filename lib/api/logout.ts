import axiosInstance from "../config/axios-config";
export const logout = async ()=>{
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const endpoint = `${BASE_URL}/api/v1/auth/logout`;
         await axiosInstance.post(endpoint);

        

    } catch (error) {
        console.error("Error logging out :", error);
      throw error;
    }
}