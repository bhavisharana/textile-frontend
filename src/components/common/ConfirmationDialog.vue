<script setup>
import { defineProps, defineEmits } from "vue";
import BasicDialog from "./BasicDialog.vue";

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
    default: false,
  },
});

const emit = defineEmits(["update:isOpen", "close", "confirm"]);

const closeModal = () => {
  emit("update:isOpen", false);
  emit("close");
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <BasicDialog
    :is-open="isOpen"
    :title="title"
    max-width="520px"
    :loading="loading"
    :submit-text="confirmText"
    :cancel-text="cancelText"
    :close-on-backdrop="closeOnBackdrop"
    @update:is-open="emit('update:isOpen', $event)"
    @close="closeModal"
    @submit="handleConfirm"
  >
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
  </BasicDialog>
</template>

<style scoped>
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
</style>