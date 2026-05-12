<template>
  <view class="recent-alerts">
    <view class="recent-alerts__header">
      <text class="recent-alerts__title">最近告警</text>
      <text class="recent-alerts__more" @click="handleMore">查看全部</text>
    </view>
    <view v-if="list.length === 0" class="recent-alerts__empty">
      <text>暂无告警记录</text>
    </view>
    <view v-else class="recent-alerts__list">
      <view
        v-for="item in list"
        :key="item.id"
        class="recent-alerts__item"
      >
        <view class="recent-alerts__level" :style="{ background: getLevelColor(item.configLevel) }" />
        <view class="recent-alerts__info">
          <view class="recent-alerts__name">{{ item.configName }}</view>
          <view class="recent-alerts__meta">
            <text>{{ item.deviceName }}</text>
            <text class="recent-alerts__time">{{ formatTime(item.createTime) }}</text>
          </view>
        </view>
        <view v-if="!item.processStatus" class="recent-alerts__tag">未处理</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { AlertRecord } from '@/api/iot/alert'
import { getAlertRecordPage } from '@/api/iot/alert'

const list = ref<AlertRecord[]>([])

const levelColors: Record<number, string> = {
  1: '#3b82f6',
  2: '#22c55e',
  3: '#f97316',
  4: '#ef4444',
  5: '#8b5cf6',
}

function getLevelColor(level: number) {
  return levelColors[level] || '#999'
}

function formatTime(time: string) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function handleMore() {
  // TODO: 跳转告警记录列表页
}

async function loadData() {
  try {
    const res = await getAlertRecordPage({ pageNo: 1, pageSize: 5 })
    list.value = res.list || []
  } catch (e) {
    console.error('加载告警记录失败', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.recent-alerts {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__more {
    font-size: 24rpx;
    color: #018d71;
  }

  &__empty {
    text-align: center;
    padding: 40rpx 0;
    font-size: 24rpx;
    color: #999;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    background: #fafafa;
    border-radius: 12rpx;
  }

  &__level {
    width: 8rpx;
    height: 48rpx;
    border-radius: 4rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #999;
  }

  &__time {
    color: #bbb;
  }

  &__tag {
    font-size: 20rpx;
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.08);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
  }
}
</style>
