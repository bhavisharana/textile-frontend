import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService } from '../services/order.service'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchOrders=async()=>{
    loading.value = true
    error.value = null
    try {
      const response = await orderService.getOrders()
      if (response.data.success) {
        orders.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
    } finally {
      loading.value = false
    }
  }

  const createOrder=async(data)=> {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.createOrder(data)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create order'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateOrder=async(id, data)=> {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.updateOrder(id, data)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update order'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteOrder=async(id)=> {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.deleteOrder(id)
      if (response.data.success) {
        await fetchOrders()
        return true
      }
      return false
    } catch (err) {
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
