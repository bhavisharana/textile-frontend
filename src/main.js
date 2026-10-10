import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Tooltip from 'primevue/tooltip'
import pinia from './stores'
import router from './router'
import 'primeicons/primeicons.css'
import './assets/tailwind.css'
import './style.css'
import './assets/views.css'
import App from './App.vue'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]',
    },
  },
})
app.directive('tooltip', Tooltip)
app.mount('#app')

