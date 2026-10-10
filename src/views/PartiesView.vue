<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PartyFormModal from '../components/Parties/PartyFormModal.vue'
import ConfirmationDialog from '../components/common/ConfirmationDialog.vue'
import CreateButton from '../components/common/CreateButton.vue'
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
      <CreateButton label="Add Party" @click="openAddModal" />
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
