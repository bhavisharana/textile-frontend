<script setup>
import { ref, onMounted } from 'vue'
import { useQualityStore } from '../stores/quality'

const qualityStore = useQualityStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  quality_name: '',
  code: '',
})

const formError = ref(null)

onMounted(() => {
  qualityStore.fetchQualities()
})

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { quality_name: '', code: '' }
  formError.value = null
  isModalOpen.value = true
}

function openEditModal(quality) {
  isEditing.value = true
  editingId.value = quality.id
  form.value = {
    quality_name: quality.quality_name,
    code: quality.code,
  }
  formError.value = null
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSubmit() {
  if (!form.value.quality_name.trim() || !form.value.code.trim()) {
    formError.value = 'Please enter both Quality Name and Code'
    return
  }

  let success = false
  if (isEditing.value && editingId.value) {
    success = await qualityStore.updateQuality(editingId.value, {
      quality_name: form.value.quality_name,
      code: form.value.code,
    })
  } else {
    success = await qualityStore.createQuality({
      quality_name: form.value.quality_name,
      code: form.value.code,
    })
  }

  if (success) {
    closeModal()
  } else {
    formError.value = qualityStore.error || 'Operation failed'
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Quality Master</h1>
        <p class="page-subtitle">Manage fabric qualities and quality codes</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Quality
      </button>
    </div>

    <!-- Alert Error -->
    <div v-if="qualityStore.error && !isModalOpen" class="alert alert-error">
      <span>{{ qualityStore.error }}</span>
    </div>

    <!-- Data Table Card -->
    <div class="card">
      <div v-if="qualityStore.loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading qualities...</span>
      </div>

      <div v-else-if="qualityStore.qualities.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <h3>No Qualities Found</h3>
        <p>Get started by adding your first quality master entry.</p>
        <button class="btn-secondary" @click="openAddModal">Add Quality</button>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Quality Name</th>
              <th>Code</th>
              <th>Created At</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in qualityStore.qualities" :key="item.id">
              <td><span class="id-tag">#{{ item.id }}</span></td>
              <td class="font-semibold">{{ item.quality_name }}</td>
              <td><span class="code-badge">{{ item.code }}</span></td>
              <td class="text-muted">{{ item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' }}</td>
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

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Quality' : 'Add New Quality' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div v-if="formError" class="alert alert-error">
            <span>{{ formError }}</span>
          </div>

          <div class="form-group">
            <label for="quality_name">Quality Name *</label>
            <input
              id="quality_name"
              v-model="form.quality_name"
              type="text"
              placeholder="e.g. Cotton 40s Satin"
              required
            />
          </div>

          <div class="form-group">
            <label for="code">Quality Code *</label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              placeholder="e.g. COT40S"
              required
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="qualityStore.loading">
              <span v-if="qualityStore.loading" class="spinner"></span>
              <span v-else>{{ isEditing ? 'Update Quality' : 'Create Quality' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
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
  font-size: 0.9rem;
}

.data-table th {
  background: var(--table-th-bg);
  color: var(--table-th-text);
  font-weight: 600;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--table-td-border);
  color: var(--text-secondary);
}

.data-table tbody tr:hover {
  background: var(--table-hover);
}

.id-tag {
  color: var(--badge-id-text);
  font-size: 0.825rem;
  font-family: monospace;
}

.font-semibold {
  font-weight: 600;
  color: var(--text-primary);
}

.code-badge {
  display: inline-block;
  padding: 3px 8px;
  background: var(--badge-code-bg);
  color: var(--badge-code-text);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: monospace;
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

/* Modal Styles */
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
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
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
