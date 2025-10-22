import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../components/auth/Login.vue";
import Home from "@/components/Home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: LoginView,
    },
    {
      path: "/login",
      redirect: "/",
    },
    {
      path: "/auth/google/callback",
      name: "authCallback",
      component: () => import("@/components/auth/GcallBack.vue"),
    },
    {
      path: "/signup",
      name: "signup",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../components/auth/Registration.vue"),
    },
    {
      path: "/home",
      component: Home,
    },
  ],
});

export default router;
