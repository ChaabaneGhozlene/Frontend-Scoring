// StatiTypes.ts

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
  startPeriode?: string | null;  // ✅ Ajouté
  endPeriode?: string | null;    // ✅ Ajouté
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
  // ✅ Plus de userId, userRole, siteId - ils sont dans le JWT
}

export interface StatistiqueExportDto {
  filter: StatistiqueFilterDto;
  format: "CSV" | "PDF" | "XLS" | "RTF";
}

export interface StatistiqueRowViewModel extends StatistiqueRowDto {
  monthYear: string;
  year: number;
  weekYear: string;
}

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

export interface SectionStatState {
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

export interface FetchStatistiquePayload {
  filter: StatistiqueFilterDto;
}

// ✅ CORRIGÉ - Plus besoin de userId, userRole, siteId
export interface FetchAgentsPayload {
  allSupervisors: boolean;
}

// ✅ CORRIGÉ - Payload vide car backend lit depuis JWT
export type FetchCampaignsPayload = Record<string, never>; // Objet vide

export interface ExportPayload {
  filter: StatistiqueFilterDto;
  format: "CSV" | "PDF" | "XLS" | "RTF";
}