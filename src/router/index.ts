import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import AppLayout from '../layout/AppLayout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import QualitiesView from '../views/QualitiesView.vue'
import LabdipsView from '../views/LabdipsView.vue'
import PartiesView from '../views/PartiesView.vue'
import OrdersView from '../views/OrdersView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: 'parties',
        name: 'Parties',
        component: PartiesView,
      },
      {
        path: 'qualities',
        name: 'Qualities',
        component: QualitiesView,
      },
      {
        path: 'labdips',
        name: 'Labdips',
        component: LabdipsView,
      },
      {
        path: 'orders',
        name: 'Orders',
        component: OrdersView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
