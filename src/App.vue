<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    await authStore.checkAuth()
  }
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
