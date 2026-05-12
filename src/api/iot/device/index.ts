import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 设备信息 */
export interface Device {
  id: number
  deviceName: string
  nickname: string
  productId: number
  productName: string
  deviceType: number
  state: number
  picUrl: string
  onlineTime: string
  offlineTime: string
  createTime: string
}

/** 设备属性详情 */
export interface DevicePropertyDetail {
  identifier: string
  value: string
  updateTime: string
  name: string
  dataType: string
  dataSpecs: { unitName?: string; [key: string]: any } | null
}

/** 设备属性历史记录 */
export interface DevicePropertyHistory {
  identifier: string
  value: string
  updateTime: string
}

/** 获取设备分页列表 */
export function getDevicePage(params: PageParam & { deviceName?: string, status?: number }) {
  return http.get<PageResult<Device>>('/iot/device/page', params)
}

/** 获取设备最新属性 */
export function getLatestDeviceProperties(params: { deviceId: number }) {
  return http.get<DevicePropertyDetail[]>('/iot/device/property/get-latest', params)
}

/** 获取设备属性历史列表 */
export function getHistoryDevicePropertyList(params: { deviceId: number, identifier: string, times: string[] }) {
  return http.get<DevicePropertyHistory[]>('/iot/device/property/history-list', params)
}
