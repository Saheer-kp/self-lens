<template>
  <!-- Upload Button -->
  <button class="btn btn-primary me-2" @click="showModal = true">
    <i class="fas fa-cloud-upload-alt me-2"></i>Upload Images
  </button>

  <!-- Upload Modal -->
  <div
    class="modal fade"
    :class="{ show: showModal, 'd-block': showModal }"
    tabindex="-1"
    v-if="showModal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Images (Max 3)</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-2">
            <select
              class="form-select"
              aria-label="Default select example"
              v-model="category"
            >
              <option value="" selected>Choose Category</option>
              <option :value="category" v-for="category in categories">
                {{ category }}
              </option>
            </select>
          </div>
          <!-- Drag & Drop Zone -->
          <div
            class="drop-zone"
            :class="{
              'drop-zone-active': isDragging,
              'drop-zone-error': uploadError,
            }"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
          >
            <div class="drop-zone-content">
              <i class="fas fa-cloud-upload-alt fa-3x mb-3 text-muted"></i>
              <h5 v-if="!isDragging && !uploadError">
                Drag & Drop your images here
              </h5>
              <h5 v-else-if="isDragging">Drop to upload</h5>
              <h5 v-else class="text-danger">Error uploading files</h5>

              <p class="text-muted">or</p>

              <input
                type="file"
                ref="fileInput"
                @change="onFileSelect"
                accept="image/*"
                class="d-none"
                multiple
              />

              <button
                class="btn btn-outline-primary browse-btn"
                @click="triggerFileInput"
              >
                Browse Files
              </button>

              <p class="text-muted mt-2 small">
                Supported formats: JPG, PNG, GIF, WEBP (Max: 10MB per file)
              </p>
              <p class="text-muted small">Maximum 3 images allowed</p>
              <p class="text-info small fw-bold" v-if="previews.length > 0">
                {{ previews.length }}/3 images selected
              </p>
            </div>
          </div>

          <!-- Previews Section -->
          <div v-if="previews.length > 0" class="previews-section mt-4">
            <h6>Image Previews ({{ previews.length }}/3)</h6>
            <div class="previews-grid">
              <div
                v-for="(preview, index) in previews"
                :key="index"
                class="preview-item"
                :class="{
                  uploading: preview.uploading,
                  uploaded: preview.uploaded,
                }"
              >
                <div class="preview-image-container">
                  <img
                    :src="preview.url"
                    :alt="preview.file.name"
                    class="preview-image"
                  />

                  <!-- Progress Overlay -->
                  <div
                    v-if="preview.uploading || preview.uploaded"
                    class="progress-overlay"
                  >
                    <div class="progress-content">
                      <div v-if="preview.uploading" class="uploading-content">
                        <i
                          class="fas fa-spinner fa-spin fa-2x mb-2 text-white"
                        ></i>
                        <div class="progress-circle">
                          <div
                            class="progress-circle-fill"
                            :style="{
                              transform: `rotate(${
                                preview.uploadProgress * 3.6
                              }deg)`,
                            }"
                          ></div>
                          <div class="progress-circle-text">
                            {{ preview.uploadProgress }}%
                          </div>
                        </div>
                        <p class="text-white mb-0 small">Uploading...</p>
                      </div>
                      <div v-else class="uploaded-content">
                        <i
                          class="fas fa-check-circle fa-2x mb-2 text-success"
                        ></i>
                        <p class="text-white mb-0 small">Uploaded!</p>
                      </div>
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <div class="preview-overlay" v-if="!preview.uploading">
                    <button
                      class="btn btn-sm btn-danger"
                      @click="removeFile(index)"
                      title="Remove image"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- Individual Image Details -->
                <div
                  class="preview-details"
                  :class="{ disabled: preview.uploading }"
                >
                  <div class="mb-2">
                    <label class="form-label small fw-bold">Title</label>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="preview.title"
                      :placeholder="getDefaultTitle(preview.file.name)"
                      :disabled="preview.uploading"
                    />
                  </div>

                  <div class="mb-2">
                    <label class="form-label small fw-bold">Description</label>
                    <textarea
                      class="form-control form-control-sm"
                      v-model="preview.description"
                      rows="2"
                      placeholder="Enter image description"
                      :disabled="preview.uploading"
                    ></textarea>
                  </div>

                  <div class="mb-2">
                    <label class="form-label small fw-bold">Tags</label>
                    <div class="tags-container mb-2">
                      <span
                        v-for="tag in preview.tags"
                        :key="tag"
                        class="badge bg-primary me-1 mb-1"
                      >
                        {{ tag }}
                        <i
                          class="fas fa-times ms-1"
                          @click="removeTag(index, tag)"
                          v-if="!preview.uploading"
                        ></i>
                      </span>
                    </div>
                    <div class="input-group input-group-sm">
                      <input
                        type="text"
                        class="form-control"
                        v-model="preview.newTag"
                        placeholder="Add tag"
                        @keyup.enter="addTag(index)"
                        :disabled="preview.uploading"
                      />
                      <button
                        class="btn btn-outline-secondary"
                        @click="addTag(index)"
                        :disabled="preview.uploading"
                      >
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="uploadError" class="alert alert-danger mt-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ uploadError }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="uploadImages"
            :disabled="!previews.length || isUploading"
          >
            <span v-if="isUploading">
              <i class="fas fa-spinner fa-spin me-2"></i>Uploading...
            </span>
            <span v-else>
              <i class="fas fa-upload me-2"></i>Upload
              {{ previews.length }} Image(s)
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div class="modal-backdrop fade show" v-if="showModal"></div>
</template>

<script setup>
import { API_ENDPOINTS } from "@/config/api";
import { CATEGORIES } from "@/config/image";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { ref } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();

// Modal state
const showModal = ref(false);

// File handling
const fileInput = ref(null);
const previews = ref([]);
const isDragging = ref(false);

// Upload state
const isUploading = ref(false);
const uploadError = ref("");

const categories = CATEGORIES;

const category = ref("");

// Constants
const MAX_FILES = 3;

const auth = useAuthStore();

// Methods

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileSelect = (event) => {
  const files = Array.from(event.target.files);
  handleFiles(files);
};

const onDragOver = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const onDragLeave = (event) => {
  event.preventDefault();
  isDragging.value = false;
};

const onDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;

  const files = Array.from(event.dataTransfer.files);
  handleFiles(files);
};

const handleFiles = (files) => {
  // Reset previous errors
  uploadError.value = "";

  // Check if adding these files would exceed the limit
  const totalAfterAdd = previews.value.length + files.length;
  if (totalAfterAdd > MAX_FILES) {
    toast.error(`Maximum ${MAX_FILES} images allowed.`);
    return;
  }

  files.forEach((file) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      uploadError.value = "Please select only image files";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      uploadError.value = "File size must be less than 10MB";
      return;
    }

    // Check if file already exists
    const existingIndex = previews.value.findIndex(
      (p) => p.file.name === file.name && p.file.size === file.size
    );
    if (existingIndex === -1) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.value.push({
          url: e.target.result,
          file: file,
          title: getDefaultTitle(file.name),
          description: "",
          tags: [],
          newTag: "",
          uploading: false,
          uploaded: false,
          uploadProgress: 0,
        });
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeFile = (index) => {
  previews.value.splice(index, 1);
};

const getDefaultTitle = (filename) => {
  return filename.replace(/\.[^/.]+$/, ""); // Remove extension
};

const addTag = (index) => {
  const preview = previews.value[index];
  if (preview.newTag.trim() && !preview.tags.includes(preview.newTag.trim())) {
    preview.tags.push(preview.newTag.trim());
    preview.newTag = "";
  }
};

const removeTag = (index, tagToRemove) => {
  const preview = previews.value[index];
  preview.tags = preview.tags.filter((tag) => tag !== tagToRemove);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const uploadImages = async () => {
  if (category.value == "") {
    toast.error("category is required");
    return;
  }
  if (!previews.value.length) return;

  isUploading.value = true;
  uploadError.value = "";

  console.log(previews.value, "previews");

  try {
    // Create FormData for all files
    const formData = new FormData();

    formData.append("category", category.value);

    // Add all files to FormData
    previews.value.forEach((preview, index) => {
      formData.append(`images`, preview.file);
    });

    // Create metadata object for all images
    const imagesMetadata = previews.value.map((preview, index) => ({
      title: preview.title || getDefaultTitle(preview.file.name),
      description: preview.description,
      tags: preview.tags,
    }));

    // Add metadata as JSON
    formData.append("metadata", JSON.stringify(imagesMetadata));

    console.log("form", formData.values);

    // Single API call for all images
    const response = await axios.post(API_ENDPOINTS.IMAGE.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      const result = response.data;
      console.log(result);
      // Handle success
    } else {
      toast.error(`Failed to upload images`);
    }

    // All files uploaded successfully
    console.log("All files uploaded successfully:", previews.value);

    // Show success toast
    toast.success(`${previews.value.length} files uploaded successfully.`);

    // Close modal after a short delay
    setTimeout(() => {
      closeModal();
    }, 1500);
  } catch (error) {
    console.log(error);

    uploadError.value =
      error.response.data.message || "Upload failed. Please try again.";
    toast.error(`Something went wrong while uploading.`);

    // Reset upload states on error
    previews.value.forEach((preview) => {
      preview.uploading = false;
      preview.uploaded = false;
      preview.uploadProgress = 0;
    });
  } finally {
    isUploading.value = false;
  }
};

const resetForm = () => {
  previews.value = [];
  uploadError.value = "";
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #0d6efd;
  background-color: #e9ecef;
}

.drop-zone-active {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.drop-zone-error {
  border-color: #dc3545;
  background-color: #f8d7da;
}

.drop-zone-content {
  pointer-events: none;
}

.browse-btn {
  pointer-events: auto !important;
}

/* Previews Section */
.previews-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.preview-item {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-item.uploading {
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

.preview-item.uploaded {
  border-color: #198754;
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
}

.preview-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Progress Overlay */
.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.progress-content {
  text-align: center;
  color: white;
}

.uploading-content,
.uploaded-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Circular Progress Bar */
.progress-circle {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  z-index: 1;
}

.progress-circle-fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: conic-gradient(#0d6efd var(--progress, 0%), transparent 0%);
  mask: radial-gradient(circle at center, transparent 55%, black 56%);
  -webkit-mask: radial-gradient(circle at center, transparent 55%, black 56%);
}

.progress-circle-text {
  position: relative;
  z-index: 2;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.preview-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.preview-details {
  padding: 1rem;
  transition: opacity 0.3s ease;
}

.preview-details.disabled {
  opacity: 0.6;
}

.preview-details .form-label {
  margin-bottom: 0.25rem;
}

.tags-container {
  min-height: 2rem;
}

.badge {
  cursor: pointer;
  padding: 0.4em 0.6em;
  font-size: 0.75rem;
}

.badge .fa-times {
  cursor: pointer;
  opacity: 0.7;
}

.badge .fa-times:hover {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .previews-grid {
    grid-template-columns: 1fr;
  }

  .preview-image-container {
    height: 150px;
  }
}

@media (max-width: 576px) {
  .drop-zone {
    padding: 2rem 1rem;
  }

  .preview-details {
    padding: 0.75rem;
  }

  .progress-circle {
    width: 50px;
    height: 50px;
  }

  .progress-circle-text {
    font-size: 0.7rem;
  }
}
</style>
