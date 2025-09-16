import axios from "axios";

const BASE_URL = "https://loyalty.bom.asia";

export const createUser = async (userData) => {
    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/create`,
      data: userData,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Get user by userId
export const getUserById = async (userId) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/${userId}`,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Check if user exists
export const checkUserExists = async (userId) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/check`,
      params: {
        userId: userId,
      },
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Update user address
export const updateUserAddress = async (userId, addressData) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/${userId}/address`,
      data: addressData,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Update user pharmacy
export const updateUserPharmacy = async (userId, pharmacyData) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/${userId}/pharmacy`,
      data: pharmacyData,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };
  
  
  