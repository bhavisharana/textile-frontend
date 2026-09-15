<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLabdipStore, type Labdip } from '../../stores/labdip'
import { useQualityStore } from '../../stores/quality'

interface Props {
  isOpen: boolean
  labdip?: Labdip | null
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  labdip: null,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
  (e: 'saved'): void
}>()

const labdipStore = useLabdipStore()
const qualityStore = useQualityStore()

const isEditing = ref(false)
const editingId = ref<number | null>(null)
const statusOptions = ['Pending', 'In Progress', 'Approved', 'Rejected']

const form = ref({
  labdip_no: '',
  party_name: '',
  status: 'Pending',
  quality_id: null as number | null,
  quality_name: '',
  color_name: '',
  received_date: '',
  sending_date: '',
  remarks: '',
})

const formError = ref<string | null>(null)

function formatDateForInput(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().split('T')[0]
}

function resetForm() {
  formError.value = null
  if (props.labdip) {
    isEditing.value = true
    editingId.value = props.labdip.id
    form.value = {
      labdip_no: props.labdip.labdip_no,
      party_name: props.labdip.party_name,
      status: props.labdip.status,
      quality_id: props.labdip.quality_id || null,
      quality_name: props.labdip.quality_name,
      color_name: props.labdip.color_name,
      received_date: formatDateForInput(props.labdip.received_date),
      sending_date: formatDateForInput(props.labdip.sending_date),
      remarks: props.labdip.remarks || '',
    }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      labdip_no: '',
      party_name: '',
      status: 'Pending',
      quality_id: null,
      quality_name: '',
      color_name: '',
      received_date: new Date().toISOString().split('T')[0],
      sending_date: '',
      remarks: '',
    }
  }
}

watch(
  () => [props.isOpen, props.labdip],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetForm()
      if (qualityStore.qualities.length === 0) {
        qualityStore.fetchQualities()
      }
    }
  },
  { immediate: true }
)

// Auto-fill quality_name when quality_id is selected from dropdown
watch(
  () => form.value.quality_id,
  (newVal) => {
    if (newVal) {
      const selected = qualityStore.qualities.find((q) => q.id === Number(newVal))
      if (selected) {
        form.value.quality_name = selected.quality_name
      }
    }
  }
)

function closeModal() {
  emit('update:isOpen', false)
  emit('close')
}

async function handleSubmit() {
  if (
    !form.value.labdip_no.trim() ||
    !form.value.party_name.trim() ||
    !form.value.quality_name.trim() ||
    !form.value.color_name.trim()
  ) {
    formError.value =
      'Please fill out all required fields (Labdip No, Party Name, Quality Name, Color Name)'
    return
  }

  const payload = {
    labdip_no: form.value.labdip_no,
    party_name: form.value.party_name,
    status: form.value.status,
    quality_id: form.value.quality_id ? Number(form.value.quality_id) : null,
    quality_name: form.value.quality_name,
    color_name: form.value.color_name,
    received_date: form.value.received_date || null,
    sending_date: form.value.sending_date || null,
    remarks: form.value.remarks,
  }

  let success = false
  if (isEditing.value && editingId.value) {
    success = await labdipStore.updateLabdip(editingId.value, payload)
  } else {
    success = await labdipStore.createLabdip(payload)
  }

  if (success) {
    emit('saved')
    closeModal()
  } else {
    formError.value = labdipStore.error || 'Operation failed'
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Edit Labdip Entry' : 'Create New Labdip Entry' }}</h2>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="formError" class="alert-error">
          <span>{{ formError }}</span>
        </div>

        <div class="form-grid">
          <!-- Labdip No -->
          <div class="form-group">
            <label for="labdip_no">Labdip No *</label>
            <input
              id="labdip_no"
              v-model="form.labdip_no"
              type="text"
              placeholder="e.g. LD-2026-001"
              required
            />
          </div>

          <!-- Party Name -->
          <div class="form-group">
            <label for="party_name">Party Name *</label>
            <input
              id="party_name"
              v-model="form.party_name"
              type="text"
              placeholder="e.g. Acme Textile Traders"
              required
            />
          </div>

          <!-- Status -->
          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" v-model="form.status" required>
              <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Quality Selection / Name -->
          <div class="form-group">
            <label for="quality_select">Quality Name *</label>
            <div class="quality-select-wrapper">
              <select id="quality_select" v-model="form.quality_id">
                <option :value="null">-- Select from Master or Custom --</option>
                <option v-for="q in qualityStore.qualities" :key="q.id" :value="q.id">
                  {{ q.quality_name }} ({{ q.code }})
                </option>
              </select>
              <input
                v-model="form.quality_name"
                type="text"
                placeholder="Or enter Quality Name manually"
                required
              />
            </div>
          </div>

          <!-- Color Name -->
          <div class="form-group">
            <label for="color_name">Color Name *</label>
            <input
              id="color_name"
              v-model="form.color_name"
              type="text"
              placeholder="e.g. Navy Blue / Shade #4B"
              required
            />
          </div>

          <!-- Received Date -->
          <div class="form-group">
            <label for="received_date">Received Date</label>
            <input
              id="received_date"
              v-model="form.received_date"
              type="date"
            />
          </div>

          <!-- Sending Date -->
          <div class="form-group">
            <label for="sending_date">Sending Date</label>
            <input
              id="sending_date"
              v-model="form.sending_date"
              type="date"
            />
          </div>

          <!-- Remarks -->
          <div class="form-group full-width">
            <label for="remarks">Remarks</label>
            <textarea
              id="remarks"
              v-model="form.remarks"
              rows="3"
              placeholder="Enter any additional notes or instructions..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-save" :disabled="labdipStore.loading">
            <span v-if="labdipStore.loading" class="spinner"></span>
            <span v-else>{{ isEditing ? 'Update Entry' : 'Save Labdip Entry' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  font-size: 1.75rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.modal-form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #475569;
}

.quality-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-save {
  padding: 10px 22px;
  background: #4f46e5;
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

.btn-save:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.btn-save:disabled {
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
