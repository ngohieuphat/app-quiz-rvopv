import axios from "axios";

const BASE_URL = "https://loyalty.bom.asia";

// Trigger topup for user after completing quiz
export const triggerTopup = async (userId, quizId) => {
  if (!userId || !quizId) {
    throw new Error("userId and quizId are required");
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/miniApp/quiz/steps/trigger-topup`,
      {
        userId: userId,
        quizId: quizId
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

