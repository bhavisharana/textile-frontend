import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardService } from '../services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardService.getDashboardStats()
      if (response?.success) {
        stats.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard statistics'
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
