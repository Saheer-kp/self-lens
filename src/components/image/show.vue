<template>
  <div
    class="modal fade"
    id="imageModal"
    tabindex="-1"
    aria-hidden="true"
    ref="modalElement"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <div class="user-info-modal d-flex align-items-center">
            <div
              class="user-avatar-initial me-3"
              :style="{
                background: user.getUserColor(selectedImage?.user?.name),
              }"
            >
              {{ user.getUserInitial(selectedImage?.user?.name) }}
            </div>
            <div>
              <h6 class="mb-0">
                {{ selectedImage?.user?.name || "Anonymous" }}
              </h6>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body p-0">
          <div class="image-modal-container">
            <img
              :src="imageUrl"
              :alt="selectedImage?.description || 'Image'"
              class="img-fluid w-100"
              @dblclick="$emit('like-image', selectedImage)"
            />
            <div
              v-if="selectedImage?.showLikeAnimation"
              class="like-animation-modal"
            >
              <i class="fas fa-heart"></i>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <div class="w-100">
            <div class="d-flex justify-content-between align-items-center">
              <div class="likes-info-modal">
                <button
                  class="btn btn-outline-primary btn-sm like-btn-modal"
                  :class="{ liked: selectedImage?.is_liked }"
                  @click="$emit('like-image', selectedImage)"
                >
                  <i class="fas fa-heart me-1"></i>
                  Like
                </button>
                <span class="likes-count-modal ms-2"
                  >{{ selectedImage?.likes || 0 }} likes</span
                >
              </div>
              <div v-if="selectedImage?.description" class="image-description">
                <p class="mb-0 text-muted small">
                  {{ selectedImage.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Modal } from "bootstrap";
import { userStore } from "@/stores/userStore";

const props = defineProps({
  selectedImage: {
    type: Object,
    default: null,
  },
  showModal: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: "#",
  },
});

const emit = defineEmits(["like-image", "close-modal", "image-url"]);

const modalElement = ref(null);
const modalInstance = ref(null);
const user = userStore();

// Methods
const getImageUrl = (fileUrl) => {
  if (!fileUrl) return "/placeholder-image.jpg";
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${import.meta.env.VITE_API_URL || ""}${fileUrl}`;
};

// Initialize modal
onMounted(() => {
  if (modalElement.value) {
    modalInstance.value = new Modal(modalElement.value);

    // Listen for modal hide event
    modalElement.value.addEventListener("hidden.bs.modal", () => {
      emit("close-modal");
    });
  }
});

// Watch for showModal changes
watch(
  () => props.showModal,
  (newVal) => {
    if (modalInstance.value) {
      if (newVal) {
        modalInstance.value.show();
      } else {
        modalInstance.value.hide();
      }
    }
  }
);

// Cleanup
onUnmounted(() => {
  if (modalInstance.value) {
    modalInstance.value.dispose();
  }
});
</script>

<style scoped>
.image-modal-container {
  position: relative;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  max-height: 70vh;
  overflow: hidden;
}

.image-modal-container img {
  max-height: 70vh;
  object-fit: contain;
}

.user-info-modal {
  display: flex;
  align-items: center;
}

.likes-info-modal {
  display: flex;
  align-items: center;
}

.like-btn-modal {
  border: 1px solid #dee2e6;
}

.like-btn-modal.liked {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}

.likes-count-modal {
  font-weight: 500;
  color: #6c757d;
}

.image-description {
  max-width: 300px;
}

/* Like Animation */
.like-animation-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: likeAnimation 1s ease-out;
  z-index: 10;
}

.like-animation-modal i {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }

  .image-modal-container {
    min-height: 50vh;
    max-height: 60vh;
  }

  .modal-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: start !important;
  }

  .image-description {
    max-width: 100%;
  }
}
</style>
