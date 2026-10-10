<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterService } from '@primevue/core/api'
import LabdipFormModal from '../components/Labdip/LabdipFormModal.vue'
import OrderFormModal from '../components/Order/OrderFormModal.vue'
import CreateButton from '../components/common/CreateButton.vue'
import ExportExcelDialog from '../components/common/ExportExcelDialog.vue'
import { useLabdipStore } from '../stores/labdip.js'
import { useQualityStore } from '../stores/quality.js'
import { usePartyStore } from '../stores/party.js'

const labdipStore = useLabdipStore()
const qualityStore = useQualityStore()
const partyStore = usePartyStore()

const isModalOpen = ref(false)
const selectedLabdip = ref(null)

const isOrderModalOpen = ref(false)
const selectedLabdipForOrder = ref(null)

// Date helper for filter comparison
const parseToDateString = (val) => {
  if (!val) return ''
  if (typeof val === 'string' && val.length >= 10 && val.includes('-')) {
    const prefix = val.substring(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(prefix)) {
      return prefix
    }
  }
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

FilterService.register('date_match', (value, filter) => {
  if (!filter) return true
  if (!value) return false
  const dateStr = parseToDateString(value)
  return dateStr === filter || String(value).startsWith(String(filter))
})

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  party_name: { value: null, matchMode: 'contains' },
  quality_name: { value: null, matchMode: 'contains' },
  status: { value: null, matchMode: 'equals' },
  received_date: { value: null, matchMode: 'date_match' },
  sending_date: { value: null, matchMode: 'date_match' },
})

const statusOptions = ['Pending', 'In Progress', 'Approved', 'Rejected']

const partyOptions = computed(() => {
  const masterParties = partyStore.parties.map((p) => p.name).filter(Boolean)
  const labdipParties = labdipStore.labdips.map((l) => l.party_name).filter(Boolean)
  return Array.from(new Set([...masterParties, ...labdipParties])).sort()
})

const qualityOptions = computed(() => {
  const masterQualities = qualityStore.qualities.map((q) => q.quality_name).filter(Boolean)
  const labdipQualities = labdipStore.labdips.map((l) => l.quality_name).filter(Boolean)
  return Array.from(new Set([...masterQualities, ...labdipQualities])).sort()
})

const hasActiveFilters = computed(() => {
  return Boolean(
    filters.value.global?.value ||
    filters.value.party_name?.value ||
    filters.value.quality_name?.value ||
    filters.value.status?.value ||
    filters.value.received_date?.value ||
    filters.value.sending_date?.value
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.global?.value) count++
  if (filters.value.party_name?.value) count++
  if (filters.value.quality_name?.value) count++
  if (filters.value.status?.value) count++
  if (filters.value.received_date?.value) count++
  if (filters.value.sending_date?.value) count++
  return count
})

const clearAllFilters = () => {
  filters.value.global.value = null
  filters.value.party_name.value = null
  filters.value.quality_name.value = null
  filters.value.status.value = null
  filters.value.received_date.value = null
  filters.value.sending_date.value = null
}

onMounted(() => {
  labdipStore.fetchLabdips()
  qualityStore.fetchQualities()
  partyStore.fetchParties()
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

const closeOrderModal=()=> {
  isOrderModalOpen.value = false
  selectedLabdipForOrder.value = null
}

const dt = ref()
const isExporting = ref(false)

const getStatusClass=(status)=>{
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

const showExportDialog = ref(false)
const openExportDialog = () => {
  showExportDialog.value = true
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
      <CreateButton label="New Labdip Entry" @click="openAddModal" />
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
        <i class="pi pi-search"></i>
        <h3>No Labdip Entries Found</h3>
        <p>Create your first labdip entry to track party requirements and dates.</p>
        <button class="btn-secondary" @click="openAddModal">Create Labdip Entry</button>
      </div>

      <div v-else class="table-responsive">
        <DataTable
          ref="dt"
          :value="labdipStore.labdips"
          v-model:filters="filters"
          :globalFilterFields="['labdip_no', 'party_name', 'quality_name', 'color_name', 'status', 'remarks']"
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
                <span class="table-header-title">Labdip Records</span>
                <span class="count-badge">{{ labdipStore.labdips.length }}</span>
                <span v-if="hasActiveFilters" class="filter-count-badge">
                  <i class="pi pi-filter"></i>
                  {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
                </span>
              </div>
              <div class="header-right">
                <div class="search-box">
                  <i class="pi pi-search search-icon"></i>
                  <input
                    v-model="filters['global'].value"
                    type="text"
                    placeholder="Search labdips..."
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
                <button
                  class="btn-export"
                  @click="openExportDialog"
                  :disabled="labdipStore.labdips.length === 0"
                  title="Export to Excel spreadsheet"
                  type="button"
                >
                  <i class="pi pi-file-excel"></i>
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            <!-- Dedicated Filter Bar for Party, Quality, Status, Received Date, and Sending Date -->
            <div class="table-filters-bar">
              <!-- Party Name Filter -->
              <div class="filter-item">
                <label class="filter-label">Party Name</label>
                <div class="filter-control">
                  <select v-model="filters['party_name'].value" class="filter-select">
                    <option :value="null">All Parties</option>
                    <option v-for="party in partyOptions" :key="party" :value="party">
                      {{ party }}
                    </option>
                  </select>
                  <button
                    v-if="filters['party_name'].value"
                    @click="filters['party_name'].value = null"
                    class="filter-clear-btn"
                    type="button"
                    title="Clear party filter"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Quality Filter -->
              <div class="filter-item">
                <label class="filter-label">Quality</label>
                <div class="filter-control">
                  <select v-model="filters['quality_name'].value" class="filter-select">
                    <option :value="null">All Qualities</option>
                    <option v-for="q in qualityOptions" :key="q" :value="q">
                      {{ q }}
                    </option>
                  </select>
                  <button
                    v-if="filters['quality_name'].value"
                    @click="filters['quality_name'].value = null"
                    class="filter-clear-btn"
                    type="button"
                    title="Clear quality filter"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Status Filter -->
              <div class="filter-item">
                <label class="filter-label">Status</label>
                <div class="filter-control">
                  <select v-model="filters['status'].value" class="filter-select">
                    <option :value="null">All Statuses</option>
                    <option v-for="st in statusOptions" :key="st" :value="st">
                      {{ st }}
                    </option>
                  </select>
                  <button
                    v-if="filters['status'].value"
                    @click="filters['status'].value = null"
                    class="filter-clear-btn"
                    type="button"
                    title="Clear status filter"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Received Date Filter -->
              <div class="filter-item">
                <label class="filter-label">Received Date</label>
                <div class="filter-control">
                  <input
                    type="date"
                    v-model="filters['received_date'].value"
                    class="filter-input-date"
                  />
                  <button
                    v-if="filters['received_date'].value"
                    @click="filters['received_date'].value = null"
                    class="filter-clear-btn"
                    type="button"
                    title="Clear received date"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Sending Date Filter -->
              <div class="filter-item">
                <label class="filter-label">Sending Date</label>
                <div class="filter-control">
                  <input
                    type="date"
                    v-model="filters['sending_date'].value"
                    class="filter-input-date"
                  />
                  <button
                    v-if="filters['sending_date'].value"
                    @click="filters['sending_date'].value = null"
                    class="filter-clear-btn"
                    type="button"
                    title="Clear sending date"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Clear Filters Button -->
              <div class="filter-reset-wrap" v-if="hasActiveFilters">
                <button
                  @click="clearAllFilters"
                  class="btn-reset-filters"
                  type="button"
                  title="Reset all filters"
                >
                  <i class="pi pi-filter-slash"></i>
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="empty-filter-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>No matching labdip entries found</span>
              <button
                v-if="hasActiveFilters"
                class="btn-clear-empty"
                @click="clearAllFilters"
                type="button"
              >
                Clear All Filters
              </button>
            </div>
          </template>

          <Column field="labdip_no" header="Labdip No">
            <template #body="{ data }">
              <span class="labdip-no-badge">{{ data.labdip_no }}</span>
            </template>
          </Column>

          <Column field="party_name" header="Party Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.party_name }}</span>
            </template>
          </Column>

          <Column field="quality_name" header="Quality Name">
            <template #body="{ data }">
              {{ data.quality_name }}
            </template>
          </Column>

          <Column field="color_name" header="Color Name">
            <template #body="{ data }">
              <span class="color-badge">{{ data.color_name }}</span>
            </template>
          </Column>

          <Column field="status" header="Status">
            <template #body="{ data }">
              <span class="status-badge" :class="getStatusClass(data.status)">{{ data.status }}</span>
            </template>
          </Column>

          <Column field="received_date" header="Received Date">
            <template #body="{ data }">
              <span class="text-muted">{{ data.received_date ? new Date(data.received_date).toLocaleDateString() : '-' }}</span>
            </template>
          </Column>

          <Column field="sending_date" header="Sending Date">
            <template #body="{ data }">
              <span class="text-muted">{{ data.sending_date ? new Date(data.sending_date).toLocaleDateString() : '-' }}</span>
            </template>
          </Column>

          <Column field="remarks" header="Remarks">
            <template #body="{ data }">
              <span class="text-muted remarks-cell" :title="data.remarks">{{ data.remarks || '-' }}</span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">
                <!-- Create Order Button (Only for Approved status) -->
                <button class="btn-icon btn-icon-order" v-if="data.status === 'Approved'" v-tooltip.bottom="'Add Order'"
                  @click="openCreateOrderModal(data)"
                >
                  <i class="pi pi-shopping-cart"></i>
                </button>
                <button class="btn-icon btn-icon-edit" v-tooltip.bottom="'Edit'" @click="openEditModal(data)">
                  <i class="pi pi-pencil"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
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
    
    <!-- Export Excel Dialog -->
    <ExportExcelDialog v-model:is-open="showExportDialog" default-type="labdips" />
  </div>
</template>
