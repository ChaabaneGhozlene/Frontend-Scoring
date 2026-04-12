// features/eval/Evalservice.ts
import axiosInstance from '../../services/axiosInstance'
import type { ExportBlobParams } from '../exportUtils'
import type { TraceActionDto } from '../recordings/Recordingstypes'

const BASE = '/evaluation'

// ── DTOs ──────────────────────────────────────────────────────────────────

export interface OpenEvaluationRequestDto {
  recordId: number
}

export interface SurveyItemValueDto {
  itemId: number
  value:  number
  memo:   string
}

export interface SaveEvaluationDto {
  surveyId:      number
  items:         SurveyItemValueDto[]   // ← tableau avec itemId
  memo:          string
  memoAction:    string
  categoryId?:   number | null
  callReasonId?: number | null
  ccEmail?:      string | null
}

export interface RequalificationDto {
  recordId:             number
  typeRequalif:         string
  statusRequal?:        number
  statusGroupeRequal?:  number
  statusNumRequal?:     number
  statusDetailRequal?:  number
}

export interface FetchRecordsParams {
  agentOids?:     string[]
  dateDebut?:     string | null
  dateFin?:       string | null
  page?:          number
  pageSize?:      number
  columnFilters?: unknown[]
}

// ── Endpoints ─────────────────────────────────────────────────────────────

export const fetchRecords = (params: FetchRecordsParams) =>
  axiosInstance.post('/records/search', params)

export const openEvaluation = (recordId: number) =>
  axiosInstance.post(
    `${BASE}/open`,
    JSON.stringify({ recordId }),
    { headers: { 'Content-Type': 'application/json' } }
  )

export const saveEvaluation = (dto: SaveEvaluationDto) =>
  axiosInstance.post(`${BASE}/save`, dto)

export const requalifyRecord = (dto: RequalificationDto) =>
  axiosInstance.post(`${BASE}/requalify`, dto)

export const fetchCategories = () =>
  axiosInstance.get(`${BASE}/categories`)

export const fetchCallReasons = () =>
  axiosInstance.get(`${BASE}/call-reasons`)

export const fetchAgents = () =>
  axiosInstance.get(`${BASE}/agents`)

export const fetchCampaignQualities = () =>
  axiosInstance.get(`${BASE}/campaign-qualities`)

export const fetchCallStatus = (
  customerId: string,
  campaignId: string,
  callType:   number,
) => axiosInstance.get(`${BASE}/call-status/${customerId}/${campaignId}/${callType}`)

export const exportRecordsBlob = async (p: ExportBlobParams): Promise<Blob> => {
  const res = await axiosInstance.get('/records/export', {
    params:       p,
    responseType: 'blob',
  })
  return res.data
}
export const streamAudioUrl = async (recordId: number): Promise<string> => {
  // Fetch le fichier audio via axiosInstance (qui gère le token automatiquement)
  const response = await axiosInstance.get(
    `${BASE}/records/${recordId}/stream`,
    { responseType: 'blob' }
  )
  
  const blob    = new Blob([response.data], { type: response.headers['content-type'] })
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}
export const streamScreenUrl = async (recordId: number): Promise<string> => {
  const response = await axiosInstance.get(
    `${BASE}/records/${recordId}/stream-screen`,
    { responseType: 'blob' }
  )
  const blob    = new Blob([response.data], { type: response.headers['content-type'] })
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}
export const traceScreenAction = async (dto: TraceActionDto): Promise<void> => {
  await axiosInstance.post('/records/trace-screen', dto);
};