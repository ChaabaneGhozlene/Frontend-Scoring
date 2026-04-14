// ─── DTOs (miroir du backend) ────────────────────────────────────────────────

export interface StatistiqueRowDto {
  surveyId: number;
  createDate: string;
  score: number;
  memo: string | null;
  agentId: number;
  agent: string;
  auditorId: number;
  auditor: string;
  campaignId: number | null;
  campaign: string | null;
  fullPeriode: string | null;
  recordLink: string | null;
  itemId: number | null;
  itemValue: number | null;
  itemMemo: string | null;
  question: string | null;
  questionId?: number | null;
  section: string | null;
  sectionId: number | null;
}

export interface AgentDto {
  id: number;
  name: string;
}

export interface CampaignDto {
  id: number;
  description: string;
}

export interface StatistiqueFilterDto {
  dateDebut: string;
  dateFin: string;
  agentId?: number | null;
  campaignId?: number | null;
  auditorId?: number | null;
  allSupervisors?: boolean;
  userId: number;
  siteId: number;
  userRole: number;
}

/**
 * Filtre simplifié utilisé par Sectionstatfilter (dates uniquement).
 * Pour convertir en StatistiqueFilterDto complet :
 *   const full: StatistiqueFilterDto = { ...sectionFilter, userId, siteId, userRole }
 */
export interface SectionStatFilterDto {
  dateDebut: string;
  dateFin: string;
}

export interface StatistiqueExportDto {
  filter: StatistiqueFilterDto;
  format: "CSV" | "PDF" | "XLS" | "RTF";
}

// ─── View model (enrichi côté frontend) ─────────────────────────────────────

export interface StatistiqueRowViewModel extends StatistiqueRowDto {
  monthYear: string;
  year: number;
  weekYear: string;
}

// ─── Pivot ───────────────────────────────────────────────────────────────────

export type MeasureKey = "score" | "count" | "itemValue";

export interface PivotZones {
  rows: string[];
  cols: string[];
  available: string[];
}

export interface PivotResult {
  rowKeys: string[][];
  colKeys: string[][];
  cells: Record<string, StatistiqueRowViewModel[]>;
  measure: MeasureKey;
}

// ─── Redux State ─────────────────────────────────────────────────────────────

export interface StatistiqueState {
  data: StatistiqueRowViewModel[];
  agents: AgentDto[];
  campaigns: CampaignDto[];
  filters: StatistiqueFilterDto;
  zones: PivotZones;
  measure: MeasureKey;
  loading: boolean;
  loadingAgents: boolean;
  loadingCampaigns: boolean;
  error: string | null;
  exportLoading: boolean;
}

// ─── Saga Payloads ───────────────────────────────────────────────────────────

export interface FetchStatistiquePayload {
  filter: StatistiqueFilterDto;
}

export interface FetchAgentsPayload {
  userId: number;
  userRole: number;
  siteId: number;
  allSupervisors: boolean;
}

export interface FetchCampaignsPayload {
  userId: number;
  siteId: number;
}

export interface ExportPayload {
  filter: StatistiqueFilterDto;
  format: "CSV" | "PDF" | "XLS" | "RTF";
}