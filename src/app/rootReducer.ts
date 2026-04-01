import { combineReducers } from '@reduxjs/toolkit'
import authReducer      from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/dashboardslice'
import recordingsReducer from '../features/recordings/Recordingslice'
import configurationReducer from '../features/Configuration/Campagnes/ConfigurationCampagnesslice'
import agentTeamReducer from '../features/Configuration/AgentTeamConfig/AgentTeamSlice'; // ← AJOUTER
import agentMailConfigReducer from '../features/Configuration/AgentMailConfig/AgentMailConfigSlice'

const rootReducer = combineReducers({
  auth:      authReducer,
  recordings: recordingsReducer,
  dashboard: dashboardReducer,
  configuration: configurationReducer,
  agentTeam:     agentTeamReducer,
  agentMailConfig: agentMailConfigReducer,

})

export default rootReducer