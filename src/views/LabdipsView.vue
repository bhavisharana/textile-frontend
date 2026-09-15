<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'
import LabdipFormModal from '../components/Labdip/LabdipFormModal.vue'
import { useLabdipStore, type Labdip } from '../stores/labdip'
import { useQualityStore } from '../stores/quality'

const labdipStore = useLabdipStore()
const qualityStore = useQualityStore()

const isModalOpen = ref(false)
const selectedLabdip = ref<Labdip | null>(null)

onMounted(() => {
  labdipStore.fetchLabdips()
  qualityStore.fetchQualities()
})

function openAddModal() {
  selectedLabdip.value = null
  isModalOpen.value = true
}

function openEditModal(labdip: Labdip) {
  selectedLabdip.value = labdip
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedLabdip.value = null
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

    <!-- Add/Edit Modal Form Component -->
    <LabdipFormModal
      v-model:is-open="isModalOpen"
      :labdip="selectedLabdip"
      @close="closeModal"
    />
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
