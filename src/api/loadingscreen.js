import axios from "axios";


const BASE_URL = "https://loyalty.bom.asia";

// Lấy danh sách loading screens
export const getLoadingScreens = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/miniApp/quiz/loading-screens`);
    return response.data;
  } catch (error) {
    throw error;
  }
};



