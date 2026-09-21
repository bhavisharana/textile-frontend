<script setup lang="ts">
import AppMenu from './AppMenu.vue'
</script>

<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <AppMenu />
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  flex-shrink: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}
</style>
