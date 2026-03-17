import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface DashboardStats {
  totalRecordings:      number
  pendingEvaluations:   number
  completedEvaluations: number
  activeUsers:          number
}

interface DashboardState {
  stats:     DashboardStats
  isLoading: boolean
  error:     string | null
}

const initialState: DashboardState = {
  stats: {
    totalRecordings:      1284,
    pendingEvaluations:   47,
    completedEvaluations: 892,
    activeUsers:          23,
  },
  isLoading: false,
  error:     null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchStatsRequest: (state) => {
      state.isLoading = true
      state.error     = null
    },
    fetchStatsSuccess: (state, action: PayloadAction<DashboardStats>) => {
      state.isLoading = false
      state.stats     = action.payload
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error     = action.payload
    },
  },
})

export const { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } = dashboardSlice.actions
export default dashboardSlice.reducer