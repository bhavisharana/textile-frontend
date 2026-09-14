import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Quality {
  id: number
  quality_name: string
  code: string
  created_at?: string
  updated_at?: string
}

export const useQualityStore = defineStore('quality', () => {
  const qualities = ref<Quality[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchQualities() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/qualities')
      if (response.data.success) {
        qualities.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch qualities'
    } finally {
      loading.value = false
    }
  }

  async function createQuality(data: { quality_name: string; code: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/qualities', data)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create quality'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateQuality(id: number, data: { quality_name: string; code: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/qualities/${id}`, data)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update quality'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteQuality(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/qualities/${id}`)
      if (response.data.success) {
        await fetchQualities()
        return true
      }
      return false
    } catch (err: any) {
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
