// composables/useAuth.js
import { inject } from "vue";

export const useAuth = () => {
  const authStore = inject("authStore");

  if (!authStore) {
    console.log("Auth store not provided. Make sure to provide it in App.vue");
  }

  return authStore;
};
