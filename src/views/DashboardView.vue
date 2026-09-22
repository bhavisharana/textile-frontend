<script setup>
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <div class="welcome-badge">Textile Admin Workspace</div>
      <h1>Welcome, {{ authStore.user?.username || "User" }}!</h1>
      <p>You have successfully logged into the Textile Admin portal.</p>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.welcome-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.04);
  max-width: 540px;
  width: 100%;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.welcome-badge {
  display: inline-block;
  padding: 6px 16px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.welcome-card h1 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  color: var(--text-primary);
  font-weight: 700;
}

.welcome-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
}
</style>
