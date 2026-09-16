import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Order {
  id: number
  labdip_id?: number | null
  labdip_no: string
  party_name: string
  quantity: number
  rate: number
  total_amount: number
  remarks?: string
  created_at?: string
  updated_at?: string
}

export interface CreateOrderPayload {
  labdip_id?: number | null
  labdip_no: string
  party_name: string
  quantity: number
  rate: number
  remarks?: string
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/orders')
      if (response.data.success) {
        orders.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data: CreateOrderPayload) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/orders', data)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(id: number, data: CreateOrderPayload) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/orders/${id}`, data)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update order'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/orders/${id}`)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete order'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
  }
})
