import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Party {
  id: number
  name: string
  code: string
  created_at?: string
  updated_at?: string
}

export const usePartyStore = defineStore('party', () => {
  const parties = ref<Party[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchParties() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/parties')
      if (response.data.success) {
        parties.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch parties'
    } finally {
      loading.value = false
    }
  }

  async function createParty(data: { name: string; code: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/parties', data)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create party'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateParty(id: number, data: { name: string; code: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/parties/${id}`, data)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update party'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteParty(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/parties/${id}`)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete party'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    parties,
    loading,
    error,
    fetchParties,
    createParty,
    updateParty,
    deleteParty,
  }
})
