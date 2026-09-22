<script setup>
import { ref, onMounted } from 'vue'
import LabdipFormModal from '../components/Labdip/LabdipFormModal.vue'
import OrderFormModal from '../components/Order/OrderFormModal.vue'
import { useLabdipStore } from '../stores/labdip.js'
import { useQualityStore } from '../stores/quality.js'

const labdipStore = useLabdipStore()
const qualityStore = useQualityStore()

const isModalOpen = ref(false)
const selectedLabdip = ref<Labdip | null>(null)

const isOrderModalOpen = ref(false)
const selectedLabdipForOrder = ref<Labdip | null>(null)

onMounted(() => {
  labdipStore.fetchLabdips()
  qualityStore.fetchQualities()
})

const openAddModal=()=> {
  selectedLabdip.value = null
  isModalOpen.value = true
}

const openEditModal=(labdip)=> {
  selectedLabdip.value = labdip
  isModalOpen.value = true
}

const openCreateOrderModal=(labdip)=> {
  selectedLabdipForOrder.value = labdip
  isOrderModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedLabdip.value = null
}

function closeOrderModal() {
  isOrderModalOpen.value = false
  selectedLabdipForOrder.value = null
}

function getStatusClass(status) {
  switch (status) {
    case 'Approved':
      return 'status-approved'
    case 'Rejected':
      return 'status-rejected'
    case 'In Progress':
      return 'status-in-progress'
    default:
      return 'status-pending'
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Labdip Entries</h1>
        <p class="page-subtitle">Manage labdip tracking, party details, quality & color specifications</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Labdip Entry
      </button>
    </div>

    <!-- Alert Error -->
    <div v-if="labdipStore.error && !isModalOpen" class="alert alert-error">
      <span>{{ labdipStore.error }}</span>
    </div>

    <!-- Data Table Card -->
    <div class="card">
      <div v-if="labdipStore.loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading labdip entries...</span>
      </div>

      <div v-else-if="labdipStore.labdips.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <h3>No Labdip Entries Found</h3>
        <p>Create your first labdip entry to track party requirements and dates.</p>
        <button class="btn-secondary" @click="openAddModal">Create Labdip Entry</button>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Labdip No</th>
              <th>Party Name</th>
              <th>Quality Name</th>
              <th>Color Name</th>
              <th>Status</th>
              <th>Received Date</th>
              <th>Sending Date</th>
              <th>Remarks</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in labdipStore.labdips" :key="item.id">
              <td><span class="labdip-no-badge">{{ item.labdip_no }}</span></td>
              <td class="font-semibold">{{ item.party_name }}</td>
              <td>{{ item.quality_name }}</td>
              <td><span class="color-badge">{{ item.color_name }}</span></td>
              <td><span class="status-badge" :class="getStatusClass(item.status)">{{ item.status }}</span></td>
              <td class="text-muted">{{ item.received_date ? new Date(item.received_date).toLocaleDateString() : '-' }}</td>
              <td class="text-muted">{{ item.sending_date ? new Date(item.sending_date).toLocaleDateString() : '-' }}</td>
              <td class="text-muted remarks-cell">{{ item.remarks || '-' }}</td>
              <td class="text-right">
                <div class="action-buttons">
                  <!-- Create Order Button (Only for Approved status) -->
                  <button
                    v-if="item.status === 'Approved'"
                    class="btn-icon btn-icon-order"
                    title="Create Order for this Approved Labdip"
                    @click="openCreateOrderModal(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </button>
                  <button class="btn-icon btn-icon-edit" title="Edit" @click="openEditModal(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal Form Component -->
    <LabdipFormModal
      v-model:is-open="isModalOpen"
      :labdip="selectedLabdip"
      @close="closeModal"
    />

    <!-- Order Creation Modal Component for Approved Labdip -->
    <OrderFormModal
      v-model:is-open="isOrderModalOpen"
      :labdip="selectedLabdipForOrder"
      @close="closeOrderModal"
    />
  </div>
</template>

<style scoped>
.page-container {
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
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

.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-muted);
  gap: 12px;
}

.empty-state h3 {
  margin: 8px 0 4px;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th {
  background: var(--table-th-bg);
  color: var(--table-th-text);
  font-weight: 600;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.data-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--table-td-border);
  color: var(--text-secondary);
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: var(--table-hover);
}

.labdip-no-badge {
  display: inline-block;
  padding: 3px 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.825rem;
  font-family: monospace;
}

.color-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 0.775rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-pending {
  background: var(--status-pending-bg);
  color: var(--status-pending-text);
}

.status-in-progress {
  background: var(--status-inprogress-bg);
  color: var(--status-inprogress-text);
}

.status-approved {
  background: var(--status-approved-bg);
  color: var(--status-approved-text);
}

.status-rejected {
  background: var(--status-rejected-bg);
  color: var(--status-rejected-text);
}

.remarks-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-semibold {
  font-weight: 600;
  color: var(--text-primary);
}

.text-muted {
  color: var(--text-muted);
}

.text-right {
  text-align: right;
}

.action-buttons {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--btn-icon-border);
  background: var(--btn-icon-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-order {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
}

.btn-icon-order:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.6);
}

.btn-icon-edit {
  color: #3b82f6;
}

.btn-icon-edit:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
}

.btn-icon-delete {
  color: #ef4444;
}

.btn-icon-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 20px;
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
