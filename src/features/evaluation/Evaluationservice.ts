import axiosInstance from '../../services/axiosInstance'
import type {
  LsFicheDto, LsSurveyDto, SurveyItemDto,
  UpdateSurveyDto, AgentReportDto, EvaluationListFilterDto,
  EvalViewConfig, CreateEvalViewConfigDto,
} from './Evaluationtypes'

const BASE       = '/evaluation-list'
const VIEWS_BASE = '/viewconfigs'

export interface PaginatedFiches {
  totalCount: number
  page:       number
  pageSize:   number
  items:      LsFicheDto[]
}

export const searchFiches = async (filter: EvaluationListFilterDto): Promise<PaginatedFiches> => {
  const { data } = await axiosInstance.post<PaginatedFiches>(`${BASE}/search`, filter)
  return data
}

export const getSurveysByLsId = async (lsId: number): Promise<LsSurveyDto[]> => {
  const { data } = await axiosInstance.get<LsSurveyDto[]>(`${BASE}/${lsId}/surveys`)
  return data
}

export const getSurveyItems = async (surveyId: number): Promise<SurveyItemDto[]> => {
  const { data } = await axiosInstance.get<SurveyItemDto[]>(`${BASE}/surveys/${surveyId}/items`)
  return data
}

export const updateSurvey = async (surveyId: number, dto: UpdateSurveyDto): Promise<LsSurveyDto> => {
  const { data } = await axiosInstance.put<LsSurveyDto>(`${BASE}/surveys/${surveyId}`, dto)
  return data
}

export const deleteSurvey = async (surveyId: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/surveys/${surveyId}`)
}

export const deleteLsFiche = async (lsId: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/${lsId}`)
}

export const getAgentReport = async (lsId: number, recordDataId?: number): Promise<AgentReportDto> => {
  const { data } = await axiosInstance.get<AgentReportDto>(`${BASE}/${lsId}/agent-report`, {
    params: { recordDataId }
  })
  return data
}

// ── View Configs ──────────────────────────────────────────────────────────────
const EVAL_GROUPE  = 2

export const fetchViewConfigs = async (): Promise<EvalViewConfig[]> => {
  const { data } = await axiosInstance.get<EvalViewConfig[]>(VIEWS_BASE, {
    params: { groupe: EVAL_GROUPE }   // ← filtre par groupe=2
  })
  return data
}

export const createViewConfig = async (dto: CreateEvalViewConfigDto): Promise<EvalViewConfig> => {
  console.log('=== CREATE VIEW CONFIG API CALL ===')
  console.log('dto envoyé:', dto)
  const { data } = await axiosInstance.post<EvalViewConfig>(VIEWS_BASE, {
    ...dto,
    groupe: EVAL_GROUPE,
  })
  console.log('réponse API:', data)
  return data
}

export const updateViewConfig = async (id: number, layoutJson: string): Promise<EvalViewConfig> => {
  const { data } = await axiosInstance.put<EvalViewConfig>(`${VIEWS_BASE}/${id}`, { layoutJson })
  return data
}

export const deleteViewConfig = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${VIEWS_BASE}/${id}`)
}
export const exportEvaluations = async (params: {
  dateDebut:     string,
  dateFin:       string,
  filterId?:     number,
  columnFilters: unknown[],              // ← ajoute
  page:          number,
  pageSize:      number,
}): Promise<Blob> => {
  const { data } = await axiosInstance.post(
    `${BASE}/export`,
    {
      dateDebut:     params.dateDebut,
      dateFin:       params.dateFin,
      filterId:      params.filterId ?? null,
      columnFilters: params.columnFilters,  // ← passe les filtres
      page:          1,
      pageSize:      99999,
    },
    { responseType: 'blob' }
  )
  return data
}