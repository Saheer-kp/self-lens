<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-white py-3 border-bottom">
      <div class="container">
        <a class="navbar-brand" href="#"
          ><span class="brand"
            ><i class="fas fa-camera me-2"></i>SelfLens</span
          ></a
        >
        <!-- <a class="navbar-brand" href="#"
          ><img src="/public/logo.png" alt=""
        /></a> -->

        <div class="d-flex align-items-center">
          <!-- Auth Buttons -->
          <div class="auth-buttons">
            <button
              v-if="!authStore.isAuthenticated"
              class="btn btn-outline-primary btn-sm me-2"
              @click="$router.push('/login')"
            >
              Log in
            </button>
            <button
              v-if="!authStore.isAuthenticated"
              class="btn btn-primary btn-sm"
              @click="$router.push('/signup')"
            >
              Sign up
            </button>
            <div class="d-flex" v-else>
              <ImageUploadModal @images-uploaded="fetchImages" />
              <div class="dropdown" ref="dropdownElement">
                <button
                  class="btn user-avatar-dropdown dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  @click="toggleDropdown"
                  :style="{
                    background: user.getUserColor(authStore.user.name),
                  }"
                >
                  {{ user.getUserInitial(authStore.user.name) }}
                </button>
                <ul
                  class="dropdown-menu"
                  aria-labelledby="userDropdown"
                  :class="{ show: isToggleDropdown }"
                >
                  <li>
                    <a class="dropdown-item" href="#" @click="authStore.logout"
                      >Log out</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="container">
    <!-- Search Section -->
    <div class="search-container">
      <h1 class="text-center mb-4">Discover free high resolution photos</h1>
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control form-control-lg"
          placeholder="Search free high-resolution photos"
          v-model="searchQuery"
        />
        <button class="btn btn-dark" type="button" @click="searchImages">
          Search
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div>
      <ul class="nav nav-tabs me-4 d-none d-md-flex">
        <li class="nav-item" v-for="tab in tabs" :key="tab">
          <a
            class="nav-link"
            :class="{ active: activeTab === tab }"
            href="#"
            @click.prevent="setActiveTab(tab)"
          >
            {{ tab }}
          </a>
        </li>
      </ul>
    </div>

    <div class="text-center p-3" v-if="!loading && !images.length">
      <strong>No Images</strong>
    </div>

    <div class="text-center p-3" v-if="loading">
      <strong>Loading Images..</strong>
    </div>

    <!-- Image Grid - Proper Masonry with grid-row-end -->
    <div class="masonry-grid" v-else>
      <div
        class="image-card"
        v-for="image in images"
        :key="image.id"
        :style="{ gridRowEnd: `span ${image.span}` }"
        @click="openImageModal(image)"
      >
        <div class="image-wrapper">
          <img
            :src="getImageUrl(image.file_url)"
            :alt="image.description || 'Image'"
            class="img-fluid"
            @dblclick="likeImage(image)"
          />

          <div v-if="image.showLikeAnimation" class="like-animation">
            <i class="fas fa-heart"></i>
          </div>
          <div class="image-overlay">
            <div class="overlay-content">
              <div class="user-info">
                <div
                  class="user-avatar-initial"
                  :style="{
                    background: user.getUserColor(image.user?.name),
                  }"
                >
                  {{ user.getUserInitial(image.user?.name) }}
                </div>
                <span class="user-name">{{
                  image.user?.name || "Anonymous"
                }}</span>
              </div>
              <div class="likes-info">
                <button
                  class="btn btn-light btn-sm like-btn"
                  :class="{ liked: image.is_liked }"
                  @click.stop="likeImage(image)"
                >
                  ❤️
                </button>
                <span class="likes-count">{{ image.likes || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator for infinite scroll -->
    <div class="text-center mt-4 mb-4" v-if="loadingMore">
      <div class="loading-spinner">
        <strong>Loading more images...</strong>
      </div>
    </div>
  </main>

  <!-- Image Modal Component -->
  <ImageModal
    :selected-image="selectedImage"
    :show-modal="showImageModal"
    :image-url="getImageUrl(selectedImage?.file_url)"
    @like-image="likeImage"
    @close-modal="closeImageModal"
  />

  <!-- Footer -->
  <footer class="footer bg-light mt-5">
    <div class="container text-center py-4">
      <p class="text-muted mb-0">
        © {{ new Date().getFullYear() }} SelfLens. Free quality photos.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { useAuth } from "@/composables/useAuth";
import { API_ENDPOINTS, API_URL } from "@/config/api";
import { CATEGORIES } from "@/config/image";
import { userStore } from "@/stores/userStore";
import axios from "axios";
import ImageModal from "@/components/image/show.vue";
import api from "@/services/api";

import { ref, computed, onMounted, onUnmounted } from "vue";

const isToggleDropdown = ref(false);

// Tabs data
const tabs = CATEGORIES;

const activeTab = ref(CATEGORIES[0]);

const authStore = useAuth();
// User data
const images = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const hasMore = ref(true);
const user = userStore();

const tabCache = ref({});
const isTabLoaded = ref({});

const selectedImage = ref(null);
const showImageModal = ref(false);

// Scroll handler
const handleScroll = () => {
  // Don't load more if already loading or no more content
  if (loadingMore.value || !hasMore.value) return;

  // Calculate scroll position
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // Load more when user is 200px from the bottom
  const threshold = 200;

  if (scrollTop + windowHeight >= documentHeight - threshold) {
    loadMore();
  }
};

// Add scroll event listener
const setupScrollListener = () => {
  window.addEventListener("scroll", handleScroll);
};

// Remove scroll event listener
const removeScrollListener = () => {
  window.removeEventListener("scroll", handleScroll);
};

const fetchImages = async (page = 1, search = "") => {
  try {
    if (page === 1) {
      loading.value = true;
      images.value = [];
    } else {
      loadingMore.value = true;
    }

    error.value = null;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "3",
    });

    if (search) {
      params.append("search", search);
    }

    if (activeTab.value) {
      params.append("category", activeTab.value);
    }

    let headers = {};
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`;

    console.log(headers, "hh");

    const response = await api.get(API_ENDPOINTS.IMAGE.LIST, {
      params,
      headers,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = response.data.data;

    const formatedImages = data.images.map((img) => ({
      ...img,
      showLikeAnimation: false,
    }));

    if (page === 1) {
      images.value = formatedImages;
    } else {
      images.value = [...images.value, ...formatedImages];
    }

    console.log(images.value, "image ref");

    // Update pagination info
    hasMore.value = data.hasMore || data.images.length === 12;
    currentPage.value = page;

    // Cache/Update the complete state after every successful fetch
    const cacheKey = `${activeTab.value}-${search}`;
    tabCache.value[cacheKey] = {
      images: [...images.value], // Store all images (including paginated)
      currentPage: page,
      hasMore: hasMore.value,
    };

    console.log(
      "Updated cache for:",
      cacheKey,
      "with",
      images.value.length,
      "images"
    );
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching images:", err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const getImageUrl = (fileUrl) => {
  if (!fileUrl) return "/placeholder-image.jpg";

  // If it's already a full URL, return as is
  if (fileUrl.startsWith("http")) return fileUrl;

  // If it's a relative path, construct full URL
  return `${API_URL}${fileUrl}`;
};

const searchImages = () => {
  currentPage.value = 1;

  // Clear cache for this search to get fresh results
  const cacheKey = `${activeTab.value}-${searchQuery.value}`;
  delete tabCache.value[cacheKey];

  fetchImages(1, searchQuery.value);
};

// Load more images
const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    fetchImages(currentPage.value + 1, searchQuery.value);
  }
};

const setActiveTab = (tabId) => {
  // Don't do anything if clicking the same tab
  if (activeTab.value === tabId) return;

  activeTab.value = tabId;

  // Create cache key including search query for more precise caching
  const cacheKey = `${tabId}-${searchQuery.value}`;

  // Check if tab data is already cached
  if (tabCache.value[cacheKey]) {
    console.log("Loading from cache for:", cacheKey);
    const cachedData = tabCache.value[cacheKey];

    // Restore complete state from cache
    images.value = [...cachedData.images];
    currentPage.value = cachedData.currentPage;
    hasMore.value = cachedData.hasMore;
  } else {
    // Reset to first page for new tab
    currentPage.value = 1;
    fetchImages(1, searchQuery.value);
  }
};

const likeImage = async (image) => {
  try {
    if (!authStore.token) return;
    console.log(image);

    // Show animation
    image.showLikeAnimation = true;

    // Toggle like status optimistically
    const wasLiked = image.is_liked;
    image.is_liked = !wasLiked;

    console.log(image.is_liked, "like");

    image.likes = wasLiked ? image.likes - 1 : image.likes + 1;

    // Hide animation after 1 second
    setTimeout(() => {
      image.showLikeAnimation = false;
    }, 1000);

    // API call to like/unlike using single endpoint
    const token = localStorage.getItem("authToken");

    const response = await api.post(
      API_ENDPOINTS.IMAGE.LIKE_UNLIKE(image._id),
      {
        is_liked: !wasLiked, // Send true to like, false to unlike
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    if (response.status)
      syncLikeToImagesArray(image._id, image.is_liked, image.likes);
  } catch (error) {
    console.error("Like error:", error);

    // Revert optimistic update on error
    image.is_liked = !image.is_liked;
    image.likes = image.is_liked ? image.likes + 1 : image.likes - 1;

    // Show error message
    alert("Failed to like image. Please try again.");
  }
};

const syncLikeToImagesArray = (imageId, isLiked, likesCount) => {
  const imageIndex = images.value.findIndex((img) => img._id === imageId);
  if (imageIndex !== -1) {
    // Update the image in the array
    images.value[imageIndex].is_liked = isLiked;
    images.value[imageIndex].likes = likesCount;
  }
};

// Modal functions
const openImageModal = (image) => {
  selectedImage.value = { ...image };
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null;
};

const toggleDropdown = () => {
  isToggleDropdown.value = true;
};

onMounted(() => {
  fetchImages();
  setupScrollListener();
});

onUnmounted(() => {
  removeScrollListener();
});
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  grid-auto-rows: 10px; /* This is the key - defines the row height base */
  gap: 20px;
  margin-top: 2rem;
}

.image-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;
  grid-column-end: auto; /* Let the grid auto-place items */
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.image-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 20px;
  pointer-events: none;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.user-avatar {
  width: 32px !important;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: white;
}

.likes-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.like-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  pointer-events: auto;
  cursor: pointer;
}

.like-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.likes-count {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Header styles */
.auth-buttons .btn-outline-primary {
  border-color: #d1d1d1;
  color: #767676;
}

.auth-buttons .btn-outline-primary:hover {
  background-color: #f5f5f5;
  color: #111;
}

.auth-buttons .btn-primary {
  background-color: #111;
  border-color: #111;
}

.auth-buttons .btn-primary:hover {
  background-color: #333;
  border-color: #333;
}

.search-container {
  max-width: 700px;
  margin: 3rem auto;
}

.footer {
  border-top: 1px solid #e5e5e5;
}

.nav-tabs .nav-link {
  color: #767676;
  font-weight: 500;
  border: none;
  padding: 0.5rem 1rem;
}

.nav-tabs .nav-link.active {
  color: #111;
  border-bottom: 2px solid #111;
  background-color: transparent;
}

.nav-tabs .nav-link:hover {
  color: #111;
}

.user-avatar-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: white;
}

.likes-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.like-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  pointer-events: auto;
  cursor: pointer;
}

.like-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.likes-count {
  font-weight: 500;
  font-size: 0.9rem;
}

.user-avatar-dropdown {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid #d1d1d1;
  padding: 0;
  transition: all 0.2s ease;
}

.user-avatar-dropdown:hover {
  transform: scale(1.05);
  border-color: #111;
}

.user-avatar-dropdown:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Remove the default dropdown caret */
.user-avatar-dropdown::after {
  display: none;
}

.dropdown-menu {
  left: -20px;
  top: 100%;
}

/* Like Animation */
.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: likeAnimation 1s ease-out;
  z-index: 10;
}

.like-animation i {
  font-size: 4rem;
  color: #ff4757;
  text-shadow: 0 0 20px rgba(255, 71, 87, 0.8);
}

@keyframes likeAnimation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(1);
  }
  70% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* Like Button Styles */
.like-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn:hover {
  background: #fff;
  transform: scale(1.05);
}

.like-btn.liked {
  background: #ff4757;
  color: white;
}

.like-btn.liked i {
  color: white;
}

.likes-count {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Loading spinner styles */
.loading-spinner {
  padding: 2rem;
  color: #666;
}

.loading-spinner strong {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 992px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .image-overlay {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .masonry-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .search-container {
    margin: 2rem auto;
  }
}
</style>
