import axiosInstance from "../config/axios-config";

 export const getCurrentUser = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const endpoint = `${BASE_URL}/api/v1/auth/me`;
      const res = await axiosInstance.get(endpoint);
      console.log("Current User is fetched:", res.data);
        return res.data.data.user;
    } catch (error) {
      console.error("Error fetching Current User :", error);
      throw error;
    }
  }