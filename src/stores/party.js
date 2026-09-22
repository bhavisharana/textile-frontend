import { defineStore } from 'pinia'
import { ref } from 'vue'
import { partyService } from '../services/party.service'

export const usePartyStore = defineStore('party', () => {
  const parties = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchParties() {
    loading.value = true
    error.value = null
    try {
      const response = await partyService.getParties()
      if (response.data.success) {
        parties.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch parties'
    } finally {
      loading.value = false
    }
  }

  async function createParty(data) {
    loading.value = true
    error.value = null
    try {
      const response = await partyService.createParty(data)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create party'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateParty(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await partyService.updateParty(id, data)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update party'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteParty(id) {
    loading.value = true
    error.value = null
    try {
      const response = await partyService.deleteParty(id)
      if (response.data.success) {
        await fetchParties()
        return true
      }
      return false
    } catch (err) {
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
