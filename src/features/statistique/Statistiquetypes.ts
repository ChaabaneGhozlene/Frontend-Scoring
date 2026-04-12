// ─── Filter ───────────────────────────────────────────────────────────────────

export interface StatFilter {
  dateFrom:            string;
  dateTo:              string;
  allSupervisors:      boolean;  
    supervisorId?:   number;      
  sortDirection?:      SortDirection;  // ✅ ajouté
  agentId?:            number;
}
// ─── Question ─────────────────────────────────────────────────────────────────
export interface Question {
  questionId:    number
  questionOrder: number
  description:   string
  groupId:       number
}
export interface SupervisorItem {
  id:   number;
  name: string;
}
// ─── SectionStatRow — type pur sans index signature ───────────────────────────
export interface SectionStatRow {
  sectionId:    number
  sectionOrder: number
  section:      string
  agent:        string
  agentId:      number
  campaign:     string
  reference:    number
  scoreGroup:   number
  percentage:   number
  questions:    Question[]
}


export interface ExportRequest {
  reportType: ReportType;
  format: ExportFormat;
  filter: StatFilter;
  agentId?: number;
  allSupervisors?: boolean;
  sortDirection?: SortDirection;
}

export interface ColumnConfig {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}
// ─── Enums ────────────────────────────────────────────────────────────────────
export type ReportType =
  | 'section-stats'
  | 'agent-scores'
  | 'program-level'
  | 'coaching-sheet'
  | 'coaching-analysis'
  | 'coaching-summary';

export type ExportFormat = 'PDF' | 'XLS' | 'CSV' | 'RTF';
export type SortDirection = 'Ascending' | 'Descending';
export type ChartType = 'Bar' | 'Line' | 'Pie' | 'Area' | 'Radar';

// ─── Response DTOs ────────────────────────────────────────────────────────────
export type SectionStatItem = SectionStatRow & {
  [key: string]: unknown
}

export interface AgentScoreItem {
  agent: string;
  score: number;
}

export interface ProgramLevelItem {
  agent: string;
  createDate: string;
  score: number;
}

export interface CoachingSheetItem {
  id: number;
  callIndex: string;
  evaluationScore: number;
  question: string;
  itemScore: number;
  comment: string;
}

export interface CoachingAnalysisItem {
  id: number;
  sectionId: number;
  section: string;
  errorType: string;
  occurrence: number;
  positiveAnswers: number;
  loseRate: number;
  value: number;
}

export interface CoachingSummaryItem {
  id: number;
  callIndex: string;
  score: number;
  comment: string;
}

export interface AgentListItem {
  id: number;
  agent: string;
}

// ─── Redux State ──────────────────────────────────────────────────────────────
export interface StatistiqueState {
  // Data
  sectionStats:     SectionStatItem[];
  agentScores:      AgentScoreItem[];
  programLevel:     ProgramLevelItem[];
  coachingSheet:    CoachingSheetItem[];
  coachingAnalysis: CoachingAnalysisItem[];
  coachingSummary:  CoachingSummaryItem[];
  agentList:        AgentListItem[];

  // UI
  loading:          boolean;
  exportLoading:    boolean;
  error:            string | null;

  // Filters
  filter:           StatFilter;
  selectedAgentId:  number | null;
  allSupervisors:   boolean;
  sortDirection:    SortDirection;
  chartType:        ChartType;
}
export interface WidgetInstance {
  id:         string;       // uuid unique par widget
  widgetType: ReportType;
  chartType:  ChartType;
  filters:    StatFilter;
  size:       'small' | 'medium' | 'large';
  position:   { x: number; y: number; w: number; h: number };
  title?:     string;       // titre personnalisé optionnel
}

export interface UserDashboardConfig {
  userId:  number;
  widgets: WidgetInstance[];
}
// ─── Saga Actions payload ─────────────────────────────────────────────────────
export interface FetchSectionStatsPayload   { filter: StatFilter }
export interface FetchAgentScoresPayload    { filter: StatFilter; sortDirection: SortDirection }
export interface FetchProgramLevelPayload   { filter: StatFilter; allSupervisors: boolean }
export interface FetchCoachingPayload       { filter: StatFilter; agentId: number; allSupervisors: boolean }
export interface FetchAgentListPayload      { allSupervisors: boolean }
export interface ExportPayload              { request: ExportRequest }