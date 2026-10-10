<script setup>
import { ref, computed, watch } from 'vue';
import BasicDialog from './BasicDialog.vue';
import { usePartyStore } from '../../stores/party';
import { useLabdipStore } from '../../stores/labdip';
import { useOrderStore } from '../../stores/order';
import { filterAndExport } from '../../utils/export';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  defaultType: {
    type: String,
    default: 'labdips' // 'labdips' | 'orders'
  }
});

const emit = defineEmits(['update:isOpen', 'close']);

const partyStore = usePartyStore();
const labdipStore = useLabdipStore();
const orderStore = useOrderStore();

// Form State
const exportType = ref(props.defaultType);
const selectedParty = ref(''); // party_name
const dateFrom = ref('');
const dateTo = ref('');
const dateField = ref('received_date'); // default for labdips

const loading = ref(false);
const error = ref('');

// Load data if not loaded
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    exportType.value = props.defaultType;
    error.value = '';
    
    // Set default dates to current month if empty
    if (!dateFrom.value || !dateTo.value) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      dateTo.value = today.toLocaleDateString('en-CA');
      dateFrom.value = firstDay.toLocaleDateString('en-CA');
    }

    if (!partyStore.parties.length) await partyStore.fetchParties();
    if (!labdipStore.labdips.length) await labdipStore.fetchLabdips();
    if (!orderStore.orders.length) await orderStore.fetchOrders();
    
    updateDateFieldDefault();
  }
});

watch(exportType, () => {
  updateDateFieldDefault();
});

const updateDateFieldDefault = () => {
  if (exportType.value === 'labdips') {
    dateField.value = 'received_date';
  } else {
    dateField.value = 'created_at';
  }
};

const handleReset = () => {
  selectedParty.value = '';
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  dateTo.value = today.toLocaleDateString('en-CA');
  dateFrom.value = firstDay.toLocaleDateString('en-CA');
  updateDateFieldDefault();
  error.value = '';
};

const handleExport = () => {
  error.value = '';
  loading.value = true;
  
  try {
    const data = exportType.value === 'labdips' ? labdipStore.labdips : orderStore.orders;
    
    filterAndExport({
      type: exportType.value,
      data: data,
      partyName: selectedParty.value || null,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      dateField: dateField.value
    });
    
    closeModal();
  } catch (err) {
    error.value = err.message || 'An error occurred during export';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit('update:isOpen', false);
  emit('close');
};
</script>

<template>
  <BasicDialog
    :is-open="isOpen"
    title="Export Report to Excel"
    subtitle="Filter by party and date range to generate a custom report"
    max-width="540px"
    submit-text="Export Excel"
    :loading="loading"
    @update:is-open="closeModal"
    @submit="handleExport"
  >
    <div class="export-form">
      <div v-if="error" class="alert-error">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ error }}</span>
      </div>

      <!-- Export Type Selection -->
      <div class="form-group">
        <label class="form-label">Report Type</label>
        <div class="radio-group-boxes">
          <label class="radio-box" :class="{ active: exportType === 'labdips' }">
            <input type="radio" v-model="exportType" value="labdips" class="hidden-radio" />
            <i class="pi pi-palette radio-icon"></i>
            <span class="radio-text">Labdips</span>
            <div class="active-indicator"></div>
          </label>
          <label class="radio-box" :class="{ active: exportType === 'orders' }">
            <input type="radio" v-model="exportType" value="orders" class="hidden-radio" />
            <i class="pi pi-shopping-bag radio-icon"></i>
            <span class="radio-text">Orders</span>
            <div class="active-indicator"></div>
          </label>
        </div>
      </div>

      <!-- Party Filter -->
      <div class="form-group">
        <label class="form-label">Select Party</label>
        <div class="input-wrapper">
          <i class="pi pi-building input-icon"></i>
          <select v-model="selectedParty" class="form-control with-icon">
            <option value="">All Parties</option>
            <option v-for="party in partyStore.parties" :key="party.id" :value="party.name">
              {{ party.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="date-range-grid">
        <div class="form-group">
          <label class="form-label">Date From</label>
          <div class="input-wrapper">
            <i class="pi pi-calendar input-icon"></i>
            <input type="date" v-model="dateFrom" class="form-control with-icon" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Date To</label>
          <div class="input-wrapper">
            <i class="pi pi-calendar input-icon"></i>
            <input type="date" v-model="dateTo" class="form-control with-icon" />
          </div>
        </div>
      </div>

      <!-- Date Field Selection (Only for Labdips) -->
      <div v-if="exportType === 'labdips'" class="form-group date-field-group">
        <label class="form-label">Filter By Date Field</label>
        <div class="radio-pills">
          <label class="radio-pill" :class="{ active: dateField === 'received_date' }">
            <input type="radio" v-model="dateField" value="received_date" class="hidden-radio" />
            <span>Received Date</span>
          </label>
          <label class="radio-pill" :class="{ active: dateField === 'sending_date' }">
            <input type="radio" v-model="dateField" value="sending_date" class="hidden-radio" />
            <span>Sending Date</span>
          </label>
        </div>
      </div>

      <!-- Orders Date Field (Informational) -->
      <div v-if="exportType === 'orders'" class="form-info-box">
         <i class="pi pi-info-circle"></i>
         <span>Filtering by Order Creation Date (created_at)</span>
      </div>
      
      <!-- Reset Button -->
      <div class="form-actions-row">
         <button type="button" @click="handleReset" class="btn-reset-link">
            <i class="pi pi-refresh"></i> Reset Filters
         </button>
      </div>
    </div>
  </BasicDialog>
</template>

<style scoped>
.export-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

/* Custom Radio Boxes for Report Type */
.radio-group-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.hidden-radio {
  display: none;
}

.radio-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.radio-box:hover {
  border-color: var(--border-hover);
  background: var(--bg-surface-hover);
}

.radio-box.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.radio-icon {
  font-size: 1.25rem;
  color: var(--text-muted);
  transition: color 0.2s;
}

.radio-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.radio-box.active .radio-icon,
.radio-box.active .radio-text {
  color: var(--primary);
}

.active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary);
  opacity: 0;
  transform: scaleY(0.5);
  transition: all 0.2s ease;
}

.radio-box.active .active-indicator {
  opacity: 1;
  transform: scaleY(1);
}

/* Inputs */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-control.with-icon {
  padding-left: 40px;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* Hide default calendar icon on some browsers if we have our own */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
}

:global(.dark) input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
}

/* Grid for dates */
.date-range-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Radio Pills for Date Field */
.radio-pills {
  display: flex;
  gap: 10px;
  background: var(--bg-surface);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.radio-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-pill:hover {
  color: var(--text-primary);
}

.radio-pill.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Info Box */
.form-info-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-surface);
  border-left: 3px solid var(--primary);
  border-radius: 0 6px 6px 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-style: italic;
}

.form-info-box i {
  color: var(--primary);
}

/* Actions */
.form-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.btn-reset-link {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-reset-link:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}
</style>
