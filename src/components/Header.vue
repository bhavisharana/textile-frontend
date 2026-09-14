<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="brand">
        <span class="brand-icon">🧵</span>
        <span class="brand-name">Textile Admin</span>
      </div>
    </div>
    <div class="header-right">
      <div class="user-profile" v-if="authStore.user">
        <div class="avatar">{{ authStore.user.username.charAt(0).toUpperCase() }}</div>
        <span class="username">{{ authStore.user.username }}</span>
      </div>
      <button @click="handleLogout" class="btn-logout" title="Logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.25rem;
  color: #1e293b;
}

.brand-icon {
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fff5f5;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
</style>
