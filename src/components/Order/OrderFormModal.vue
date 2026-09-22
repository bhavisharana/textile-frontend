<script setup>
import { ref, defineProps, defineEmits, computed, watch, onMounted } from 'vue'
import BasicDialog from '../common/BasicDialog.vue'
import { useOrderStore } from '../../stores/order.js'
import { usePartyStore } from '../../stores/party.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
  labdip: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:isOpen', 'close', 'saved']);

const orderStore = useOrderStore()
const partyStore = usePartyStore()

const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  labdip_id: null,
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

const resetForm=()=> {
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

const closeModal=()=> {
  emit('update:isOpen', false)
  emit('close')
}

const handleSubmit=async()=> {
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
  <BasicDialog
    :is-open="isOpen"
    :title="isEditing ? 'Edit Order' : 'Create New Order'"
    :subtitle="labdip ? `Linked to Approved Labdip: ${labdip.labdip_no}` : ''"
    max-width="640px"
    :loading="orderStore.loading"
    :submit-text="isEditing ? 'Update Order' : 'Save Order'"
    @close="closeModal"
    @submit="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="modal-form-content">
      <div v-if="formError" class="alert alert-error">
        <span>{{ formError }}</span>
      </div>

      <div class="form-grid">
        <!-- Labdip Reference No -->
        <div class="form-group">
          <label for="labdip_no">Labdip Reference No *</label>
          <input id="labdip_no" v-model="form.labdip_no" type="text" placeholder="e.g. LD-2026-001" class="form-control" :readonly="!!labdip" required/>
        </div>

        <!-- Party Name -->
        <div class="form-group">
          <label for="party_name">Party Name *</label>
          <div class="party-select-wrapper">
            <select v-if="partyStore.parties.length > 0" v-model="form.party_name" class="form-control">
              <option value="">-- Select from Party Master or Custom --</option>
              <option v-for="p in partyStore.parties" :key="p.id" :value="p.name">
                {{ p.name }} ({{ p.code }})
              </option>
            </select>
            <input id="party_name" v-model="form.party_name" type="text" placeholder="Enter or select Party Name" class="form-control" required/>
          </div>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input id="quantity" v-model.number="form.quantity" type="number" step="any" min="0.01" placeholder="e.g. 500" class="form-control" required/>
        </div>

        <!-- Rate -->
        <div class="form-group">
          <label for="rate">Rate *</label>
          <input id="rate" v-model.number="form.rate" type="number" step="any" min="0.01" placeholder="e.g. 25.50" class="form-control" required/>
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
          <textarea id="remarks" v-model="form.remarks" rows="3" placeholder="Enter order notes or shipping specifications..." class="form-control textarea-control"></textarea>
        </div>
      </div>
    </form>
  </BasicDialog>
</template>

<style scoped>
.modal-form-content {
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

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}
</style>
