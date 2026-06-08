import { http } from '@/http/http'

import type { DeviceMessageSummaryByDateParams } from './query'

import { serializeDeviceMessageSummaryByDateParams } from './query'

/** 统计摘要数据 */
export interface StatisticsSummaryVO {
  productCategoryCount: number
  productCount: number
  deviceCount: number
  deviceMessageCount: number
  productCategoryTodayCount: number
  productTodayCount: number
  deviceTodayCount: number
  deviceMessageTodayCount: number
  deviceOnlineCount: number
  deviceOfflineCount: number
  deviceInactiveCount: number
  alertRecordCount: number
  productCategoryDeviceCounts: Record<string, number>
}

/** 获取 IoT 统计摘要数据 */
export function getStatisticsSummary() {
  return http.get<StatisticsSummaryVO>('/iot/statistics/get-summary')
}

/** 设备消息统计（按日期） */
export interface DeviceMessageSummaryByDateVO {
  time: string
  upstreamCount: number
  downstreamCount: number
}

/** 获取设备消息统计（按日期） */
export function getDeviceMessageSummaryByDate(params: DeviceMessageSummaryByDateParams) {
  return http.get<DeviceMessageSummaryByDateVO[]>(
    '/iot/statistics/get-device-message-summary-by-date',
    serializeDeviceMessageSummaryByDateParams(params),
  )
}

export { createLast7DaysDateTimeRange } from './query'
