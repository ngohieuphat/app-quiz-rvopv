const API_BASE_URL = 'https://loyalty.bom.asia/api/miniApp/quiz/steps';

// Complete quiz step
export const completeQuizStep = async (userId, stepData, pointsEarned) => {
  try {
    const requestBody = {
      stepOrder: 1,
      stepData: {
        quizId: stepData.quizId,
        score: stepData.score,
        timeSpent: stepData.timeSpent
      }
    };

    // Add pointsEarned if provided
    if (pointsEarned !== undefined && pointsEarned !== null) {
      requestBody.pointsEarned = pointsEarned;
    }

    const response = await fetch(`${API_BASE_URL}/${userId}/steps/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing quiz step:', error);
    throw error;
  }
};

// Complete pharmacy info step
export const completePharmacyStep = async (userId, stepData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/steps/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stepOrder: 2,
        stepData: stepData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing pharmacy step:', error);
    throw error;
  }
};

// Complete follow OA step
export const completeFollowOAStep = async (userId, stepData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/steps/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stepOrder: 3,
        stepData: {
          followedOA: stepData.followedOA
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing follow OA step:', error);
    throw error;
  }
};

// Generic function to complete any step
export const completeStep = async (userId, stepOrder, stepData, pointsEarned) => {
  try {
    const requestBody = {
      stepOrder: stepOrder,
      stepData: stepData
    };

    // Add pointsEarned if provided
    if (pointsEarned !== undefined && pointsEarned !== null) {
      requestBody.pointsEarned = pointsEarned;
    }

    const response = await fetch(`${API_BASE_URL}/${userId}/steps/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error completing step ${stepOrder}:`, error);
    throw error;
  }
};
