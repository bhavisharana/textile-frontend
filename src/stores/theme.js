import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useThemeStore = defineStore('theme', () => {
  const storedTheme = (localStorage.getItem('theme')) || 'dark'
  const theme = ref(storedTheme)

  function applyTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function toggleTheme() {
    const nextTheme = theme.value === 'dark' ? 'light' : 'dark'
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
