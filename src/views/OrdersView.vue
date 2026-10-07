<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import OrderFormModal from "../components/Order/OrderFormModal.vue";
import ConfirmationDialog from "../components/common/ConfirmationDialog.vue";
import { useOrderStore } from "../stores/order.js";

const orderStore = useOrderStore();

const isModalOpen = ref(false);
const selectedOrder = ref(null);
const expandedRows = ref({});
const selectedStatusFilter = ref("ALL");
const isConfirmDeleteOpen = ref(false);
const orderToDelete = ref(null);

const filters = ref({
  global: { value: null, matchMode: "contains" },
});

onMounted(() => {
  orderStore.fetchOrders();
});

const openAddModal = () => {
  selectedOrder.value = null;
  isModalOpen.value = true;
};

const openEditModal = (order) => {
  selectedOrder.value = order;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const confirmDelete = (id) => {
  orderToDelete.value = id;
  isConfirmDeleteOpen.value = true;
};

const handleDeleteConfirm = async () => {
  if (orderToDelete.value) {
    const success = await orderStore.deleteOrder(orderToDelete.value);
    if (success) {
      isConfirmDeleteOpen.value = false;
      orderToDelete.value = null;
    }
  }
};

// Status calculation helpers
const statusCounts = computed(() => {
  const counts = {
    ALL: orderStore.orders.length,
    Pending: 0,
    Processing: 0,
    Dispatched: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  for (const o of orderStore.orders) {
    const s = o.status || "Pending";
    if (counts[s] !== undefined) {
      counts[s]++;
    }
  }
  return counts;
});

const filteredOrders = computed(() => {
  if (selectedStatusFilter.value === "ALL") {
    return orderStore.orders;
  }
  return orderStore.orders.filter(
    (o) => (o.status || "Pending") === selectedStatusFilter.value,
  );
});

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Pending":
      return "badge-pending";
    case "Processing":
      return "badge-processing";
    case "Dispatched":
      return "badge-dispatched";
    case "Delivered":
      return "badge-delivered";
    case "Cancelled":
      return "badge-cancelled";
    default:
      return "badge-pending";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Pending":
      return "pi pi-clock";
    case "Processing":
      return "pi pi-cog";
    case "Dispatched":
      return "pi pi-send";
    case "Delivered":
      return "pi pi-check-circle";
    case "Cancelled":
      return "pi pi-times-circle";
    default:
      return "pi pi-circle";
  }
};
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Orders Tracking</h1>
        <p class="page-subtitle">
          Track lifecycle stages from placement to delivery with live progress
          tracking
        </p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <i class="pi pi-plus"></i>
        New Order
      </button>
    </div>

    <!-- Metrics Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-blue">
          <i class="pi pi-shopping-bag"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Total Orders</span>
          <h3 class="kpi-value">{{ orderStore.orders.length }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-cyan">
          <i class="pi pi-cog"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">In Production</span>
          <h3 class="kpi-value">{{ statusCounts["Processing"] }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-purple">
          <i class="pi pi-send"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Dispatched</span>
          <h3 class="kpi-value">{{ statusCounts["Dispatched"] }}</h3>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-green">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Delivered</span>
          <h3 class="kpi-value">{{ statusCounts["Delivered"] }}</h3>
        </div>
      </div>
    </div>

    <!-- Status Tabs Filter (Group By Status) -->
    <div class="status-tabs-container">
      <button
        class="status-tab"
        :class="{ active: selectedStatusFilter === 'ALL' }"
        @click="selectedStatusFilter = 'ALL'"
      >
        <span>All Orders</span>
        <span class="tab-badge">{{ statusCounts["ALL"] }}</span>
      </button>

      <button
        class="status-tab tab-pending"
        :class="{ active: selectedStatusFilter === 'Pending' }"
        @click="selectedStatusFilter = 'Pending'"
      >
        <i class="pi pi-clock"></i>
        <span>Pending</span>
        <span class="tab-badge">{{ statusCounts["Pending"] }}</span>
      </button>

      <button
        class="status-tab tab-processing"
        :class="{ active: selectedStatusFilter === 'Processing' }"
        @click="selectedStatusFilter = 'Processing'"
      >
        <i class="pi pi-cog"></i>
        <span>Processing</span>
        <span class="tab-badge">{{ statusCounts["Processing"] }}</span>
      </button>

      <button
        class="status-tab tab-dispatched"
        :class="{ active: selectedStatusFilter === 'Dispatched' }"
        @click="selectedStatusFilter = 'Dispatched'"
      >
        <i class="pi pi-send"></i>
        <span>Dispatched</span>
        <span class="tab-badge">{{ statusCounts["Dispatched"] }}</span>
      </button>

      <button
        class="status-tab tab-delivered"
        :class="{ active: selectedStatusFilter === 'Delivered' }"
        @click="selectedStatusFilter = 'Delivered'"
      >
        <i class="pi pi-check-circle"></i>
        <span>Delivered</span>
        <span class="tab-badge">{{ statusCounts["Delivered"] }}</span>
      </button>

      <button
        class="status-tab tab-cancelled"
        :class="{ active: selectedStatusFilter === 'Cancelled' }"
        @click="selectedStatusFilter = 'Cancelled'"
      >
        <i class="pi pi-times-circle"></i>
        <span>Cancelled</span>
        <span class="tab-badge">{{ statusCounts["Cancelled"] }}</span>
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

      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <i class="pi pi-shopping-cart" style="font-size: 3rem"></i>
        <h3>
          No
          {{ selectedStatusFilter !== "ALL" ? selectedStatusFilter : "" }}
          Orders Found
        </h3>
        <p v-if="selectedStatusFilter !== 'ALL'">
          Try selecting another status tab or clear filters.
        </p>
      </div>

      <div v-else class="table-responsive">
        <DataTable
          v-model:expandedRows="expandedRows"
          :value="filteredOrders"
          v-model:filters="filters"
          :globalFilterFields="[
            'id',
            'labdip_no',
            'party_name',
            'quantity',
            'rate',
            'total_amount',
            'status',
            'remarks',
          ]"
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
                <span class="table-header-title">
                  {{
                    selectedStatusFilter === "ALL"
                      ? "All Orders"
                      : `${selectedStatusFilter} Orders`
                  }}
                </span>
                <span class="count-badge">{{ filteredOrders.length }}</span>
              </div>
              <div class="search-box">
                <i class="pi pi-search search-icon"></i>
                <input
                  v-model="filters['global'].value"
                  type="text"
                  placeholder="Search orders, parties, labdips..."
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

          <Column field="labdip_no" header="Labdip Ref">
            <template #body="{ data }">
              <span class="labdip-no-badge">{{ data.labdip_no }}</span>
            </template>
          </Column>

          <Column field="party_name" header="Party Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.party_name }}</span>
            </template>
          </Column>

          <!-- Status with Dropdown Change & Badge -->
          <Column field="status" header="Status & Action">
            <template #body="{ data }">
              <span
                class="status-badge"
                :class="getStatusBadgeClass(data.status)"
              >
                <i :class="getStatusIcon(data.status)"></i>
                {{ data.status || "Pending" }}
              </span>
            </template>
          </Column>

          <Column field="quantity" header="Quantity(MTR)">
            <template #body="{ data }">
              <span class="font-mono">{{
                Number(data.quantity).toLocaleString()
              }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Date">
            <template #body="{ data }">
              <span class="text-muted">{{
                data.created_at
                  ? new Date(data.created_at).toLocaleDateString()
                  : "N/A"
              }}</span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">
                <button
                  class="btn-icon btn-icon-edit"
                  v-tooltip.bottom="'Edit'"
                  @click="openEditModal(data)"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  class="btn-icon btn-icon-delete"
                  v-tooltip.bottom="'Delete'"
                  @click="confirmDelete(data.id)"
                >
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

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:is-open="isConfirmDeleteOpen"
      title="Delete Order"
      confirm-title="Confirm Deletion"
      message="Are you sure you want to proceed with this deletion?"
      :loading="orderStore.loading"
      @confirm="handleDeleteConfirm"
      @close="orderToDelete = null"
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

/* KPI Summary Cards Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-card);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.kpi-card:hover {
  border-color: var(--primary);
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.kpi-icon-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.kpi-icon-cyan {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
}
.kpi-icon-purple {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}
.kpi-icon-green {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.kpi-value {
  margin: 2px 0 0 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Status Tabs Bar */
.status-tabs-container {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 4px;
}

.status-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.status-tab:hover {
  background: var(--bg-surface);
  border-color: var(--border-subtle);
}

.status-tab.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 0.75rem;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.status-tab.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Specific Tab Colors */
.tab-pending.active {
  background: #d97706;
  border-color: #d97706;
}
.tab-processing.active {
  background: #0284c7;
  border-color: #0284c7;
}
.tab-dispatched.active {
  background: #7c3aed;
  border-color: #7c3aed;
}
.tab-delivered.active {
  background: #16a34a;
  border-color: #16a34a;
}
.tab-cancelled.active {
  background: #dc2626;
  border-color: #dc2626;
}

/* Table Card */
.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.loading-state,
.empty-state {
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
  min-width: 280px;
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

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-pending {
  background: var(--status-pending-bg);
  color: var(--status-pending-text);
}

.badge-processing {
  background: var(--status-processing-bg);
  color: var(--status-processing-text);
}

.badge-dispatched {
  background: var(--status-dispatched-bg);
  color: var(--status-dispatched-text);
}

.badge-delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.badge-cancelled {
  background: var(--status-cancelled-bg);
  color: var(--status-cancelled-text);
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

.text-muted {
  color: var(--text-muted);
}

.action-buttons {
  display: inline-flex;
  gap: 6px;
  align-items: center;
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
