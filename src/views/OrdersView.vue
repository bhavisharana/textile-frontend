<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import OrderFormModal from "../components/Order/OrderFormModal.vue";
import ConfirmationDialog from "../components/common/ConfirmationDialog.vue";
import CreateButton from "../components/common/CreateButton.vue";
import ExportExcelDialog from "../components/common/ExportExcelDialog.vue";
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

const showExportDialog = ref(false);
const openExportDialog = () => {
  showExportDialog.value = true;
};
</script>

<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Orders Tracking</h1>
        <p class="page-subtitle">Track lifecycle stages from placement to delivery with live progress tracking</p>
      </div>
      <CreateButton label="New Order" @click="openAddModal" />
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
              <div class="header-right" style="display: flex; gap: 12px; align-items: center;">
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
                <button
                  class="btn-export"
                  @click="openExportDialog"
                  :disabled="orderStore.orders.length === 0"
                  title="Export to Excel spreadsheet"
                  type="button"
                >
                  <i class="pi pi-file-excel"></i>
                  <span>Export Excel</span>
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

    <!-- Export Excel Dialog -->
    <ExportExcelDialog v-model:is-open="showExportDialog" default-type="orders" />
  </div>
</template>

<style scoped>
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

.id-tag {
  color: var(--primary);
  font-weight: 700;
}

.total-cell {
  color: var(--primary);
  font-weight: 700;
}
</style>
