<script setup lang="ts">
import { useRoute } from 'vue-router'

interface MenuItem {
  label?: string
  icon?: string
  to?: string
  items?: MenuItem[]
  separator?: boolean
  description?: string
  permission?: string
}

interface Props {
  item: MenuItem
  index?: number
  root?: boolean
  parentItemKey?: string | null
}

withDefaults(defineProps<Props>(), {
  index: 0,
  root: true,
  parentItemKey: null,
})

const route = useRoute()
</script>

<template>
  <li :class="{ 'layout-root-menuitem': root }">
    <!-- Section Header for root items -->
    <div v-if="root && item.label" class="layout-menuitem-root-text">
      {{ item.label }}
    </div>

    <!-- Router Link for direct items -->
    <router-link v-if="item.to" :to="item.to" class="nav-item" :class="{ active: route.path === item.to }">
      <i v-if="item.icon" :class="item.icon" class="layout-menuitem-icon"></i>
      <span>{{ item.label }}</span>
    </router-link>

    <!-- Submenu items list if item has child items -->
    <ul v-if="item.items && item.items.length > 0" class="layout-submenu">
      <app-menu-item
        v-for="(child, i) in item.items"
        :key="child.to || child.label || i"
        :item="child"
        :index="i"
        :root="false"
      />
    </ul>
  </li>
</template>

<style scoped>
li {
  list-style: none;
}

.layout-menuitem-root-text {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 12px 12px 6px;
  text-transform: uppercase;
}

.layout-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.925rem;
  transition: all 0.2s ease;
}

.layout-menuitem-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.nav-item:hover {
  background: var(--bg-sidebar-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
}
</style>
