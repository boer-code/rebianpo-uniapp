<template>
  <view class="yd-page-container">
    <wd-navbar title="设备管理" placeholder safe-area-inset-top fixed left-arrow @click-left="goBack" />
    <view class="device-search">
      <wd-search v-model="keyword" placeholder="搜索设备名称" @search="handleSearch" @clear="handleSearch" />
      <view class="device-search__filter">
        <view
          v-for="item in stateFilters"
          :key="item.value"
          class="device-search__tag"
          :class="{ 'device-search__tag--active': currentState === item.value }"
          @click="handleFilterState(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
    <view class="device-list">
      <view v-if="loading && list.length === 0" class="device-list__loading">
        <wd-loading />
      </view>
      <view v-else-if="list.length === 0" class="device-list__empty">
        <text>暂无设备</text>
      </view>
      <view
        v-for="item in list"
        :key="item.id"
        class="device-item"
        @click="goDetail(item)"
      >
        <view class="device-item__pic">
          <image v-if="item.picUrl" :src="item.picUrl" mode="aspectFill" class="device-item__img" />
          <view v-else class="device-item__placeholder">
            <text class="i-carbon-chip device-item__icon" />
          </view>
          <view class="device-item__dot" :class="getStateClass(item.state)" />
        </view>
        <view class="device-item__info">
          <view class="device-item__name">{{ item.nickname || item.deviceName }}</view>
          <view class="device-item__meta">
            <text>{{ item.productName }}</text>
            <text class="device-item__time">{{ item.onlineTime ? formatTime(item.onlineTime) : '未上线' }}</text>
          </view>
        </view>
        <view class="device-item__badge" :class="getStateClass(item.state)">
          {{ getStateText(item.state) }}
        </view>
      </view>
      <view v-if="list.length > 0 && hasMore" class="device-list__more" @click="loadMore">
        <text>{{ loading ? '加载中...' : '加载更多' }}</text>
      </view>
    </view>
  </view>
</template>

<!-- SCRIPT_PLACEHOLDER -->

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Device } from '@/api/iot/device'
import { getDevicePage } from '@/api/iot/device'
import { formatPast } from '@/utils/date'

definePage({
  style: { navigationStyle: 'custom' },
})

const keyword = ref('')
const currentState = ref<number | undefined>(undefined)
const list = ref<Device[]>([])
const loading = ref(false)
const pageNo = ref(1)
const hasMore = ref(true)

const stateFilters = [
  { label: '全部', value: undefined },
  { label: '在线', value: 1 },
  { label: '离线', value: 2 },
  { label: '未激活', value: 0 },
]

function getStateClass(state: number) {
  if (state === 1) return 'is-online'
  if (state === 2) return 'is-offline'
  return 'is-inactive'
}

function getStateText(state: number) {
  if (state === 1) return '在线'
  if (state === 2) return '离线'
  return '未激活'
}

function formatTime(time: string) {
  return formatPast(time) || ''
}

function goBack() {
  uni.navigateBack()
}

function goDetail(item: Device) {
  uni.navigateTo({ url: `/pages/iot/device/detail?id=${item.id}&name=${encodeURIComponent(item.nickname || item.deviceName)}` })
}

async function loadData(reset = false) {
  if (loading.value) return
  if (reset) {
    pageNo.value = 1
    hasMore.value = true
    list.value = []
  }
  loading.value = true
  try {
    const params: any = { pageNo: pageNo.value, pageSize: 20 }
    if (keyword.value) params.nickname = keyword.value
    if (currentState.value !== undefined) params.status = currentState.value
    const res = await getDevicePage(params)
    const items = res.list || []
    list.value = reset ? items : [...list.value, ...items]
    hasMore.value = list.value.length < (res.total || 0)
    pageNo.value++
  } catch (e) {
    console.error('加载设备列表失败', e)
  } finally {
    loading.value = false
  }
}

function handleSearch() { loadData(true) }
function handleFilterState(state: number | undefined) {
  currentState.value = state
  loadData(true)
}
function loadMore() {
  if (hasMore.value && !loading.value) loadData()
}

onMounted(() => { loadData(true) })
</script>

<style lang="scss" scoped>
.device-search {
  padding: 16rpx 24rpx;
  background: #fff;

  &__filter {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
  }

  &__tag {
    padding: 8rpx 24rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
    color: #666;
    background: #f5f5f5;

    &--active {
      color: #fff;
      background: #018d71;
    }
  }
}

.device-list {
  padding: 16rpx 24rpx;

  &__loading, &__empty {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: #999;
  }

  &__more {
    text-align: center;
    padding: 24rpx;
    font-size: 24rpx;
    color: #018d71;
  }
}

.device-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;

  &__pic {
    position: relative;
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
  }

  &__img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
  }

  &__placeholder {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    font-size: 40rpx;
    color: #bbb;
  }

  &__dot {
    position: absolute;
    right: -4rpx;
    bottom: -4rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    border: 2rpx solid #fff;

    &.is-online { background: #52c41a; }
    &.is-offline { background: #ff4d4f; }
    &.is-inactive { background: #d9d9d9; }
  }

  &__info { flex: 1; min-width: 0; }

  &__name {
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    gap: 16rpx;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #999;
  }

  &__time { color: #bbb; }

  &__badge {
    font-size: 20rpx;
    flex-shrink: 0;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;

    &.is-online {
      color: #52c41a;
      background: #f6ffed;
    }
    &.is-offline {
      color: #ff4d4f;
      background: #fff2f0;
    }
    &.is-inactive {
      color: #999;
      background: #f5f5f5;
    }
  }
}
</style>
