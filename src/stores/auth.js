// stores/auth.js (Pinia example)
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("auth_token") || null,
    user: JSON.parse(localStorage.getItem("user_data")) || null,
    isAuthenticated: !!localStorage.getItem("auth_token"),
  }),

  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;

      // Store in localStorage for persistence
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    },
  },
});
