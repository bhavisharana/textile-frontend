import { defineStore } from 'pinia'
import { ref } from 'vue'
import { qualityService } from '../services/quality.service'

export const useQualityStore = defineStore('quality', () => {
  const qualities = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchQualities() {
    loading.value = true
    error.value = null
    try {
      const response = await qualityService.getQualities()
      if (response.data.success) {
        qualities.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch qualities'
    } finally {
      loading.value = false
    }
  }

  async function createQuality(data) {
    loading.value = true
    error.value = null
    try {
      const response = await qualityService.createQuality(data)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create quality'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateQuality(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await qualityService.updateQuality(id, data)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update quality'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteQuality(id) {
    loading.value = true
    error.value = null
    try {
      const response = await qualityService.deleteQuality(id)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete quality'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    qualities,
    loading,
    error,
    fetchQualities,
    createQuality,
    updateQuality,
    deleteQuality,
  }
})
