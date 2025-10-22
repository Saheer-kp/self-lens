const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const HEADERS = {
  "Content-Type": "application/json",
};

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/users/signup`,
    LOGIN: `${API_BASE_URL}/users/login`,
    LOGOUT: `${API_BASE_URL}/users/logout`,
    GLOGIN: `${API_BASE_URL}/users/g-login`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users/update`,
  },
  IMAGE: {
    UPLOAD: `${API_BASE_URL}/images/image-upload`,
    LIST: `${API_BASE_URL}/images`,
    LIKE_UNLIKE: (imageId) => `${API_BASE_URL}/images/${imageId}/likeUnlike`,
  },
};

export const API_URL = import.meta.env.VITE_API_URL;
