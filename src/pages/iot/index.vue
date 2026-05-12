<template>
  <view class="yd-page-container">
    <wd-navbar title="IoT 首页" placeholder safe-area-inset-top fixed />
    <!-- 统计卡片 -->
    <view class="iot-stats">
      <view class="iot-stats__row">
        <view class="flex-1">
          <StatCard
            title="站点数量"
            :value="statsData.productCategoryCount"
            :today-count="statsData.productCategoryTodayCount"
            icon="i-carbon-location"
            icon-color="#3b82f6"
            bg-color="#eff6ff"
          />
        </view>
        <view class="flex-1">
          <StatCard
            title="产品数量"
            :value="statsData.productCount"
            :today-count="statsData.productTodayCount"
            icon="i-carbon-cube"
            icon-color="#f97316"
            bg-color="#fff7ed"
          />
        </view>
      </view>
      <view class="iot-stats__row">
        <view class="flex-1">
          <StatCard
            title="设备数量"
            :value="statsData.deviceCount"
            :today-count="statsData.deviceTodayCount"
            icon="i-carbon-chip"
            icon-color="#8b5cf6"
            bg-color="#f5f3ff"
          />
        </view>
        <view class="flex-1">
          <StatCard
            title="消息总数"
            :value="statsData.deviceMessageCount"
            :today-count="statsData.deviceMessageTodayCount"
            icon="i-carbon-send"
            icon-color="#14b8a6"
            bg-color="#f0fdfa"
          />
        </view>
      </view>
    </view>
    <!-- 设备管理入口 -->
    <view class="iot-section iot-device-entry" @click="goDeviceList">
      <view class="iot-device-entry__left">
        <text class="iot-device-entry__title">设备管理</text>
        <text class="iot-device-entry__desc">查看设备列表与属性趋势</text>
      </view>
      <text class="iot-device-entry__arrow">›</text>
    </view>
    <!-- 设备状态 -->
    <view class="iot-section">
      <DeviceState
        :online-count="statsData.deviceOnlineCount"
        :offline-count="statsData.deviceOfflineCount"
        :inactive-count="statsData.deviceInactiveCount"
      />
    </view>
    <!-- 消息趋势 -->
    <view class="iot-section">
      <MessageTrend />
    </view>
    <!-- 告警概览 -->
    <view class="iot-section">
      <AlertCard :alert-count="statsData.alertRecordCount" />
    </view>
    <!-- 最近告警 -->
    <view class="iot-section">
      <RecentAlerts />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { StatisticsSummaryVO } from '@/api/iot/statistics'
import { getStatisticsSummary } from '@/api/iot/statistics'
import AlertCard from './components/alert-card.vue'
import DeviceState from './components/device-state.vue'
import MessageTrend from './components/message-trend.vue'
import RecentAlerts from './components/recent-alerts.vue'
import StatCard from './components/stat-card.vue'

defineOptions({ name: 'IotHome' })

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const statsData = ref<StatisticsSummaryVO>({
  productCategoryCount: 0,
  productCount: 0,
  deviceCount: 0,
  deviceMessageCount: 0,
  productCategoryTodayCount: 0,
  productTodayCount: 0,
  deviceTodayCount: 0,
  deviceMessageTodayCount: 0,
  deviceOnlineCount: 0,
  deviceOfflineCount: 0,
  deviceInactiveCount: 0,
  alertRecordCount: 0,
  productCategoryDeviceCounts: {},
})

async function loadData() {
  try {
    statsData.value = await getStatisticsSummary()
  } catch (e) {
    console.error('加载IoT统计数据失败', e)
  }
}

function goDeviceList() {
  uni.navigateTo({ url: '/pages/iot/device/index' })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.iot-stats {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  &__row {
    display: flex;
    gap: 20rpx;
  }
}

.iot-section {
  padding: 0 24rpx 24rpx;
}

.iot-device-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin: 0 24rpx 24rpx;
  &__left {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  &__title {
    font-size: 30rpx;
    font-weight: 600;
  }
  &__desc {
    font-size: 24rpx;
    color: #999;
  }
  &__arrow {
    font-size: 36rpx;
    color: #ccc;
  }
}
</style>
