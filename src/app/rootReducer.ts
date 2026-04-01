import { combineReducers } from '@reduxjs/toolkit'
import authReducer      from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/dashboardslice'
import recordingsReducer from '../features/recordings/Recordingslice'
import configurationReducer from '../features/Configuration/Campagnes/ConfigurationCampagnesslice'
import agentTeamReducer from '../features/Configuration/AgentTeamConfig/AgentTeamSlice'; // ← AJOUTER
import agentMailConfigReducer from '../features/Configuration/AgentMailConfig/AgentMailConfigSlice'
import evaluationReducer from '../features/evaluation/Evaluationslice'
import usersReducer from '../features/Users/userSlice'
import evalReducer from   '../features/eval/Evalslice'
const rootReducer = combineReducers({
  auth:      authReducer,
  recordings: recordingsReducer,
  dashboard: dashboardReducer,
  configuration: configurationReducer,
  agentTeam:     agentTeamReducer,
  agentMailConfig: agentMailConfigReducer,
  evaluation:   evaluationReducer,
    eval:evalReducer,

  Users: usersReducer,
})

export default rootReducer