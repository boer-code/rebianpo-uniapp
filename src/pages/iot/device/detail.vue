<template>
  <view class="yd-page-container">
    <wd-navbar :title="deviceName" placeholder safe-area-inset-top fixed left-arrow @click-left="goBack" />
    <!-- 最新属性列表 -->
    <view class="prop-section">
      <view class="prop-section__title">设备属性</view>
      <view v-if="propsLoading" class="prop-section__loading"><wd-loading /></view>
      <view v-else-if="properties.length === 0" class="prop-section__empty">暂无属性数据</view>
      <view v-else class="prop-list">
        <view v-for="item in properties" :key="item.identifier" class="prop-item">
          <view class="prop-item__name">{{ item.name }}</view>
          <view class="prop-item__value">{{ item.value }} {{ item.dataSpecs?.unit || '' }}</view>
          <view class="prop-item__time">{{ formatPast(item.updateTime) }}</view>
        </view>
      </view>
    </view>
    <!-- 所有数值属性的今日趋势 -->
    <view v-if="trendLoading" class="trend-section">
      <view class="trend-section__loading"><wd-loading /></view>
    </view>
    <view v-for="(chart, idx) in trendCharts" :key="chart.identifier" class="trend-section">
      <view class="trend-section__header">
        <text class="trend-section__title">{{ chart.name }} (今日)</text>
      </view>
      <view v-if="chart.data.length === 0" class="trend-section__empty">暂无数据</view>
      <view v-else class="trend-section__chart">
        <canvas
          :id="'trendCanvas' + idx"
          :canvas-id="'trendCanvas' + idx"
          class="trend-section__canvas"
          :style="{ width: '100%', height: '280rpx' }"
        />
        <view class="trend-section__xaxis">
          <text v-for="l in chart.labels" :key="l" class="trend-section__xlabel">{{ l }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue'
import type { DevicePropertyDetail, DevicePropertyHistory } from '@/api/iot/device'
import { getHistoryDevicePropertyList, getLatestDeviceProperties } from '@/api/iot/device'
import { formatDateTime, formatPast } from '@/utils/date'

definePage({
  style: { navigationStyle: 'custom' },
})

interface TrendChart {
  identifier: string
  name: string
  color: string
  data: { hour: number; value: number }[]
  labels: string[]
}

const deviceId = ref(0)
const deviceName = ref('')
const properties = ref<DevicePropertyDetail[]>([])
const propsLoading = ref(true)
const trendLoading = ref(false)
const CHART_COLORS = ['#3b82f6', '#52c41a', '#f97316', '#8b5cf6', '#14b8a6', '#f43f5e', '#eab308', '#06b6d4']
const trendCharts = ref<TrendChart[]>([])

function goBack() {
  uni.navigateBack()
}

function isNumeric(val: string) {
  return val !== '' && !isNaN(Number(val))
}

async function loadProperties() {
  propsLoading.value = true
  try {
    properties.value = await getLatestDeviceProperties({ deviceId: deviceId.value }) || []
    await loadAllTrends()
  } catch (e) {
    console.error('加载设备属性失败', e)
  } finally {
    propsLoading.value = false
  }
}

async function loadAllTrends() {
  const numericProps = properties.value.filter(p => isNumeric(p.value))
  if (numericProps.length === 0) return
  trendLoading.value = true
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const times = [formatDateTime(start), formatDateTime(end)]
    const charts: TrendChart[] = []
    for (const prop of numericProps) {
      const raw = await getHistoryDevicePropertyList({
        deviceId: deviceId.value,
        identifier: prop.identifier,
        times,
      }) || []
      const aggregated = aggregateByHour(raw)
      charts.push({
        identifier: prop.identifier,
        name: prop.name,
        color: CHART_COLORS[charts.length % CHART_COLORS.length],
        data: aggregated,
        labels: aggregated.map(d => d.hour % 4 === 0 ? `${String(d.hour).padStart(2, '0')}:00` : ''),
      })
    }
    trendCharts.value = charts
    await nextTick()
    setTimeout(() => drawAllCharts(), 100)
  } catch (e) {
    console.error('加载趋势失败', e)
  } finally {
    trendLoading.value = false
  }
}

function aggregateByHour(raw: DevicePropertyHistory[]): { hour: number; value: number }[] {
  const bucketMap = new Map<number, number[]>()
  for (let h = 0; h <= 22; h += 2) {
    bucketMap.set(h, [])
  }
  for (const item of raw) {
    const d = new Date(item.updateTime)
    const h = d.getHours()
    const bucket = h - (h % 2)
    if (bucketMap.has(bucket)) {
      const val = Number(item.value)
      if (!isNaN(val)) bucketMap.get(bucket)!.push(val)
    }
  }
  const result: { hour: number; value: number }[] = []
  for (const [hour, values] of bucketMap) {
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    result.push({ hour, value: Math.round(avg * 100) / 100 })
  }
  return result
}

function drawAllCharts() {
  trendCharts.value.forEach((chart, idx) => {
    if (chart.data.length === 0) return
    drawChart(`trendCanvas${idx}`, chart.data.map(d => d.value), chart.color)
  })
}

function drawChart(canvasId: string, values: number[], color: string) {
  const query = uni.createSelectorQuery()
  query
    .select(`#${canvasId}`)
    .boundingClientRect((rect: any) => {
      if (!rect) return
      const ctx = uni.createCanvasContext(canvasId)
      const w = rect.width
      const h = rect.height
      const padding = 24
      const max = Math.max(...values, 1)
      const min = Math.min(...values, 0)
      const range = max - min || 1
      const stepX = values.length > 1 ? (w - padding * 2) / (values.length - 1) : 0
      const points: { x: number; y: number; v: number }[] = []
      for (let i = 0; i < values.length; i++) {
        const x = padding + i * stepX
        const y = h - padding - ((values[i] - min) / range) * (h - padding * 2)
        points.push({ x, y, v: values[i] })
      }
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(2)
      ctx.beginPath()
      points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.stroke()
      ctx.setFontSize(10)
      ctx.setTextAlign('center')
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.setFillStyle('#fff')
        ctx.fill()
        ctx.setStrokeStyle(color)
        ctx.stroke()
        if (p.v > 0) {
          ctx.setFillStyle(color)
          ctx.fillText(String(p.v), p.x, p.y - 8)
        }
      }
      ctx.draw()
    })
    .exec()
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const opts = page?.$page?.options || page?.options || {}
  deviceId.value = Number(opts.id) || 0
  deviceName.value = opts.name || '设备详情'
  if (deviceId.value) loadProperties()
})
</script>

<style lang="scss" scoped>
.prop-section {
  margin: 24rpx;
  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
  &__loading,
  &__empty {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 26rpx;
  }
}
.prop-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.prop-item {
  width: calc(50% - 8rpx);
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  &__name {
    font-size: 24rpx;
    color: #666;
  }
  &__value {
    font-size: 32rpx;
    font-weight: 600;
    margin: 8rpx 0;
  }
  &__time {
    font-size: 22rpx;
    color: #999;
  }
}
.trend-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  &__header {
    margin-bottom: 16rpx;
  }
  &__title {
    font-size: 28rpx;
    font-weight: 600;
  }
  &__loading,
  &__empty {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 26rpx;
  }
  &__canvas {
    width: 100%;
    height: 280rpx;
  }
  &__xaxis {
    display: flex;
    justify-content: space-between;
    padding: 8rpx 20rpx 0;
  }
  &__xlabel {
    font-size: 20rpx;
    color: #999;
  }
}
</style>
