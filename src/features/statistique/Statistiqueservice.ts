import axiosInstance from '../../services/axiosInstance';
import type {
  AgentListItem,
  AgentScoreItem,
  CoachingAnalysisItem,
  CoachingSheetItem,
  CoachingSummaryItem,
  ExportRequest,
  ProgramLevelItem,
  SectionStatItem,
  SortDirection,
  StatFilter,
  SupervisorItem,
} from './Statistiquetypes';

const BASE = '/statistique';
export const fetchSupervisorListApi = async (): Promise<SupervisorItem[]> => {
  const { data } = await axiosInstance.get<SupervisorItem[]>(`${BASE}/supervisors`);
  return data;
};
// ─── Section Stats ────────────────────────────────────────────────────────────
export const fetchSectionStatsApi = async (
  filter: StatFilter
): Promise<SectionStatItem[]> => {
  const { data } = await axiosInstance.post<SectionStatItem[]>(
    `${BASE}/section-stats`,
    filter
  );
  return data;
};

// ─── Agent Scores ─────────────────────────────────────────────────────────────
// ✅ sortDirection passé en query param (lu via [FromQuery] côté controller)
// ✅ allSupervisors est déjà dans StatFilter → transmis dans le body
export const fetchAgentScoresApi = async (
  filter: StatFilter,
  sortDirection: SortDirection
): Promise<AgentScoreItem[]> => {
  const { data } = await axiosInstance.post<AgentScoreItem[]>(
    `${BASE}/agent-scores`,
    filter,                          // ✅ contient déjà allSupervisors
    { params: { sortDirection } }
  );
  return data;
};

// ─── Program Level ────────────────────────────────────────────────────────────
// ✅ allSupervisors retiré des params, il est dans filter
export const fetchProgramLevelApi = async (
  filter: StatFilter
): Promise<ProgramLevelItem[]> => {
  const { data } = await axiosInstance.post<ProgramLevelItem[]>(
    `${BASE}/program-level`,
    filter                           // ✅ contient déjà allSupervisors
  );
  return data;
};

// ─── Coaching Sheet ───────────────────────────────────────────────────────────
// ✅ agentId reste en query param car c'est un filtre ponctuel
// ✅ allSupervisors retiré des params, il est dans filter
export const fetchCoachingSheetApi = async (
  filter: StatFilter,
  agentId: number
): Promise<CoachingSheetItem[]> => {
  const { data } = await axiosInstance.post<CoachingSheetItem[]>(
    `${BASE}/coaching-sheet`,
    filter,                          // ✅ contient déjà allSupervisors
    { params: { agentId } }
  );
  return data;
};

// ─── Coaching Analysis ────────────────────────────────────────────────────────
export const fetchCoachingAnalysisApi = async (
  filter: StatFilter,
  agentId: number
): Promise<CoachingAnalysisItem[]> => {
  const { data } = await axiosInstance.post<CoachingAnalysisItem[]>(
    `${BASE}/coaching-analysis`,
    filter,                          // ✅ contient déjà allSupervisors
    { params: { agentId } }
  );
  return data;
};

// ─── Coaching Summary ─────────────────────────────────────────────────────────
export const fetchCoachingSummaryApi = async (
  filter: StatFilter,
  agentId: number
): Promise<CoachingSummaryItem[]> => {
  const { data } = await axiosInstance.post<CoachingSummaryItem[]>(
    `${BASE}/coaching-summary`,
    filter,                          // ✅ contient déjà allSupervisors
    { params: { agentId } }
  );
  return data;
};

// ─── Agent List ───────────────────────────────────────────────────────────────
// ✅ allSupervisors reste en query param car c'est un GET sans body
export const fetchAgentListApi = async (
  allSupervisors: boolean
): Promise<AgentListItem[]> => {
  const { data } = await axiosInstance.get<AgentListItem[]>(`${BASE}/agents`, {
    params: { allSupervisors },
  });
  return data;
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportStatistiquesApi = async (request: ExportRequest): Promise<void> => {
  const response = await axiosInstance.post(`${BASE}/export`, request, {
    responseType: 'blob',
  });

  const url  = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  const ext  = request.format.toLowerCase() === 'xls' ? 'xls' : request.format.toLowerCase();
  link.href     = url;
  link.download = `${request.reportType}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};