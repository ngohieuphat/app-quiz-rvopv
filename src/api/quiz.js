import axios from "axios";

const BASE_URL = "https://loyalty.bom.asia";

// Lấy danh sách quiz templates
export const getQuizTemplates = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/miniApp/quiz/templates/active`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết quiz template theo ID
export const getQuizTemplateById = async (templateId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/miniApp/quiz/templates/${templateId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};





// Hoàn thành quiz session
export const completeQuizSession = async (sessionId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/miniApp/quiz/sessions/${sessionId}/complete`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy kết quả quiz session
export const getQuizResult = async (sessionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/miniApp/quiz/sessions/${sessionId}/result`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit quiz submission
export const submitQuizSubmission = async (submissionData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/miniApp/quiz/submissions/submit`, submissionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};