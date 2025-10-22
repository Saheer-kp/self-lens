<template>
  <button
    type="submit"
    class="btn btn-outline-primary w-100"
    @click="googleLogin"
    :disabled="socialLoading"
  >
    Google
  </button>
</template>

<script setup>
import { ref } from "vue";

const socialLoading = ref(false);
// Google Auth Configuration
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const googleLogin = () => {
  socialLoading.value = true;

  const redirectUri = `${window.location.origin}/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const params = {
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "consent",
  };

  Object.keys(params).forEach((key) =>
    authUrl.searchParams.append(key, params[key])
  );

  console.log("Redirecting to:", authUrl.toString());
  window.location.href = authUrl.toString();
};
</script>
