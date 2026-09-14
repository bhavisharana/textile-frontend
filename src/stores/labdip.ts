import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Labdip {
  id: number
  labdip_no: string
  party_name: string
  status: string
  quality_id?: number
  quality_name: string
  color_name: string
  received_date?: string
  sending_date?: string
  remarks?: string
  created_at?: string
  updated_at?: string
}

export interface LabdipInput {
  labdip_no: string
  party_name: string
  status: string
  quality_id?: number | null
  quality_name: string
  color_name: string
  received_date?: string | null
  sending_date?: string | null
  remarks?: string
}

export const useLabdipStore = defineStore('labdip', () => {
  const labdips = ref<Labdip[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchLabdips() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/labdips')
      if (response.data.success) {
        labdips.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch labdips'
    } finally {
      loading.value = false
    }
  }

  async function createLabdip(data: LabdipInput) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/labdips', data)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create labdip entry'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateLabdip(id: number, data: LabdipInput) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/labdips/${id}`, data)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update labdip entry'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteLabdip(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/labdips/${id}`)
      if (response.data.success) {
        await fetchLabdips()
        return true
      }
      return false
    } catch (err: any) {
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
