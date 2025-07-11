import axiosInstance from "../config/axios-config";
export const generateResponse = async ({ prompt, code }: { prompt: string; code: string })=>{
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const endpoint = `${BASE_URL}/api/v1/ai/generate`;
        const res = await axiosInstance.post(endpoint,{ prompt, code });
        console.log("AI response generated:", res.data);
        return res.data.content;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error generating AI response: " + error.message);
        } else {
            throw new Error("Error generating AI response: " + String(error));
        }
        
    }
}

export const fixCode = async (code: string) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = `${BASE_URL}/api/v1/ai/fix`;
    const res = await axiosInstance.post(endpoint, { code });
    console.log("AI code fixed:", res.data);
    return res.data.content;
  } catch (error) {
     if (error instanceof Error) {
            throw new Error("Error fixing code: " + error.message);
        } else {
            throw new Error("Error fixing code: " + String(error));
        }
  }
}