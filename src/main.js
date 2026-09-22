import { createApp } from 'vue'
import pinia from './stores'
import router from './router/index.ts'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
