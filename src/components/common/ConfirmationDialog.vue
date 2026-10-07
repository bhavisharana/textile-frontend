<script setup>
import { Teleport, defineProps, defineEmits } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Delete Leave",
  },
  confirmTitle: {
    type: String,
    default: "Confirm Deletion",
  },
  message: {
    type: String,
    default: "Are you sure you want to proceed with this deletion?",
  },
  confirmText: {
    type: String,
    default: "Yes, Delete",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:isOpen", "close", "confirm"]);

const closeModal = () => {
  emit("update:isOpen", false);
  emit("close");
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.loading) {
    closeModal();
  }
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="confirmation-backdrop"
        @click.self="handleBackdropClick"
      >
        <div class="confirmation-card">
          <!-- Header -->
          <div class="confirmation-header">
            <h2 class="dialog-title">{{ title }}</h2>
            <button
              type="button"
              class="btn-close-box"
              @click="closeModal"
              :disabled="loading"
              title="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="header-divider"></div>

          <!-- Body Alert Box -->
          <div class="confirmation-body">
            <div class="alert-box">
              <div class="alert-icon-container">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div class="alert-content">
                <h3 class="alert-title">{{ confirmTitle }}</h3>
                <p class="alert-message">{{ message }}</p>
              </div>
            </div>
          </div>

          <div class="footer-divider"></div>

          <!-- Footer Buttons -->
          <div class="confirmation-footer">
            <button
              type="button"
              class="btn-cancel"
              :disabled="loading"
              @click="closeModal"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>{{ cancelText }}</span>
            </button>

            <button
              type="button"
              class="btn-confirm-delete"
              :disabled="loading"
              @click="handleConfirm"
            >
              <span v-if="loading" class="spinner"></span>
              <template v-else>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{{ confirmText }}</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirmation-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(10, 10, 14, 0.75);
  backdrop-filter: blur(6px);
  padding: 16px;
}

.confirmation-card {
  width: 100%;
  max-width: 520px;
  background: #17181c;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  padding: 24px;
  color: #ffffff;
  font-family: inherit;
  animation: modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Transition Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Header */
.confirmation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}

.btn-close-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.04);
  color: #e4e4e7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-box:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

.btn-close-box:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dividers */
.header-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 18px 0 22px 0;
}

.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 22px 0 20px 0;
}

/* Body Alert Box */
.confirmation-body {
  display: flex;
  flex-direction: column;
}

.alert-box {
  background: linear-gradient(
    180deg,
    rgba(139, 20, 25, 0.28) 0%,
    rgba(90, 10, 15, 0.28) 100%
  );
  border: 1px solid rgba(220, 38, 38, 0.6);
  border-radius: 16px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.alert-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #c51d24;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
}

.alert-message {
  font-size: 0.88rem;
  color: #d4d4d8;
  margin: 0;
  line-height: 1.4;
  font-weight: 400;
}

/* Footer */
.confirmation-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #a1a1aa;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm-delete {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: none;
  color: #09090b;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #f4f4f5;
  transform: translateY(-1px);
}

.btn-confirm-delete:active:not(:disabled) {
  transform: translateY(0);
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  border-top-color: #09090b;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>