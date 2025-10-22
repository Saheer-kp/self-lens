import { defineStore } from "pinia";
import { ref } from "vue";

export const userStore = defineStore("user", () => {
  const user = ref(null);

  // Set user data
  const setUser = (userData) => {
    user.value = userData;
  };

  // Clear user data (logout)
  const clearUser = () => {
    user.value = null;
  };

  // Get user initial
  const getUserInitial = (userName = null) => {
    const name = userName || user.value?.name;
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  // Get user color (consistent based on name)
  const getUserColor = (userName = null) => {
    const name = userName || user.value?.name;
    if (!name) return "#667eea";

    const colors = [
      "#667eea",
      "#764ba2",
      "#f093fb",
      "#f5576c",
      "#4facfe",
      "#00f2fe",
      "#43e97b",
      "#38f9d7",
      "#fa709a",
      "#fee140",
      "#a8edea",
      "#fed6e3",
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return {
    user,
    setUser,
    clearUser,
    getUserInitial,
    getUserColor,
  };
});
