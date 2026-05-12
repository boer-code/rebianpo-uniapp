<template>
  <view class="device-state">
    <view class="device-state__header">
      <text class="device-state__title">设备状态</text>
      <text class="device-state__total">共 {{ total }} 台</text>
    </view>
    <view class="device-state__bars">
      <view class="device-state__bar-item">
        <view class="device-state__bar-label">
          <view class="device-state__dot device-state__dot--online" />
          <text>在线</text>
        </view>
        <view class="device-state__bar-track">
          <view
            class="device-state__bar-fill device-state__bar-fill--online"
            :style="{ width: onlinePercent + '%' }"
          />
        </view>
        <text class="device-state__bar-value">{{ onlineCount }}</text>
      </view>
      <view class="device-state__bar-item">
        <view class="device-state__bar-label">
          <view class="device-state__dot device-state__dot--offline" />
          <text>离线</text>
        </view>
        <view class="device-state__bar-track">
          <view
            class="device-state__bar-fill device-state__bar-fill--offline"
            :style="{ width: offlinePercent + '%' }"
          />
        </view>
        <text class="device-state__bar-value">{{ offlineCount }}</text>
      </view>
      <view class="device-state__bar-item">
        <view class="device-state__bar-label">
          <view class="device-state__dot device-state__dot--inactive" />
          <text>未激活</text>
        </view>
        <view class="device-state__bar-track">
          <view
            class="device-state__bar-fill device-state__bar-fill--inactive"
            :style="{ width: inactivePercent + '%' }"
          />
        </view>
        <text class="device-state__bar-value">{{ inactiveCount }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  onlineCount: number
  offlineCount: number
  inactiveCount: number
}>()

const total = computed(() => props.onlineCount + props.offlineCount + props.inactiveCount)
const onlinePercent = computed(() => total.value ? (props.onlineCount / total.value) * 100 : 0)
const offlinePercent = computed(() => total.value ? (props.offlineCount / total.value) * 100 : 0)
const inactivePercent = computed(() => total.value ? (props.inactiveCount / total.value) * 100 : 0)
</script>

<style lang="scss" scoped>
.device-state {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__total {
    font-size: 24rpx;
    color: #999;
  }

  &__bars {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__bar-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__bar-label {
    display: flex;
    align-items: center;
    gap: 8rpx;
    width: 120rpx;
    font-size: 24rpx;
    color: #666;
    flex-shrink: 0;
  }

  &__dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;

    &--online { background: #52c41a; }
    &--offline { background: #ff4d4f; }
    &--inactive { background: #d9d9d9; }
  }

  &__bar-track {
    flex: 1;
    height: 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 8rpx;
    transition: width 0.3s ease;

    &--online { background: #52c41a; }
    &--offline { background: #ff4d4f; }
    &--inactive { background: #d9d9d9; }
  }

  &__bar-value {
    width: 80rpx;
    text-align: right;
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
    flex-shrink: 0;
  }
}
</style>
