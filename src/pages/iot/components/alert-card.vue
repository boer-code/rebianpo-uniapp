<template>
  <view class="alert-card">
    <view class="alert-card__header">
      <text class="alert-card__title">告警概览</text>
    </view>
    <view class="alert-card__body">
      <text class="alert-card__desc">累计告警</text>
      <view class="alert-card__count">
        <text class="alert-card__number">{{ alertCount }}</text>
        <text class="alert-card__unit">次</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  alertCount: number
}>()
</script>

<style lang="scss" scoped>
.alert-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;

  &__header {
    margin-bottom: 20rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__body {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
  }

  &__count {
    display: flex;
    align-items: baseline;
    gap: 4rpx;
  }

  &__number {
    font-size: 48rpx;
    font-weight: 700;
    color: #ff4d4f;
  }

  &__unit {
    font-size: 24rpx;
    color: #999;
  }

  &__desc {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
  }
}
</style>
