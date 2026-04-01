import axiosInstance from '../../services/axiosInstance'

export type DashboardFilter = {
  startDate: string
  endDate: string
}

export type DashboardRow = {
  label: string
  value: number
}

export type DashboardResponse = {
  stats: {
    totalRecordings: number
    totalEvaluations: number
    averageScore: number
  }
  evaluationsByAuditor: DashboardRow[]
  listeningsBySupervisor: DashboardRow[]
  top5Agents: DashboardRow[]
  customerConcerns: DashboardRow[]
}

export async function fetchDashboard(
  filter: DashboardFilter
): Promise<DashboardResponse> {
  const response = await axiosInstance.post('/Dashboard', filter)
  return response.data
}