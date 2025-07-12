import axiosInstance from "../config/axios-config";
import { TokenManager } from "../utils/auth";

export const logout = async ()=>{
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const endpoint = `${BASE_URL}/api/v1/auth/logout`;
         await axiosInstance.post(endpoint);

        // Clear tokens on logout
        TokenManager.clearTokens();

    } catch (error) {
        console.error("Error logging out :", error);
        // Clear tokens even if logout request fails
        TokenManager.clearTokens();
        throw error;
    }
}