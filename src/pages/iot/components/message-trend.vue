<template>
  <view class="message-trend">
    <view class="message-trend__header">
      <text class="message-trend__title">近7天消息趋势</text>
      <view class="message-trend__legend">
        <view class="message-trend__legend-item">
          <view class="message-trend__legend-dot message-trend__legend-dot--up" />
          <text>上行</text>
        </view>
        <view class="message-trend__legend-item">
          <view class="message-trend__legend-dot message-trend__legend-dot--down" />
          <text>下行</text>
        </view>
      </view>
    </view>
    <view v-if="loading" class="message-trend__loading">
      <text>加载中...</text>
    </view>
    <view v-else-if="!hasData" class="message-trend__empty">
      <text>暂无数据</text>
    </view>
    <view v-else class="message-trend__chart">
      <canvas
        id="trendCanvas"
        canvas-id="trendCanvas"
        class="message-trend__canvas"
        :style="{ width: '100%', height: '220rpx' }"
      />
      <!-- 日期底栏 -->
      <view class="message-trend__xaxis">
        <text v-for="label in xLabels" :key="label" class="message-trend__xaxis-label">{{ label }}</text>
      </view>
      <view class="message-trend__summary">
        <view class="message-trend__summary-item">
          <text class="message-trend__summary-value">{{ totalUp }}</text>
          <text class="message-trend__summary-label">上行总数</text>
        </view>
        <view class="message-trend__summary-item">
          <text class="message-trend__summary-value message-trend__summary-value--down">{{ totalDown }}</text>
          <text class="message-trend__summary-label">下行总数</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { DeviceMessageSummaryByDateVO } from '@/api/iot/statistics'
import { computed, nextTick, onMounted, ref } from 'vue'
import { createLast7DaysDateTimeRange, getDeviceMessageSummaryByDate } from '@/api/iot/statistics'

const loading = ref(true)
const dataList = ref<DeviceMessageSummaryByDateVO[]>([])
const xLabels = ref<string[]>([])

const hasData = computed(() => dataList.value.length > 0)
const totalUp = computed(() => dataList.value.reduce((sum, item) => sum + item.upstreamCount, 0))
const totalDown = computed(() => dataList.value.reduce((sum, item) => sum + item.downstreamCount, 0))

function drawChart() {
  const data = dataList.value
  if (!data.length) return

  uni.createSelectorQuery()
    .select('#trendCanvas')
    .boundingClientRect((rect: any) => {
      if (!rect) return
      const dpr = uni.getSystemInfoSync().pixelRatio
      const width = rect.width
      const height = rect.height
      const padding = 20  // 顶部留出空间给数值标签

      const ctx = uni.createCanvasContext('trendCanvas')
      const upValues = data.map(d => d.upstreamCount)
      const downValues = data.map(d => d.downstreamCount)
      const maxVal = Math.max(...upValues, ...downValues, 1)

      const drawLine = (values: number[], color: string) => {
        const stepX = (width - padding * 2) / Math.max(values.length - 1, 1)
        ctx.beginPath()
        ctx.setStrokeStyle(color)
        ctx.setLineWidth(1.5)
        ctx.setLineCap('round')
        ctx.setLineJoin('round')
        values.forEach((val, i) => {
          const x = padding + i * stepX
          const y = height - padding - ((val / maxVal) * (height - padding * 2))
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
        // 数据点 + 数值标签
        values.forEach((val, i) => {
          const x = padding + i * stepX
          const y = height - padding - ((val / maxVal) * (height - padding * 2))
          // 圆点
          ctx.beginPath()
          ctx.setFillStyle('#fff')
          ctx.setStrokeStyle(color)
          ctx.setLineWidth(1.5)
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          // 数值（只在非零时显示，避免全0时密密麻麻）
          if (val > 0) {
            ctx.setFontSize(9)
            ctx.setFillStyle(color)
            ctx.setTextAlign('center')
            ctx.fillText(String(val), x, y - 6)
          }
        })
      }

      ctx.clearRect(0, 0, width, height)
      drawLine(upValues, '#018d71')
      drawLine(downValues, '#3b82f6')
      ctx.draw()
    })
    .exec()
}

async function loadData() {
  loading.value = true
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    const times = createLast7DaysDateTimeRange(now)
    dataList.value = await getDeviceMessageSummaryByDate({ interval: 1, times }) || []
    // 生成近7天日期标签 MM/DD
    xLabels.value = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    await nextTick()
    setTimeout(() => drawChart(), 100)
  } catch (e) {
    console.error('加载消息趋势失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.message-trend {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__legend {
    display: flex;
    gap: 20rpx;
  }

  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    color: #666;
  }

  &__legend-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;

    &--up {
      background: #018d71;
    }

    &--down {
      background: #3b82f6;
    }
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 40rpx 0;
    font-size: 24rpx;
    color: #999;
  }

  &__canvas {
    width: 100%;
    height: 220rpx;
  }

  &__xaxis {
    display: flex;
    justify-content: space-between;
    margin-top: 8rpx;
    padding: 0 4rpx;
  }

  &__xaxis-label {
    font-size: 20rpx;
    color: #bbb;
    flex: 1;
    text-align: center;

    &:first-child { text-align: left; }
    &:last-child { text-align: right; }
  }

  &__summary {
    display: flex;
    gap: 40rpx;
    margin-top: 20rpx;
  }

  &__summary-item {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
  }

  &__summary-value {
    font-size: 32rpx;
    font-weight: 700;
    color: #018d71;

    &--down {
      color: #3b82f6;
    }
  }

  &__summary-label {
    font-size: 22rpx;
    color: #999;
  }
}
</style>
