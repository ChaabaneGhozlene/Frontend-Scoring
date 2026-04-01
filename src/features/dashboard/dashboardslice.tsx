import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type WidgetKey =
  | 'indicators'
  | 'evalDistribution'
  | 'listeningDistribution'
  | 'auditorEvaluation'
  | 'averageEvolution'
  | 'evaluationsByAuditor'
  | 'listeningsBySupervisor'
  | 'supervisorListenings'
  | 'top5Agents'
  | 'customerConcerns'

interface DashboardState {
  widgets: Record<WidgetKey, boolean>
}

const initialState: DashboardState = {
  widgets: {
    indicators: true,
    evalDistribution: true,
    listeningDistribution: true,
    auditorEvaluation: true,
    averageEvolution: true,
    evaluationsByAuditor: true,
    listeningsBySupervisor: true,
    supervisorListenings: true,
    top5Agents: false,
    customerConcerns: false,
  },
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleWidget: (state, action: PayloadAction<WidgetKey>) => {
      state.widgets[action.payload] = !state.widgets[action.payload]
    },
    setWidgets: (state, action: PayloadAction<Record<WidgetKey, boolean>>) => {
      state.widgets = action.payload
    },
  },
})

export const { toggleWidget, setWidgets } = dashboardSlice.actions
export default dashboardSlice.reducer