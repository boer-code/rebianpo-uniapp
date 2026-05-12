<template>
  <view class="stat-card" :style="{ background: bgColor }">
    <view class="stat-card__icon">
      <view :class="icon" class="text-24px" :style="{ color: iconColor }" />
    </view>
    <view class="stat-card__content">
      <view class="stat-card__value">{{ value }}</view>
      <view class="stat-card__label">{{ title }}</view>
    </view>
    <view v-if="todayCount > 0" class="stat-card__badge">
      今日+{{ todayCount }}
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  value: number
  todayCount?: number
  icon: string
  iconColor: string
  bgColor: string
}>()
</script>

<style lang="scss" scoped>
.stat-card {
  position: relative;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  overflow: hidden;

  &__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__value {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.2;
  }

  &__label {
    font-size: 24rpx;
    color: #666;
    margin-top: 4rpx;
  }

  &__badge {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    font-size: 20rpx;
    color: #018d71;
    background: rgba(1, 141, 113, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
  }
}
</style>
