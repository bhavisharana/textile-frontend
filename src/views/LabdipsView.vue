<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterService } from '@primevue/core/api'
import LabdipFormModal from '../components/Labdip/LabdipFormModal.vue'
import OrderFormModal from '../components/Order/OrderFormModal.vue'
import CreateButton from '../components/common/CreateButton.vue'
import { useLabdipStore } from '../stores/labdip.js'
import { useQualityStore } from '../stores/quality.js'
import { usePartyStore } from '../stores/party.js'
import { exportJsonToExcel, formatDateForExcel } from '../utils/export.js'

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

const getExportData = () => {
  if (dt.value && Array.isArray(dt.value.processedData) && dt.value.processedData.length > 0) {
    return dt.value.processedData
  }
  const query = filters.value?.global?.value?.trim().toLowerCase()
  const party = filters.value?.party_name?.value
  const quality = filters.value?.quality_name?.value
  const status = filters.value?.status?.value
  const received = filters.value?.received_date?.value
  const sending = filters.value?.sending_date?.value

  return labdipStore.labdips.filter((item) => {
    if (query) {
      const matchGlobal = (
        (item.labdip_no && item.labdip_no.toLowerCase().includes(query)) ||
        (item.party_name && item.party_name.toLowerCase().includes(query)) ||
        (item.quality_name && item.quality_name.toLowerCase().includes(query)) ||
        (item.color_name && item.color_name.toLowerCase().includes(query)) ||
        (item.status && item.status.toLowerCase().includes(query)) ||
        (item.remarks && item.remarks.toLowerCase().includes(query))
      )
      if (!matchGlobal) return false
    }
    if (party && item.party_name !== party && !item.party_name?.includes(party)) return false
    if (quality && item.quality_name !== quality && !item.quality_name?.includes(quality)) return false
    if (status && item.status !== status) return false
    if (received) {
      const itemRec = parseToDateString(item.received_date)
      if (itemRec !== received && !String(item.received_date || '').startsWith(received)) return false
    }
    if (sending) {
      const itemSend = parseToDateString(item.sending_date)
      if (itemSend !== sending && !String(item.sending_date || '').startsWith(sending)) return false
    }
    return true
  })
}

const handleExportExcel = () => {
  try {
    isExporting.value = true
    const records = getExportData()
    if (!records || records.length === 0) {
      alert('No labdip records available to export.')
      return
    }

    const exportRows = records.map((item, index) => ({
      'Sr. No.': index + 1,
      'Labdip No': item.labdip_no || '-',
      'Party Name': item.party_name || '-',
      'Quality Name': item.quality_name || '-',
      'Color Name': item.color_name || '-',
      'Status': item.status || '-',
      'Received Date': formatDateForExcel(item.received_date),
      'Sending Date': formatDateForExcel(item.sending_date),
      'Remarks': item.remarks || '-'
    }))

    const colWidths = [
      { wch: 10 }, // Sr. No.
      { wch: 18 }, // Labdip No
      { wch: 28 }, // Party Name
      { wch: 22 }, // Quality Name
      { wch: 18 }, // Color Name
      { wch: 16 }, // Status
      { wch: 16 }, // Received Date
      { wch: 16 }, // Sending Date
      { wch: 32 }, // Remarks
    ]

    const timestamp = new Date().toISOString().slice(0, 10)
    exportJsonToExcel(exportRows, `Labdips_Report_${timestamp}`, 'Labdips', colWidths)
  } catch (error) {
    console.error('Failed to export labdips:', error)
    alert('Failed to export labdips: ' + (error?.message || 'Unknown error'))
  } finally {
    isExporting.value = false
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
                  @click="handleExportExcel"
                  :disabled="isExporting || labdipStore.labdips.length === 0"
                  title="Export to Excel spreadsheet"
                  type="button"
                >
                  <i :class="isExporting ? 'pi pi-spin pi-spinner' : 'pi pi-file-excel'"></i>
                  <span>{{ isExporting ? 'Exporting...' : 'Export Excel' }}</span>
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #107c41;
  background-color: rgba(16, 124, 65, 0.08);
  border: 1px solid rgba(16, 124, 65, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-export:hover:not(:disabled) {
  background-color: #107c41;
  color: #ffffff;
  border-color: #107c41;
  box-shadow: 0 2px 6px rgba(16, 124, 65, 0.25);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-export i {
  font-size: 0.95rem;
}

/* Dedicated Table Filters Bar */
.table-filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 145px;
  flex: 1 1 145px;
}

.filter-label {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.filter-control {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select,
.filter-input-date {
  width: 100%;
  height: 36px;
  padding: 6px 26px 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 0.825rem;
  outline: none;
  transition: all 0.2s ease;
}

.filter-select:focus,
.filter-input-date:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.filter-clear-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.filter-clear-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.filter-reset-wrap {
  display: flex;
  align-items: flex-end;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-reset-filters:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.filter-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  font-size: 0.725rem;
  font-weight: 600;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary);
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.btn-clear-empty {
  margin-top: 8px;
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-clear-empty:hover {
  background: var(--input-border);
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

:deep(.p-paginator-page),
:deep(.p-paginator-first),
:deep(.p-paginator-prev),
:deep(.p-paginator-next),
:deep(.p-paginator-last) {
  border-radius: 6px;
  color: var(--text-secondary);
  min-width: 32px;
  height: 32px;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

:deep(.p-paginator-page:hover),
:deep(.p-paginator-first:hover),
:deep(.p-paginator-prev:hover),
:deep(.p-paginator-next:hover),
:deep(.p-paginator-last:hover) {
  background: var(--bg-surface);
  color: var(--text-primary);
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
