<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

interface MenuItem {
  label?: string
  icon?: string
  to?: string
  items?: MenuItem[]
  separator?: boolean
  description?: string
  permission?: string
}

const model = ref<MenuItem[]>([
  {
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-home',
        to: '/dashboard',
        description: 'Dashboard'
      },
      {
        label: 'Party Master',
        icon: 'pi pi-fw pi-users',
        to: '/parties',
        description: 'Manage Party Master'
      },
      {
        label: 'Quality Master',
        icon: 'pi pi-fw pi-box',
        to: '/qualities',
        description: 'Manage Quality Master'
      },
      {
        label: 'Labdip Entries',
        icon: 'pi pi-fw pi-file',
        to: '/labdips',
        description: 'Labdip Entries'
      },
      {
        label: 'Orders',
        icon: 'pi pi-fw pi-shopping-cart',
        to: '/orders',
        description: 'Manage Orders'
      }
    ]
  }
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item.label || i">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style scoped>
.layout-menu {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
