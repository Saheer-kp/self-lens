<template>
  <div class="login-section">
    <div class="login-container">
      <div class="row g-0">
        <!-- Login Form Section -->
        <div class="col-lg-6">
          <div class="login-form">
            <div class="brand">
              <h1><i class="fas fa-rocket me-2"></i>SelfLens</h1>
              <p>Welcome back! Please sign in to your account.</p>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <div class="input-group">
                  <span class="input-group-text"
                    ><i class="fas fa-user"></i
                  ></span>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="Email Address"
                    :class="{ 'is-invalid': errors.email }"
                    @blur="touched.email = true"
                    @input="validateField('email')"
                    v-model="email"
                  />
                  <div v-if="errors.email" class="invalid-feedback d-block">
                    {{ errors.email }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="input-group">
                  <span class="input-group-text"
                    ><i class="fas fa-lock"></i
                  ></span>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="Password"
                    v-model="password"
                    @blur="touched.password = true"
                    @input="validateField('password')"
                  />
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="rememberMe"
                />
                <label class="form-check-label" for="rememberMe"
                  >Remember me</label
                >

                <div class="forgot-password">
                  <a href="#">Forgot Password?</a>
                </div>
              </div>

              <button type="submit" class="btn btn-login w-100">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {{ loading ? "Signing in.." : "Sign In" }}
              </button>

              <div class="divider">
                <span>Or continue with</span>
              </div>

              <div class="social-login">
                <Gsign />
              </div>

              <div class="signup-link">
                Don't have an account?
                <RouterLink to="/signup">Sign up now</RouterLink>
              </div>
            </form>
          </div>
        </div>

        <!-- Image Slider Section -->
        <div class="col-lg-6">
          <div class="image-slider">
            <div
              id="loginCarousel"
              class="carousel slide"
              data-bs-ride="carousel"
            >
              <div class="carousel-indicators">
                <button
                  type="button"
                  data-bs-target="#loginCarousel"
                  data-bs-slide-to="0"
                  class="active"
                  aria-current="true"
                  aria-label="Slide 1"
                ></button>
                <button
                  type="button"
                  data-bs-target="#loginCarousel"
                  data-bs-slide-to="1"
                  aria-label="Slide 2"
                ></button>
                <button
                  type="button"
                  data-bs-target="#loginCarousel"
                  data-bs-slide-to="2"
                  aria-label="Slide 3"
                ></button>
              </div>
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <img
                    src="https://images.unsplash.com/photo-1520716497194-0bde97ce9abe?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    class="d-block w-100"
                    alt="Modern Workspace"
                  />
                  <div class="carousel-caption d-none d-md-block">
                    <h5>SelfLens</h5>
                    <p>Memorize yourself with your clicks.</p>
                  </div>
                </div>
                <div class="carousel-item">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    class="d-block w-100"
                    alt="Productivity"
                  />
                  <div class="carousel-caption d-none d-md-block">
                    <h5>SelfLens</h5>
                    <p>Memorize yourself with your clicks.</p>
                  </div>
                </div>
                <div class="carousel-item">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1675827055694-010aef2cf08f?q=80&w=712&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    class="d-block w-100"
                    alt="Innovation"
                  />
                  <div class="carousel-caption d-none d-md-block">
                    <h5>SelfLens</h5>
                    <p>Memorize yourself with your clicks.</p>
                  </div>
                </div>
              </div>
              <button
                class="carousel-control-prev"
                type="button"
                data-bs-target="#loginCarousel"
                data-bs-slide="prev"
              >
                <span
                  class="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button
                class="carousel-control-next"
                type="button"
                data-bs-target="#loginCarousel"
                data-bs-slide="next"
              >
                <span
                  class="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/composables/useAuth";
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Gsign from "./Gsign.vue";

let loading = ref(false);

const router = useRouter();

const email = ref("");
const password = ref("");

const errors = ref({});
const touched = ref({});
const toast = useToast();
const authStore = useAuth();

// Validation rules
const validateEmail = (email) => {
  // console.log("validate email");
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Please enter a valid email";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};
const emailError = computed(() => validateEmail(email.value));
const passwordError = computed(() => validatePassword(password.value));
const isFormValid = computed(() => !emailError.value && !passwordError.value);

// Real-time validation when user types
const validateField = (field) => {
  if (field === "email") errors.value.email = validateEmail(email.value);
  if (field === "password")
    errors.value.password = validatePassword(password.value);
};

const handleLogin = async () => {
  // Mark all fields as touched
  touched.value.email = true;
  touched.value.password = true;

  // Validate all fields
  errors.value.email = validateEmail(email.value);
  errors.value.password = validatePassword(password.value);

  console.log(emailError, passwordError, isFormValid);

  // this will call the isFormValid, then check
  if (!isFormValid.value) {
    return; // Don't proceed if form is invalid
  }
  loading.value = true;

  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.value,
      password: password.value,
    });

    const {
      token,
      data: { user },
    } = response.data;

    // Use auth store
    authStore.setAuth(token, user);

    toast.success(`Welcom back ${user.name}!`);
    setTimeout(() => {
      router.push("/home");
    }, 1000);
  } catch (error) {
    if (error.response && error.response.status == 422)
      toast.error(error.response.data.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push("/home");
  }
});
</script>

<style scoped>
:root {
  --primary-color: #4361ee;
  --secondary-color: #3a0ca3;
  --accent-color: #4cc9f0;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gradient: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-section {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.login-container {
  padding: 30px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
}

.login-form {
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.brand {
  text-align: center;
  margin-bottom: 40px;
}

.brand h1 {
  color: #4361ee;
  font-weight: 700;
  margin-bottom: 5px;
}

.brand p {
  color: #6c757d;
  font-size: 1.1rem;
}

.form-control {
  padding: 12px 15px;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
}

.input-group-text {
  background-color: white;
  border: 2px solid #e9ecef;
  border-right: none;
  border-radius: 10px 0 0 10px;
}

.input-group .form-control {
  border-left: none;
  border-radius: 0 10px 10px 0;
}

.btn-login {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(67, 97, 238, 0.4);
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #dee2e6;
}

.divider span {
  padding: 0 15px;
  color: #6c757d;
  font-size: 0.9rem;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.social-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  background: white;
  color: #6c757d;
  transition: all 0.3s;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.social-btn.facebook:hover {
  background: #3b5998;
  color: white;
  border-color: #3b5998;
}

.social-btn.google:hover {
  background: #dd4b39;
  color: white;
  border-color: #dd4b39;
}

.social-btn.twitter:hover {
  background: #1da1f2;
  color: white;
  border-color: #1da1f2;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  color: #6c757d;
}

.signup-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.image-slider {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.carousel-item {
  height: 600px;
}

.carousel-item img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 20px;
  bottom: 40px;
  left: 20px;
  right: 20px;
}

.carousel-indicators [data-bs-target] {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 5px;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password a:hover {
  color: var(--primary-color);
}

@media (max-width: 992px) {
  .login-container {
    max-width: 700px;
  }

  .carousel-item {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .image-slider {
    order: -1;
  }

  .carousel-item {
    height: 300px;
  }

  .login-form {
    padding: 30px 25px;
  }
}
</style>
