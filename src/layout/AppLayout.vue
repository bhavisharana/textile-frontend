<script setup lang="ts">
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
</script>

<template>
  <div class="layout-container">
    <AppTopbar />
    <div class="layout-body">
      <AppSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-main);
  transition: background-color 0.3s ease;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
</style>
