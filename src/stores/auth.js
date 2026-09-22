import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null
  )
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        const { token, user } = response.data.data
        token.value = tokenData
        user.value = userData

        localStorage.setItem('token', tokenData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      } else {
        error.value = response.data.message || 'Login failed'
        return false
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'Invalid credentials or server unavailable'
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
        return true
      } else {
        logout()
        return false
      }
    } catch (err) {
      logout()
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})
