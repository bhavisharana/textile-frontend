import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = (localStorage.getItem('theme') as ThemeMode) || 'dark'
  const theme = ref<ThemeMode>(storedTheme)

  function applyTheme(newTheme: ThemeMode) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function toggleTheme() {
    const nextTheme: ThemeMode = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  return {
    theme,
    toggleTheme,
    initTheme,
    applyTheme,
  }
})
