<script setup>
import { Teleport, defineProps, defineEmits } from 'vue';


const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: String,
    default: '560px',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitText: {
    type: String,
    default: 'Save',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:isOpen', 'close', 'submit']);

const closeModal = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    closeModal()
  }
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="handleBackdropClick">
      <div class="modal-card" :style="{ maxWidth: maxWidth }">
        <!-- Header -->
        <div class="modal-header">
          <slot name="header">
            <div>
              <h2 class="modal-title" v-if="title">{{ title }}</h2>
              <p class="modal-subtitle" v-if="subtitle">{{ subtitle }}</p>
            </div>
            <button type="button" class="btn-close" @click="closeModal" title="Close">&times;</button>
          </slot>
        </div>

        <!-- Body / Content Slot for Dynamic Forms -->
        <div class="modal-body">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="showFooter" class="modal-footer">
          <slot name="footer">
            <button type="button" class="btn-cancel" @click="closeModal">
              {{ cancelText }}
            </button>
            <button type="button" class="btn-submit" :disabled="loading" @click="handleSubmit">
              <span v-if="loading" class="spinner"></span>
              <span v-else>{{ submitText }}</span>
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--modal-overlay);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--modal-bg);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--modal-bg);
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
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--modal-bg);
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
