export type StatisticRow = {
  recordId: number
  surveyId: number
  recordDataId: number | null
  score: number | null
  campaign: string
  nomAgent: string
  prenomAgent: string
  phoneNumber: string
  agentOid: string
  teamName: string
  teamId: number | null
  callLocalTime: string | null
  dateEval: string | null
  comment: string
}

export type ChartPoint = {
  label: string
  value: number
}

export type StatisticsResponse = {
  rows: StatisticRow[]
  chart: ChartPoint[]
  total: number
}

export type TeamOption = {
  id: number
  description: string
}

export type AgentOption = {
  agentOid: string
  fullName: string
}

export type StatisticsFilterOptions = {
  teams: TeamOption[]
  campaigns: string[]
  agents: AgentOption[]
}

export type StatisticsFilters = {
  from: string
  to: string
  teamId: number | null
  campaign: string
  agentOid: string
  summaryType: 'avg' | 'sum' | 'count' | 'min' | 'max'
  groupBy: 'campaign' | 'agent' | 'date' | 'team'
}