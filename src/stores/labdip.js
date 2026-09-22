import { defineStore } from 'pinia'
import { ref } from 'vue'
import { labdipService } from '../services/labdip.service'

export const useLabdipStore = defineStore('labdip', () => {
  const labdips = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchLabdips() {
    loading.value = true
    error.value = null
    try {
      const response = await labdipService.getLabdips()
      if (response.data.success) {
        labdips.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch labdips'
    } finally {
      loading.value = false
    }
  }

  async function createLabdip(data) {
    loading.value = true
    error.value = null
    try {
      const response = await labdipService.createLabdip(data)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create labdip entry'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateLabdip(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await labdipService.updateLabdip(id, data)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update labdip entry'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteLabdip(id) {
    loading.value = true
    error.value = null
    try {
      const response = await labdipService.deleteLabdip(id)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete labdip entry'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    labdips,
    loading,
    error,
    fetchLabdips,
    createLabdip,
    updateLabdip,
    deleteLabdip,
  }
})
