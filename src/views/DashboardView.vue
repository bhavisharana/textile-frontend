<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import { useAuthStore } from '../stores/auth'
import { useDashboardStore } from '../stores/dashboard'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const themeStore = useThemeStore()

const activeDonutSlice = ref(null)

onMounted(() => {
  dashboardStore.fetchStats()
})

const stats = computed(() => dashboardStore.stats || {})

// Labdips status breakdown
const labdipStatuses = computed(() => {
  const map = stats.value?.labdips_by_status || {}
  const total = stats.value?.total_labdips || 1
  return [
    { label: 'Approved', count: map['Approved'] || 0, color: '#10b981', bg: 'var(--status-approved-bg)', text: 'var(--status-approved-text)' },
    { label: 'In Progress', count: map['In Progress'] || 0, color: '#0284c7', bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
    { label: 'Pending', count: map['Pending'] || 0, color: '#f59e0b', bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)' },
    { label: 'Rejected', count: map['Rejected'] || 0, color: '#ef4444', bg: 'var(--status-rejected-bg)', text: 'var(--status-rejected-text)' },
  ].map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }))
})

// Donut Chart calculations
const circumference = 2 * Math.PI * 70 // ~439.82

const donutSlices = computed(() => {
  const total = stats.value?.total_labdips || 0
  if (total === 0) return []

  let accumulatedPercent = 0
  return labdipStatuses.value.map((item) => {
    const share = item.count / total
    const strokeDash = share * circumference
    const strokeOffset = -accumulatedPercent * circumference
    accumulatedPercent += share

    return {
      ...item,
      dashArray: `${strokeDash} ${circumference - strokeDash}`,
      dashOffset: strokeOffset,
    }
  })
})

// Monthly trends data for bar chart
const monthlyTrends = computed(() => stats.value?.monthly_order_trends || [])

// PrimeVue Bar Chart Data & Options
const barChartData = computed(() => {
  return {
    labels: monthlyTrends.value.map((item) => (item.month ? item.month.split(' ')[0] : '')),
    datasets: [
      {
        label: 'Orders',
        data: monthlyTrends.value.map((item) => item.orders || 0),
        backgroundColor: '#6366f1',
        hoverBackgroundColor: '#4f46e5',
        borderRadius: 6,
        barThickness: 36,
      },
    ],
  }
})

const barChartOptions = computed(() => {
  const isDark = themeStore.theme === 'dark'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipTitle = isDark ? '#ffffff' : '#0f172a'
  const tooltipBody = isDark ? '#cbd5e1' : '#334155'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context) => ` Orders: ${context.parsed.y} lots`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: {
            weight: 500,
            size: 12,
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: textColor,
          precision: 0,
          stepSize: 1,
          font: {
            size: 11,
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        beginAtZero: true,
      },
    },
  }
})

const getOrderStatusClass = (status) => {
  switch (status) {
    case 'Pending': return 'status-pending'
    case 'Processing': return 'status-processing'
    case 'Dispatched': return 'status-dispatched'
    case 'Delivered': return 'status-delivered'
    case 'Cancelled': return 'status-cancelled'
    default: return 'status-pending'
  }
}

const getLabdipStatusClass = (status) => {
  switch (status) {
    case 'Approved': return 'status-approved'
    case 'In Progress': return 'status-inprogress'
    case 'Pending': return 'status-pending'
    case 'Rejected': return 'status-rejected'
    default: return 'status-pending'
  }
}

// Approval rate calculation
const approvalRate = computed(() => {
  const total = stats.value?.total_labdips || 0
  const approved = stats.value?.labdips_by_status?.['Approved'] || 0
  return total > 0 ? Math.round((approved / total) * 100) : 0
})

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Hero / Welcome Banner -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Welcome back, {{ authStore.user?.username || 'Admin' }}!
        </h1>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="dashboardStore.error" class="alert-error">
      <i class="pi pi-exclamation-circle"></i>
      <span>{{ dashboardStore.error }}</span>
    </div>

    <!-- Top KPI Summary Cards Grid -->
    <div class="kpi-grid">
      <!-- Total Parties -->
      <div class="kpi-card" @click="navigateTo('/parties')">
        <div class="kpi-top">
          <span class="kpi-label">Active Parties</span>
          <div class="kpi-icon-box kpi-blue">
            <i class="pi pi-building"></i>
          </div>
        </div>
        <div class="kpi-number-row">
          <h2 class="kpi-number">{{ stats.total_parties ?? 0 }}</h2>
          <span class="kpi-growth-badge">Client Accounts</span>
        </div>
      </div>

      <!-- Labdips Engine -->
      <div class="kpi-card" @click="navigateTo('/labdips')">
        <div class="kpi-top">
          <span class="kpi-label">Labdip Submissions</span>
          <div class="kpi-icon-box kpi-purple">
            <i class="pi pi-palette"></i>
          </div>
        </div>
        <div class="kpi-number-row">
          <h2 class="kpi-number">{{ stats.total_labdips ?? 0 }}</h2>
          <span class="kpi-growth-badge success">{{ approvalRate }}% Approved</span>
        </div>
      </div>

      <!-- Total Orders Pipeline -->
      <div class="kpi-card" @click="navigateTo('/orders')">
        <div class="kpi-top">
          <span class="kpi-label">Orders Pipeline</span>
          <div class="kpi-icon-box kpi-emerald">
            <i class="pi pi-shopping-bag"></i>
          </div>
        </div>
        <div class="kpi-number-row">
          <h2 class="kpi-number">{{ stats.total_orders ?? 0 }}</h2>
          <span class="kpi-growth-badge inprogress">
            {{ (stats.orders_by_status?.['Processing'] ?? 0) + (stats.orders_by_status?.['Dispatched'] ?? 0) }} In-Flight
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="analytics-charts-grid">
      <!-- Chart 1: Labdip Status Distribution Donut -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Labdip Status Distribution</h3>
            <p class="chart-subtitle">Breakdown of labdip testing outcomes & approvals</p>
          </div>
          <span class="chart-badge">Total {{ stats.total_labdips ?? 0 }} Dips</span>
        </div>

        <div class="donut-chart-wrapper">
          <div class="donut-visual-container">
            <svg class="donut-svg" viewBox="0 0 200 200">
              <circle
                class="donut-bg-ring"
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke-width="22"
              />
              <circle
                v-for="(slice, index) in donutSlices"
                :key="slice.label"
                class="donut-segment"
                :class="{ active: activeDonutSlice === index }"
                cx="100"
                cy="100"
                r="70"
                fill="none"
                :stroke="slice.color"
                stroke-width="22"
                :stroke-dasharray="slice.dashArray"
                :stroke-dashoffset="slice.dashOffset"
                transform="rotate(-90 100 100)"
                @mouseenter="activeDonutSlice = index"
                @mouseleave="activeDonutSlice = null"
              />
            </svg>

            <!-- Center Metric -->
            <div class="donut-center-info">
              <span class="donut-center-val">{{ stats.total_labdips ?? 0 }}</span>
              <span class="donut-center-sub">Labdips</span>
            </div>
          </div>

          <!-- Color Legend & Statistics List -->
          <div class="donut-legend-list">
            <div
              v-for="(item, idx) in labdipStatuses"
              :key="item.label"
              class="legend-item"
              :class="{ 'is-hovered': activeDonutSlice === idx }"
              @mouseenter="activeDonutSlice = idx"
              @mouseleave="activeDonutSlice = null"
            >
              <div class="legend-label-col">
                <span class="legend-color-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-name">{{ item.label }}</span>
              </div>
              <div class="legend-numbers-col">
                <strong class="legend-count">{{ item.count }}</strong>
                <span class="legend-percent">({{ item.percent }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart 2: Monthly Trends Bar Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Monthly Order & Volume Trends</h3>
            <p class="chart-subtitle">Order volume over last 6 months</p>
          </div>
          <span class="chart-badge">Order Count</span>
        </div>

        <div class="bar-chart-container">
          <Chart
            type="bar"
            :data="barChartData"
            :options="barChartOptions"
            class="prime-bar-chart"
          />
        </div>
      </div>
    </div>

    <!-- Live Activity Feeds Section (Recent Labdips & Recent Orders) -->
    <div class="activity-feeds-grid">
      <!-- Recent Labdips Feed -->
      <div class="feed-card">
        <div class="feed-header">
          <div class="feed-title-wrap">
            <div class="feed-icon labdip-feed-icon">
              <i class="pi pi-palette"></i>
            </div>
            <div>
              <h3 class="feed-title">Latest Labdip Samples</h3>
              <p class="feed-subtitle">Recently submitted shade approvals</p>
            </div>
          </div>
          <button class="btn-feed-link" @click="navigateTo('/labdips')">
            View All <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <div v-if="!stats.recent_labdips || stats.recent_labdips.length === 0" class="feed-empty">
          <i class="pi pi-inbox"></i>
          <span>No labdip activities recorded</span>
        </div>

        <div v-else class="feed-list">
          <div
            v-for="item in stats.recent_labdips"
            :key="item.id"
            class="feed-row"
            @click="navigateTo('/labdips')"
          >
            <div class="feed-cell-main">
              <div class="feed-badge-row">
                <span class="ref-badge">{{ item.labdip_no }}</span>
                <span class="status-badge" :class="getLabdipStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </div>
              <strong class="feed-party">{{ item.party_name }}</strong>
              <div class="feed-fabric-meta">
                <span>{{ item.quality_name }}</span>
                <span class="dot-separator">&bull;</span>
                <span class="color-tag">
                  <span class="swatch-circle"></span>
                  {{ item.color_name }}
                </span>
              </div>
            </div>

            <div class="feed-cell-date">
              <span>{{ item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Feed with Fulfillment Tracking -->
      <div class="feed-card">
        <div class="feed-header">
          <div class="feed-title-wrap">
            <div class="feed-icon order-feed-icon">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div>
              <h3 class="feed-title">Recent Production Orders</h3>
              <p class="feed-subtitle">Orders in active fulfillment lifecycle</p>
            </div>
          </div>
          <button class="btn-feed-link" @click="navigateTo('/orders')">
            View All <i class="pi pi-arrow-right"></i>
          </button>
        </div>

        <div v-if="!stats.recent_orders || stats.recent_orders.length === 0" class="feed-empty">
          <i class="pi pi-shopping-bag"></i>
          <span>No production orders placed yet</span>
        </div>

        <div v-else class="feed-list">
          <div
            v-for="order in stats.recent_orders"
            :key="order.id"
            class="feed-row"
            @click="navigateTo('/orders')"
          >
            <div class="feed-cell-main">
              <div class="feed-badge-row">
                <span class="order-id-badge">#ORD-{{ order.id }}</span>
                <span class="status-badge" :class="getOrderStatusClass(order.status)">
                  {{ order.status }}
                </span>
                <span class="labdip-ref-small">Ref: {{ order.labdip_no }}</span>
              </div>
              <strong class="feed-party">{{ order.party_name }}</strong>
            </div>

            <div class="feed-cell-amount">
              <span class="feed-qty">{{ Number(order.quantity).toLocaleString() }} units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

/* Hero Section */
.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.hero-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 620px;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-hero-primary {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.btn-hero-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-hero-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-hero-outline:hover {
  background: var(--primary-light);
}

/* KPI Summary Cards Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.kpi-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.highlight-card {
  background: linear-gradient(145deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.04) 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.kpi-blue { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.kpi-purple { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
.kpi-emerald { background: rgba(16, 185, 129, 0.12); color: #10b981; }

.kpi-number-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.kpi-number {
  margin: 0;
  font-size: 1.95rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.kpi-growth-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.kpi-growth-badge.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.kpi-growth-badge.inprogress {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

/* Charts Grid */
.analytics-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .analytics-charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-title {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chart-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chart-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.chart-toggle-group {
  display: flex;
  background: var(--bg-surface);
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.btn-toggle {
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Donut Chart Inner */
.donut-chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 24px;
  padding: 10px 0;
  flex-wrap: wrap;
}

.donut-visual-container {
  position: relative;
  width: 170px;
  height: 170px;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-bg-ring {
  stroke: var(--bg-surface);
}

.donut-segment {
  cursor: pointer;
  transition: stroke-width 0.25s ease, opacity 0.25s ease;
}

.donut-segment:hover,
.donut-segment.active {
  stroke-width: 26;
  opacity: 0.9;
}

.donut-center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.donut-center-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
}

.donut-center-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.donut-legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 180px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.legend-item:hover,
.legend-item.is-hovered {
  background: var(--bg-surface);
}

.legend-label-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.legend-numbers-col {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.legend-count {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.legend-percent {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Trend Bar Chart */
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 230px;
}

.prime-bar-chart {
  width: 100%;
  height: 100%;
}

/* Activity Feeds */
.activity-feeds-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .activity-feeds-grid {
    grid-template-columns: 1fr;
  }
}

.feed-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
}

.feed-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feed-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.labdip-feed-icon { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
.order-feed-icon { background: rgba(16, 185, 129, 0.12); color: #10b981; }

.feed-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.feed-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.775rem;
  color: var(--text-muted);
}

.btn-feed-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: gap 0.2s ease;
}

.btn-feed-link:hover {
  gap: 10px;
}

.feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px;
  color: var(--text-muted);
  gap: 8px;
  font-size: 0.85rem;
}

.feed-list {
  display: flex;
  flex-direction: column;
}

.feed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.feed-row:last-child {
  border-bottom: none;
}

.feed-cell-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.feed-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ref-badge, .order-id-badge {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

.status-approved { background: var(--status-approved-bg); color: var(--status-approved-text); }
.status-inprogress { background: var(--status-inprogress-bg); color: var(--status-inprogress-text); }
.status-pending { background: var(--status-pending-bg); color: var(--status-pending-text); }
.status-rejected { background: var(--status-rejected-bg); color: var(--status-rejected-text); }
.status-processing { background: var(--status-processing-bg); color: var(--status-processing-text); }
.status-dispatched { background: var(--status-dispatched-bg); color: var(--status-dispatched-text); }
.status-delivered { background: var(--status-delivered-bg); color: var(--status-delivered-text); }
.status-cancelled { background: var(--status-cancelled-bg); color: var(--status-cancelled-text); }

.labdip-ref-small {
  font-size: 0.725rem;
  color: var(--text-muted);
}

.feed-party {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.feed-fabric-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.color-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.swatch-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
}

.feed-cell-date {
  font-size: 0.775rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.feed-cell-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}

.feed-amount {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
  font-family: monospace;
}

.feed-qty {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.feed-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  max-width: 200px;
}

.feed-progress-bar {
  flex: 1;
  height: 5px;
  background: var(--bg-surface);
  border-radius: 9999px;
  overflow: hidden;
}

.feed-progress-fill {
  height: 100%;
  border-radius: 9999px;
}

.feed-progress-fill.status-pending { background: #f59e0b; }
.feed-progress-fill.status-processing { background: #0284c7; }
.feed-progress-fill.status-dispatched { background: #8b5cf6; }
.feed-progress-fill.status-delivered { background: #10b981; }
.feed-progress-fill.status-cancelled { background: #ef4444; }

.progress-pct-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
}
</style>
