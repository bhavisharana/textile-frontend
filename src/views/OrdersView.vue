<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'
import OrderFormModal from '../components/Order/OrderFormModal.vue'
import { useOrderStore, type Order } from '../stores/order'

const orderStore = useOrderStore()

const isModalOpen = ref(false)
const selectedOrder = ref<Order | null>(null)

onMounted(() => {
  orderStore.fetchOrders()
})

function openAddModal() {
  selectedOrder.value = null
  isModalOpen.value = true
}

function openEditModal(order: Order) {
  selectedOrder.value = order
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedOrder.value = null
}

async function handleDelete(id: number) {
  if (confirm('Are you sure you want to delete this order?')) {
    await orderStore.deleteOrder(id)
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
              <h1 class="page-title">Orders Management</h1>
              <p class="page-subtitle">Track orders created from approved labdips, quantities & billing details</p>
            </div>
            <button class="btn-primary" @click="openAddModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h3>No Orders Found</h3>
              <p>Create an order directly or convert an approved labdip into an order.</p>
              <button class="btn-secondary" @click="openAddModal">Create Order</button>
            </div>

            <div v-else class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Labdip Ref No</th>
                    <th>Party Name</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Total Amount</th>
                    <th>Remarks</th>
                    <th>Date</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in orderStore.orders" :key="item.id">
                    <td><span class="id-tag">#ORD-{{ item.id }}</span></td>
                    <td><span class="labdip-no-badge">{{ item.labdip_no }}</span></td>
                    <td class="font-semibold">{{ item.party_name }}</td>
                    <td class="font-mono">{{ item.quantity }}</td>
                    <td class="font-mono">${{ item.rate.toFixed(2) }}</td>
                    <td class="font-mono total-cell">${{ item.total_amount.toFixed(2) }}</td>
                    <td class="text-muted remarks-cell">{{ item.remarks || '-' }}</td>
                    <td class="text-muted">{{ item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' }}</td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <button class="btn-icon btn-icon-edit" title="Edit" @click="openEditModal(item)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button class="btn-icon btn-icon-delete" title="Delete" @click="handleDelete(item.id)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

    <!-- Add/Edit Modal -->
    <OrderFormModal
      v-model:is-open="isModalOpen"
      :order="selectedOrder"
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

.id-tag {
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.825rem;
  font-family: monospace;
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

.font-semibold {
  font-weight: 600;
  color: #0f172a;
}

.font-mono {
  font-family: monospace;
}

.total-cell {
  color: #4f46e5;
  font-weight: 700;
}

.remarks-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
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
