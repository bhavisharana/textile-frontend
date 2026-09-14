<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <span>&copy; {{ currentYear }} Textile Admin Portal. All rights reserved.</span>
      <span class="version">v1.0.0</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  height: 48px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  color: #64748b;
  font-size: 0.825rem;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version {
  font-weight: 600;
  color: #94a3b8;
}
</style>
