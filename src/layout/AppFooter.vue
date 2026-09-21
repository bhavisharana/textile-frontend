<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <span>&copy; {{ currentYear }} Textile Admin Portal. All rights reserved.</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  height: 48px;
  background: var(--bg-footer);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  color: var(--text-muted);
  font-size: 0.825rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version {
  font-weight: 600;
  color: var(--text-muted);
}
</style>
