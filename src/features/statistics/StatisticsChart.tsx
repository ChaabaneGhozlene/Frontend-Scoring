import axiosInstance from '../../services/axiosInstance'
import type {
  StatisticsFilters,
  StatisticsFilterOptions,
  StatisticsResponse,
} from './statisticsTypes'

export async function fetchStatistics(
  filters: StatisticsFilters
): Promise<StatisticsResponse> {
  const response = await axiosInstance.post('/Statistics/search', filters)
  return response.data
}

export async function fetchStatisticsFilters(): Promise<StatisticsFilterOptions> {
  const response = await axiosInstance.get('/Statistics/filters')
  return response.data
}

export async function exportStatisticsCsv(
  filters: StatisticsFilters
): Promise<void> {
  const response = await axiosInstance.post('/Statistics/export/csv', filters, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'statistics.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}