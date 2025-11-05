import { showToast } from "zmp-sdk/apis";

const API_BASE_URL = 'https://loyalty.bom.asia'; // Changed from localhost to production URL

// Cache for alert messages
let alertMessagesCache = null;

// Get alert messages from API
export const getAlertMessages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/miniApp/quiz/alerts/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the messages
    if (data.success && data.data && data.data.messages) {
      alertMessagesCache = data.data.messages;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching alert messages:', error);
    throw error;
  }
};

// Get cached messages or fetch from API
export const getCachedAlertMessages = async () => {
  if (alertMessagesCache) {
    return alertMessagesCache;
  }
  
  const result = await getAlertMessages();
  return result.success && result.data ? result.data.messages : null;
};

// Show toast with specific message type and key
export const showAlertToast = async (type, key, fallbackMessage) => {
  try {
    const messages = await getCachedAlertMessages();
    
    if (messages && messages[type] && messages[type][key]) {
      await showToast({
        message: messages[type][key],
        type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'
      });
    } else if (fallbackMessage) {
      await showToast({
        message: fallbackMessage,
        type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'
      });
    }
  } catch (error) {
    console.error('Error showing alert toast:', error);
    // Fallback to basic toast
    if (fallbackMessage) {
      await showToast({
        message: fallbackMessage,
        type: 'error'
      });
    }
  }
};

// Show native alert with specific message type and key
export const showAlertMessage = async (type, key, fallbackMessage) => {
  try {
    const messages = await getCachedAlertMessages();
    
    if (messages && messages[type] && messages[type][key]) {
      alert(messages[type][key]);
    } else if (fallbackMessage) {
      alert(fallbackMessage);
    }
  } catch (error) {
    console.error('Error showing alert message:', error);
    // Fallback to basic alert
    if (fallbackMessage) {
      alert(fallbackMessage);
    }
  }
};

// Convenience functions for common alert types
export const showWarningAlert = async (key, fallbackMessage) => {
  return await showAlertMessage('warning', key, fallbackMessage);
};

export const showInfoAlert = async (key, fallbackMessage) => {
  return await showAlertMessage('info', key, fallbackMessage);
};

export const showErrorAlert = async (key, fallbackMessage) => {
  return await showAlertMessage('error', key, fallbackMessage);
};

export const showSuccessToast = async (key, fallbackMessage) => {
  return await showAlertToast('success', key, fallbackMessage);
};
