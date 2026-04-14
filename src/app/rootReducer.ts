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
import statistiqueReducer    from '../features/statistique/Statistiqueslice'
import dashboardBuilderReducer from '../features/statistique/DashboardSlice'
import sectionStatReducer from '../features/stat/Statistiqueslice';
import type { Reducer }      from '@reduxjs/toolkit'

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
    statistique:     statistiqueReducer,
        dashboardBuilder: dashboardBuilderReducer,  // ← ajouter
  sectionStat:      sectionStatReducer,             // ← neutralise le conflit



})

export default rootReducer