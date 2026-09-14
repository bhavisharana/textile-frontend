<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)

// Validation Schema using Yup
const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username or Email is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(4, 'Must be at least 4 characters'),
})

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    password: '',
  },
})

const { value: username } = useField<string>('username')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  const success = await authStore.login({
    username: values.username,
    password: values.password,
  })

  if (success) {
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="login-page">
    <div class="glow-bg"></div>
    <div class="grid-overlay"></div>

    <div class="login-wrapper">
      <!-- Top Console Header -->
      <div class="console-header">
        <div class="shield-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <rect x="9" y="10" width="6" height="5" rx="1"></rect>
            <path d="M10 10V8a2 2 0 0 1 4 0v2"></path>
          </svg>
        </div>
        <h1>Admin Console</h1>
      </div>

      <!-- Main Login Card -->
      <div class="login-card">
        <!-- Alert Banner for Errors -->
        <div v-if="authStore.error" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Sign In Form -->
        <form @submit.prevent="onSubmit" class="login-form" novalidate>
          <div class="form-group" :class="{ 'has-error': errors.username }">
            <label for="username">Email / Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter Username"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.password }">
            <label for="password">Password</label>
            <div class="password-input-wrapper">
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter Password"/>
              <button type="button" class="password-toggle" @click="showPassword = !showPassword" title="Toggle password visibility">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Gold Primary Button -->
          <button type="submit" class="btn-primary" :disabled="authStore.loading || isSubmitting">
            <span v-if="authStore.loading || isSubmitting" class="spinner"></span>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Sign In</span>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #080c14;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden;
  padding: 20px;
}

/* Ambient Radial Glow */
.glow-bg {
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 500px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 45%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

/* Background Subtle Grid Pattern */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

.login-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Console Header */
.console-header {
  text-align: center;
  margin-bottom: 24px;
}

.shield-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  margin-bottom: 16px;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
}

.console-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.console-header p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Card Styling */
.login-card {
  width: 100%;
  background: #101622;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
}

/* Error Alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 18px;
}

/* Form Controls */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #cbd5e1;
}

.form-group input {
  width: 100%;
  padding: 11px 14px;
  font-size: 0.9rem;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #0a0e17;
  color: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: #475569;
}

.form-group input:focus {
  border-color: #f59e0b;
  background: #0d121f;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.form-group.has-error input {
  border-color: #ef4444;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.password-toggle:hover {
  color: #cbd5e1;
}

.error-message {
  font-size: 0.775rem;
  color: #f87171;
  font-weight: 500;
}

/* Golden Primary Button */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(180deg, #fcc419 0%, #f59e0b 100%);
  color: #090d16;
  font-size: 0.925rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #fdd043 0%, #fbbf24 100%);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(9, 13, 22, 0.3);
  border-radius: 50%;
  border-top-color: #090d16;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #1e293b;
}

.divider span {
  padding: 0 12px;
  font-size: 0.725rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.05em;
}

/* Google OAuth Button */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #0a0e17;
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background: #141c2c;
  border-color: #334155;
}

/* Static User Demo Helper Banner */
.demo-fill-banner {
  margin-top: 18px;
  padding: 10px 12px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px dashed rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.775rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-fill-banner:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.4);
  color: #f8fafc;
}

.demo-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.demo-fill-banner code {
  color: #fbbf24;
  font-family: monospace;
}

/* Bottom Session Notice */
.session-notice {
  margin-top: 24px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #475569;
  text-transform: uppercase;
}
</style>
