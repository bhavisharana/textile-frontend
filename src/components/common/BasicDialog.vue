<script setup>
import { defineProps, defineEmits } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  maxWidth: {
    type: String,
    default: "560px",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitText: {
    type: String,
    default: "Save",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:isOpen", "close", "submit"]);

const closeModal = () => {
  emit("update:isOpen", false);
  emit("close");
};

const handleVisibilityChange = (visible) => {
  if (!visible) {
    closeModal();
  }
};

const handleSubmit = () => {
  emit("submit");
};
</script>

<template>
  <Dialog
    :visible="isOpen"
    :modal="true"
    :dismissable-mask="closeOnBackdrop"
    :close-on-escape="false"
    :closable="false"
    :style="{ width: '100%', maxWidth }"
    :pt="{
      mask: { class: '!bg-[var(--modal-overlay)] !backdrop-blur-sm' },
      root: {
        class:
          '!max-h-[90vh] !overflow-hidden !rounded-xl !border !border-[var(--border-color)] !bg-[var(--modal-bg)] !shadow-2xl',
      },
      header: { class: '!border-0 !bg-[var(--modal-bg)] !p-0' },
      content: { class: '!bg-[var(--modal-bg)] !p-0' },
      footer: { class: '!border-0 !bg-[var(--modal-bg)] !p-0' },
    }"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="modal-header">
        <slot name="header">
          <div>
            <h2 v-if="title" class="modal-title">{{ title }}</h2>
            <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            v-tooltip.bottom="'Close'"
          >
            &times;
          </button>
        </slot>
      </div>
    </template>

    <div class="modal-body">
      <slot></slot>
    </div>

    <template v-if="showFooter" #footer>
      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="closeModal">
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="btn-submit"
          :disabled="loading"
          @click="handleSubmit"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ submitText }}</span>
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.modal-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}

.btn-close {
  font-size: 1.5rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
}

.btn-cancel {
  padding: 10px 20px;
  background: var(--btn-sec-bg);
  border: 1px solid var(--btn-sec-border);
  color: var(--btn-sec-text);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--btn-sec-hover-bg);
  color: var(--btn-sec-hover-text);
}

.btn-submit {
  padding: 10px 22px;
  background: var(--primary);
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
