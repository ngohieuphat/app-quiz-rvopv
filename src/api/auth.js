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

// Get user gifts
export const getUserGifts = async (userId) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/${userId}/gifts`,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Create user gift
export const createUserGift = async (userId, giftData) => {
    if (!userId) {
      return null;
    }
  
    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/users/${userId}/gifts`,
      data: giftData,
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Check quiz attempt
export const checkAttempt = async (userId, quizId) => {
    if (!userId || !quizId) {
      return null;
    }
  
    const requestConfig = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
      url: `/api/miniApp/quiz/submissions/check-attempt`,
      params: {
        userId: userId,
        quizId: quizId,
      },
    };
  
    try {
      const result = await axios(requestConfig);
      return result.data;
    } catch (error) {
      throw error;
    }
  };

// Test message token
export const testMessageToken = async (messageToken, userId) => {
    if (!messageToken || !userId) {
      return null;
    }
  
    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      baseURL:BASE_URL,
      url: `/api/test/test-message-token`,
      data: {
        messageToken: messageToken,
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

// Get dynamic form config
export const getDynamicFormConfig = async () => {
  const requestConfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: BASE_URL,
    url: `/api/miniApp/quiz/dynamic-form/form-config`,
  };

  try {
    const result = await axios(requestConfig);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Get user form data
export const getUserFormData = async (userId) => {
  if (!userId) {
    return null;
  }

  const requestConfig = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: BASE_URL,
    url: `/api/miniApp/quiz/dynamic-form/users/${userId}/form-data`,
  };

  try {
    const result = await axios(requestConfig);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Submit dynamic form
export const submitDynamicForm = async (userId, formData) => {
  if (!userId || !formData) {
    return null;
  }

  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: BASE_URL,
    url: `/api/miniApp/quiz/dynamic-form/users/${userId}/submit-form`,
    data: formData,
  };

  try {
    const result = await axios(requestConfig);
    return result.data;
  } catch (error) {
    throw error;
  }
  };

// Get Vietnamese provinces using bom.asia API
// API: https://bom.asia/api/locations/provinces
export const getVietnameseProvinces = async () => {
  try {
    const response = await axios.get("https://bom.asia/api/locations/provinces", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      timeout: 10000,
    });
    
    // Transform bom.asia format to expected format
    // bom.asia: { success: true, data: [{ code, name, name_en, full_name, code_name }] }
    // Expected: [{ code, name, codename, ... }]
    if (response.data && response.data.success && response.data.data) {
      return response.data.data.map(province => ({
        code: province.code,
        name: province.name,
        codename: province.code_name || province.name.toLowerCase().replace(/\s+/g, '_'),
        full_name: province.full_name,
        name_en: province.name_en,
        // Districts will be loaded separately when needed
        districts: []
      }));
    }
    
    return response.data?.data || [];
  } catch (error) {
    console.error("Error loading provinces from bom.asia:", error);
    throw error;
  }
};

// Get districts/wards by province_code using bom.asia API
// API: https://bom.asia/api/locations/provinces/{province_code}/wards
// Note: bom.asia API returns wards directly from province (no districts level)
export const getDistrictsByProvinceId = async (provinceCode) => {
  try {
    const response = await axios.get(`https://bom.asia/api/locations/provinces/${provinceCode}/wards`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      timeout: 10000,
    });
    
    // Transform bom.asia format to expected format
    // bom.asia: { success: true, data: [{ code, name, name_en, full_name, code_name, province_code }] }
    // Expected: [{ code, name, codename, ... }]
    if (response.data && response.data.success && response.data.data) {
      return response.data.data.map(ward => ({
        code: ward.code,
        name: ward.name,
        codename: ward.code_name || ward.name.toLowerCase().replace(/\s+/g, '_'),
        full_name: ward.full_name,
        name_en: ward.name_en,
        province_code: ward.province_code,
      }));
    }
    
    return response.data?.data || [];
  } catch (error) {
    console.error("Error loading wards from bom.asia:", error);
    throw error;
  }
};
  
  
  