import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

export interface User {
  id: number
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null
  )
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: { username: string; password: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        const { token: tokenData, user: userData } = response.data.data
        token.value = tokenData
        user.value = userData

        localStorage.setItem('token', tokenData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      } else {
        error.value = response.data.message || 'Login failed'
        return false
      }
    } catch (err: any) {
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
