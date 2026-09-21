<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useOrderStore, type Order } from '../../stores/order'
import { usePartyStore } from '../../stores/party'
import { type Labdip } from '../../stores/labdip'

interface Props {
  isOpen: boolean
  order?: Order | null
  labdip?: Labdip | null
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  order: null,
  labdip: null,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
  (e: 'saved'): void
}>()

const orderStore = useOrderStore()
const partyStore = usePartyStore()

const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  labdip_id: null as number | null,
  labdip_no: '',
  party_name: '',
  quantity: 0,
  rate: 0,
  remarks: '',
})

const formError = ref<string | null>(null)

const calculatedTotal = computed(() => {
  const q = Number(form.value.quantity) || 0
  const r = Number(form.value.rate) || 0
  return (q * r).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

onMounted(() => {
  if (partyStore.parties.length === 0) {
    partyStore.fetchParties()
  }
})

function resetForm() {
  formError.value = null
  if (props.order) {
    isEditing.value = true
    editingId.value = props.order.id
    form.value = {
      labdip_id: props.order.labdip_id || null,
      labdip_no: props.order.labdip_no,
      party_name: props.order.party_name,
      quantity: props.order.quantity,
      rate: props.order.rate,
      remarks: props.order.remarks || '',
    }
  } else if (props.labdip) {
    isEditing.value = false
    editingId.value = null
    form.value = {
      labdip_id: props.labdip.id,
      labdip_no: props.labdip.labdip_no,
      party_name: props.labdip.party_name,
      quantity: 0,
      rate: 0,
      remarks: '',
    }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      labdip_id: null,
      labdip_no: '',
      party_name: '',
      quantity: 0,
      rate: 0,
      remarks: '',
    }
  }
}

watch(
  () => [props.isOpen, props.order, props.labdip],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetForm()
      if (partyStore.parties.length === 0) {
        partyStore.fetchParties()
      }
    }
  },
  { immediate: true }
)

function closeModal() {
  emit('update:isOpen', false)
  emit('close')
}

async function handleSubmit() {
  if (!form.value.labdip_no.trim()) {
    formError.value = 'Labdip Reference No is required'
    return
  }
  if (!form.value.party_name.trim()) {
    formError.value = 'Party Name is required'
    return
  }
  if (form.value.quantity <= 0) {
    formError.value = 'Quantity must be greater than 0'
    return
  }
  if (form.value.rate <= 0) {
    formError.value = 'Rate must be greater than 0'
    return
  }

  const payload = {
    labdip_id: form.value.labdip_id,
    labdip_no: form.value.labdip_no,
    party_name: form.value.party_name,
    quantity: Number(form.value.quantity),
    rate: Number(form.value.rate),
    remarks: form.value.remarks,
  }

  let success = false
  if (isEditing.value && editingId.value) {
    success = await orderStore.updateOrder(editingId.value, payload)
  } else {
    success = await orderStore.createOrder(payload)
  }

  if (success) {
    emit('saved')
    closeModal()
  } else {
    formError.value = orderStore.error || 'Operation failed'
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ isEditing ? 'Edit Order' : 'Create New Order' }}</h2>
          <p v-if="labdip" class="modal-subtitle">Linked to Approved Labdip: <strong>{{ labdip.labdip_no }}</strong></p>
        </div>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="formError" class="alert alert-error">
          <span>{{ formError }}</span>
        </div>

        <div class="form-grid">
          <!-- Labdip Reference No -->
          <div class="form-group">
            <label for="labdip_no">Labdip Reference No *</label>
            <input
              id="labdip_no"
              v-model="form.labdip_no"
              type="text"
              placeholder="e.g. LD-2026-001"
              class="form-control"
              :readonly="!!labdip"
              required
            />
          </div>

          <!-- Party Name -->
          <div class="form-group">
            <label for="party_name">Party Name *</label>
            <div class="party-select-wrapper">
              <select
                v-if="partyStore.parties.length > 0"
                v-model="form.party_name"
                class="form-control"
              >
                <option value="">-- Select from Party Master or Custom --</option>
                <option v-for="p in partyStore.parties" :key="p.id" :value="p.name">
                  {{ p.name }} ({{ p.code }})
                </option>
              </select>
              <input
                id="party_name"
                v-model="form.party_name"
                type="text"
                placeholder="Enter or select Party Name"
                class="form-control"
                required
              />
            </div>
          </div>

          <!-- Quantity -->
          <div class="form-group">
            <label for="quantity">Quantity *</label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 500"
              class="form-control"
              required
            />
          </div>

          <!-- Rate -->
          <div class="form-group">
            <label for="rate">Rate *</label>
            <input
              id="rate"
              v-model.number="form.rate"
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 25.50"
              class="form-control"
              required
            />
          </div>

          <!-- Total Amount Calculation Display -->
          <div class="form-group full-width">
            <div class="total-banner">
              <span>Total Calculated Amount:</span>
              <strong class="total-amount">${{ calculatedTotal }}</strong>
            </div>
          </div>

          <!-- Remarks -->
          <div class="form-group full-width">
            <label for="remarks">Remarks</label>
            <textarea
              id="remarks"
              v-model="form.remarks"
              rows="3"
              placeholder="Enter order notes or shipping specifications..."
              class="form-control textarea-control"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="orderStore.loading">
            <span v-if="orderStore.loading" class="spinner"></span>
            <span v-else>{{ isEditing ? 'Update Order' : 'Save Order' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: var(--modal-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-primary);
}

.modal-form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: span 2;
}

.party-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-control {
  padding: 10px 14px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--input-text);
  outline: none;
  transition: all 0.2s ease;
  background: var(--input-bg);
}

.form-control[readonly] {
  background: var(--bg-surface);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.total-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--total-banner-bg);
  border: 1px solid var(--total-banner-border);
  border-radius: 8px;
  color: var(--total-banner-text);
  font-size: 0.9rem;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-secondary {
  padding: 10px 18px;
  background: var(--btn-sec-bg);
  color: var(--btn-sec-text);
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--btn-sec-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--btn-sec-hover-bg);
  color: var(--btn-sec-hover-text);
}

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.spinner {
  width: 18px;
  height: 18px;
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
