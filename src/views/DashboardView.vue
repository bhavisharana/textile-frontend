<script setup lang="ts">
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-layout">
    <Header />
    <div class="dashboard-body">
      <Sidebar />
      <main class="main-content">
        <div class="welcome-container">
          <div class="welcome-card">
            <div class="welcome-badge">Textile Admin Workspace</div>
            <h1>Welcome, {{ authStore.user?.username || 'User' }}!</h1>
            <p>You have successfully logged into the Textile Admin portal.</p>
          </div>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
}

.dashboard-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.welcome-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  max-width: 540px;
  width: 100%;
}

.welcome-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.welcome-card h1 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  color: #0f172a;
  font-weight: 700;
}

.welcome-card p {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}
</style>
