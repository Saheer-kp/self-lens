<template>
  <div class="auth-callback">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p>Completing authentication...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import { API_ENDPOINTS } from "@/config/api";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

onMounted(async () => {
  const code = route.query.code;
  const error = route.query.error;

  if (error) {
    toast.error("Authentication failed: " + error);
    router.push("/login");
    return;
  }

  if (code) {
    try {
      // Exchange code for token
      const response = await fetch(API_ENDPOINTS.AUTH.GLOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        authStore.setAuth(data.token, data.data.user);
        toast.success(`Welcome ${data.data.user.name}!`);

        router.push("/home");
      } else {
        toast.error("Authentication failed");
        router.push("/login");
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      toast.error("Authentication failed");
      router.push("/login");
    }
  }
});
</script>
