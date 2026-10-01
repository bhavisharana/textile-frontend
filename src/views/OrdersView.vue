<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import OrderFormModal from '../components/Order/OrderFormModal.vue'
import { useOrderStore } from '../stores/order.js'

const orderStore = useOrderStore()

const isModalOpen = ref(false)
const selectedOrder = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
})

onMounted(() => {
  orderStore.fetchOrders()
})

const openAddModal=()=> {
  selectedOrder.value = null
  isModalOpen.value = true
}

const openEditModal=(order)=> {
  selectedOrder.value = order
  isModalOpen.value = true
}

const closeModal=()=> {
  isModalOpen.value = false
  selectedOrder.value = null
}

const handleDelete=async(id)=> {
  if (confirm('Are you sure you want to delete this order?')) {
    await orderStore.deleteOrder(id)
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Orders Management</h1>
        <p class="page-subtitle">Track orders created from approved labdips, quantities & billing details</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <i class="pi pi-plus"></i>
        New Order
      </button>
    </div>

    <!-- Alert Error -->
    <div v-if="orderStore.error && !isModalOpen" class="alert alert-error">
      <span>{{ orderStore.error }}</span>
    </div>

    <!-- Data Table Card -->
    <div class="card">
      <div v-if="orderStore.loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading orders...</span>
      </div>

      <div v-else-if="orderStore.orders.length === 0" class="empty-state">
          <i class="pi pi-shopping-cart" style="font-size: 3rem;"></i>
        <h3>No Orders Found</h3>
      </div>

      <div v-else class="table-responsive">
        <DataTable
          :value="orderStore.orders"
          v-model:filters="filters"
          :globalFilterFields="['id', 'labdip_no', 'party_name', 'quantity', 'rate', 'total_amount', 'remarks']"
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
                <span class="table-header-title">Orders List</span>
                <span class="count-badge">{{ orderStore.orders.length }}</span>
              </div>
              <div class="search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                  v-model="filters['global'].value"
                  type="text"
                  placeholder="Search orders..."
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
              <span>No matching orders found</span>
            </div>
          </template>

          <Column field="id" header="Order ID">
            <template #body="{ data }">
              <span class="id-tag">#ORD-{{ data.id }}</span>
            </template>
          </Column>

          <Column field="labdip_no" header="Labdip Ref No">
            <template #body="{ data }">
              <span class="labdip-no-badge">{{ data.labdip_no }}</span>
            </template>
          </Column>

          <Column field="party_name" header="Party Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.party_name }}</span>
            </template>
          </Column>

          <Column field="quantity" header="Quantity">
            <template #body="{ data }">
              <span class="font-mono">{{ data.quantity }}</span>
            </template>
          </Column>

          <Column field="rate" header="Rate">
            <template #body="{ data }">
              <span class="font-mono">${{ Number(data.rate).toFixed(2) }}</span>
            </template>
          </Column>

          <Column field="total_amount" header="Total Amount">
            <template #body="{ data }">
              <span class="font-mono total-cell">${{ Number(data.total_amount).toFixed(2) }}</span>
            </template>
          </Column>

          <Column field="remarks" header="Remarks">
            <template #body="{ data }">
              <span class="text-muted remarks-cell" :title="data.remarks">{{ data.remarks || '-' }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Date">
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
                <button class="btn-icon btn-icon-delete" v-tooltip.bottom="'Delete'" @click="handleDelete(data.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <OrderFormModal
      v-model:is-open="isModalOpen"
      :order="selectedOrder"
      @close="closeModal"
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
  color: var(--primary);
  font-weight: 700;
  font-size: 0.825rem;
  font-family: monospace;
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

.font-semibold {
  font-weight: 600;
  color: var(--text-primary);
}

.font-mono {
  font-family: monospace;
}

.total-cell {
  color: var(--primary);
  font-weight: 700;
}

.remarks-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
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
