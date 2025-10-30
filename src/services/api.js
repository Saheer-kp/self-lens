import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

// Create configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("API Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      const authStore = useAuthStore();
      console.log("Token expired, logging out...");
      authStore.logout();
      router.push("/home");
    }
    return Promise.reject(error);
  }
);

export default api;
