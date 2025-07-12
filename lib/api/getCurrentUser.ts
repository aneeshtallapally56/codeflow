import axiosInstance from "../config/axios-config";

 export const getCurrentUser = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const endpoint = `${BASE_URL}/api/v1/auth/me`;
      
      console.log("Making request to:", endpoint);
      console.log("Cookies being sent:", document.cookie);
      
      const res = await axiosInstance.get(endpoint);
      console.log("Current user response:", res.data);

        return res.data.data.user;
    } catch (error: unknown) {
      console.error("Error fetching Current User :", error);
      const axiosError = error as { response?: { status?: number; data?: unknown; headers?: unknown } };
      console.error("Error details:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers
      });
      throw error;
    }
  }