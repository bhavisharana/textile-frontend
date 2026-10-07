<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PartyFormModal from '../components/Parties/PartyFormModal.vue'
import ConfirmationDialog from '../components/common/ConfirmationDialog.vue'
import { usePartyStore } from '../stores/party'

const partyStore = usePartyStore()

const isModalOpen = ref(false)
const selectedParty = ref(null)
const isConfirmDeleteOpen = ref(false)
const partyToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
})

onMounted(() => {
  partyStore.fetchParties()
})

const openAddModal = () => {
  selectedParty.value = null
  isModalOpen.value = true
}

const openEditModal = (party) => {
  selectedParty.value = party
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedParty.value = null
}

const confirmDelete = (id) => {
  partyToDelete.value = id
  isConfirmDeleteOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (partyToDelete.value) {
    const success = await partyStore.deleteParty(partyToDelete.value)
    if (success) {
      isConfirmDeleteOpen.value = false
      partyToDelete.value = null
    }
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Party Master</h1>
        <p class="page-subtitle">Manage client and vendor party profiles & unique codes</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <i class="pi pi-plus"></i>
        Add Party
      </button>
    </div>

    <!-- Alert Error -->
    <div v-if="partyStore.error && !isModalOpen" class="alert alert-error">
      <span>{{ partyStore.error }}</span>
    </div>

    <!-- Data Table Card -->
    <div class="card">
      <div v-if="partyStore.loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading parties...</span>
      </div>

      <div v-else-if="partyStore.parties.length === 0" class="empty-state">
        <i class="pi pi-search"></i>
        <h3>No Parties Found</h3>
        <p>Get started by adding your first party entry.</p>
        <button class="btn-secondary" @click="openAddModal">Add Party</button>
      </div>

      <div v-else class="table-responsive">
        <DataTable
          :value="partyStore.parties"
          v-model:filters="filters"
          :globalFilterFields="['id', 'name', 'code']"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
          dataKey="id"
          class="custom-datatable"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords} entries"
        >
          <template #header>
            <div class="table-header-toolbar">
              <div class="header-left">
                <span class="table-header-title">Parties List</span>
                <span class="count-badge">{{ partyStore.parties.length }}</span>
              </div>
              <div class="search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                  v-model="filters['global'].value"
                  type="text"
                  placeholder="Search parties..."
                  class="search-input"
                />
                <button
                  v-if="filters['global'].value"
                  class="search-clear-btn"
                  @click="filters['global'].value = ''"
                  title="Clear search"
                  type="button"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="empty-filter-state">
              <i class="pi pi-search"></i>
              <span>No matching parties found</span>
            </div>
          </template>

          <Column field="id" header="ID">
            <template #body="{ data }">
              <span class="id-tag">#{{ data.id }}</span>
            </template>
          </Column>

          <Column field="name" header="Party Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.name }}</span>
            </template>
          </Column>

          <Column field="code" header="Code">
            <template #body="{ data }">
              <span class="code-badge">{{ data.code }}</span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">
                <button class="btn-icon btn-icon-edit" v-tooltip.bottom="'Edit'" @click="openEditModal(data)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-icon btn-icon-delete" v-tooltip.bottom="'Delete'" @click="confirmDelete(data.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Modal Form Component -->
    <PartyFormModal
      v-model:is-open="isModalOpen"
      :party="selectedParty"
      @close="closeModal"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:is-open="isConfirmDeleteOpen"
      title="Delete Party"
      confirm-title="Confirm Deletion"
      message="Are you sure you want to proceed with this deletion?"
      :loading="partyStore.loading"
      @confirm="handleDeleteConfirm"
      @close="partyToDelete = null"
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

/* Table Header Toolbar */
.table-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-header-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 34px 8px 34px;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border-radius: 4px;
}

.search-clear-btn:hover {
  color: var(--text-primary);
}

.empty-filter-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  color: var(--text-muted);
  gap: 10px;
  font-size: 0.9rem;
}

/* Custom PrimeVue DataTable Theming */
:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable-header) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.p-datatable-table) {
  border-collapse: collapse;
  width: 100%;
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--table-th-bg);
  color: var(--table-th-text);
  font-weight: 600;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: background 0.15s ease;
}

:deep(.p-datatable-thead > tr > th.p-sortable-column:hover) {
  background: var(--bg-surface);
  color: var(--text-primary);
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 14px 18px;
  border-bottom: 1px solid var(--table-td-border);
  color: var(--text-secondary);
  white-space: nowrap;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--table-hover) !important;
}

:deep(.p-paginator) {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 12px 18px;
  color: var(--text-secondary);
  gap: 4px;
}

:deep(.p-paginator-page.p-paginator-page-selected) {
  background: var(--primary) !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.p-paginator-current) {
  color: var(--text-muted);
  font-size: 0.85rem;
}

:deep(.p-select),
:deep(.p-dropdown) {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
  border-radius: 6px;
  font-size: 0.85rem;
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

</style>
