<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "@fortawesome/fontawesome-free/css/all.min.css";
import { RouterLink, RouterView } from "vue-router";
import { provide } from "vue";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
provide("authStore", auth);
</script>

<template>
  <RouterView />
</template>

<style>
.brand {
  font-size: 33px;
  color: #3a0ca3;
  font-weight: bold;
}
</style>
