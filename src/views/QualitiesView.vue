<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import QualityFormModal from '../components/Quality/QualityFormModal.vue'
import ConfirmationDialog from '../components/common/ConfirmationDialog.vue'
import CreateButton from '../components/common/CreateButton.vue'
import { useQualityStore } from '../stores/quality'

const qualityStore = useQualityStore()

const isModalOpen = ref(false)
const selectedQuality = ref(null)
const isConfirmDeleteOpen = ref(false)
const qualityToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
})

onMounted(() => {
  qualityStore.fetchQualities()
})

const openAddModal = () => {
  selectedQuality.value = null
  isModalOpen.value = true
}

const openEditModal = (quality) => {
  selectedQuality.value = quality
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedQuality.value = null
}

const confirmDelete = (id) => {
  qualityToDelete.value = id
  isConfirmDeleteOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (qualityToDelete.value) {
    const success = await qualityStore.deleteQuality(qualityToDelete.value)
    if (success) {
      isConfirmDeleteOpen.value = false
      qualityToDelete.value = null
    }
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
      <CreateButton label="Add Quality" @click="openAddModal" />
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
        <CreateButton label="Add Quality" @click="openAddModal" />
      </div>

      <div v-else class="table-responsive">
        <DataTable
          :value="qualityStore.qualities"
          v-model:filters="filters"
          :globalFilterFields="['id', 'quality_name', 'code']"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
          dataKey="id"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords} entries"
        >
          <template #header>
            <div class="table-header-toolbar">
              <div class="header-left">
                <span class="table-header-title">Qualities List</span>
                <span class="count-badge">{{ qualityStore.qualities.length }}</span>
              </div>
              <div class="search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                  v-model="filters['global'].value"
                  type="text"
                  placeholder="Search qualities..."
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
              <span>No matching qualities found</span>
            </div>
          </template>

          <Column field="id" header="ID">
            <template #body="{ data }">
              <span class="id-tag">#{{ data.id }}</span>
            </template>
          </Column>

          <Column field="quality_name" header="Quality Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.quality_name }}</span>
            </template>
          </Column>

          <Column field="code" header="Code">
            <template #body="{ data }">
              <span class="code-badge">{{ data.code }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Created At">
            <template #body="{ data }">
              <span class="text-muted">{{ data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A' }}</span>
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
    <QualityFormModal
      v-model:is-open="isModalOpen"
      :quality="selectedQuality"
      @close="closeModal"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:is-open="isConfirmDeleteOpen"
      title="Delete Quality"
      confirm-title="Confirm Deletion"
      message="Are you sure you want to proceed with this deletion?"
      :loading="qualityStore.loading"
      @confirm="handleDeleteConfirm"
      @close="qualityToDelete = null"
    />
  </div>
</template>
