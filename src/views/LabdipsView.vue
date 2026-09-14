<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'
import { useLabdipStore, type Labdip } from '../stores/labdip'
import { useQualityStore } from '../stores/quality'

const labdipStore = useLabdipStore()
const qualityStore = useQualityStore()

const isModalOpen = ref(false)
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

onMounted(() => {
  labdipStore.fetchLabdips()
  qualityStore.fetchQualities()
})

// Auto-fill quality_name when quality_id is selected from dropdown
watch(() => form.value.quality_id, (newVal) => {
  if (newVal) {
    const selected = qualityStore.qualities.find((q) => q.id === Number(newVal))
    if (selected) {
      form.value.quality_name = selected.quality_name
    }
  }
})

function openAddModal() {
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
  formError.value = null
  isModalOpen.value = true
}

function formatDateForInput(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().split('T')[0]
}

function openEditModal(labdip: Labdip) {
  isEditing.value = true
  editingId.value = labdip.id
  form.value = {
    labdip_no: labdip.labdip_no,
    party_name: labdip.party_name,
    status: labdip.status,
    quality_id: labdip.quality_id || null,
    quality_name: labdip.quality_name,
    color_name: labdip.color_name,
    received_date: formatDateForInput(labdip.received_date),
    sending_date: formatDateForInput(labdip.sending_date),
    remarks: labdip.remarks || '',
  }
  formError.value = null
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSubmit() {
  if (!form.value.labdip_no.trim() || !form.value.party_name.trim() || !form.value.quality_name.trim() || !form.value.color_name.trim()) {
    formError.value = 'Please fill out all required fields (Labdip No, Party Name, Quality Name, Color Name)'
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
    closeModal()
  } else {
    formError.value = labdipStore.error || 'Operation failed'
  }
}


function getStatusClass(status: string) {
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
  <div class="dashboard-layout">
    <Header />
    <div class="dashboard-body">
      <Sidebar />
      <main class="main-content">
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
        </div>
      </main>
    </div>
    <Footer />

    <!-- Add/Edit Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Labdip Entry' : 'Create New Labdip Entry' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div v-if="formError" class="alert alert-error">
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
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="labdipStore.loading">
              <span v-if="labdipStore.loading" class="spinner"></span>
              <span v-else>{{ isEditing ? 'Update Entry' : 'Save Labdip Entry' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
}

.dashboard-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.page-container {
  max-width: 1280px;
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
  color: #0f172a;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #4f46e5;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.btn-secondary {
  padding: 10px 18px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #64748b;
  gap: 12px;
}

.empty-state h3 {
  margin: 8px 0 4px;
  color: #1e293b;
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
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.data-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.labdip-no-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #f1f5f9;
  color: #0f172a;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.825rem;
  font-family: monospace;
}

.color-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fdf4ff;
  color: #86198f;
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
  background: #fef3c7;
  color: #92400e;
}

.status-in-progress {
  background: #e0f2fe;
  color: #075985;
}

.status-approved {
  background: #dcfce7;
  color: #166534;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.remarks-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-semibold {
  font-weight: 600;
  color: #0f172a;
}

.text-muted {
  color: #64748b;
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
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-edit {
  color: #2563eb;
}

.btn-icon-edit:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.btn-icon-delete {
  color: #dc2626;
}

.btn-icon-delete:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 20px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #0f172a;
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

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.quality-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
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
