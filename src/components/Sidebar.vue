<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <div class="nav-section-title">MAIN MENU</div>
      <router-link to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
        <span>Dashboard</span>
      </router-link>

      <div class="nav-section-title" style="margin-top: 16px;">MANAGEMENT</div>
      <router-link to="/qualities" class="nav-item" :class="{ active: route.path === '/qualities' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span>Quality Master</span>
      </router-link>

      <router-link to="/labdips" class="nav-item" :class="{ active: route.path === '/labdips' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>Labdip Entries</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  background: #0f172a;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  padding: 8px 12px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.925rem;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #1e293b;
  color: #f8fafc;
}

.nav-item.active {
  background: #4f46e5;
  color: #ffffff;
  font-weight: 600;
}
</style>
