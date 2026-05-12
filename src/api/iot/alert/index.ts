import type { PageParam, PageResult } from '@/http/types'
import { http } from '@/http/http'

/** 告警记录 */
export interface AlertRecord {
  id: number
  configId: number
  configName: string
  configLevel: number
  deviceId: number
  deviceName: string
  productId: number
  productName: string
  deviceMessage: string
  processStatus: boolean
  processRemark: string
  processTime: string
  createTime: string
}

/** 获取告警记录分页列表 */
export function getAlertRecordPage(params: PageParam) {
  return http.get<PageResult<AlertRecord>>('/iot/alert-record/page', params)
}
