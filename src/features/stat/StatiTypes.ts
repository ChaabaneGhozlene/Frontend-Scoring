// ⚠️ Types propres au slice "stat" (features/stat/)
// SectionStatPage et StatToolbar importent depuis ICI

export interface SectionStatFilter {
  dateDebut: string;
  dateFin:   string;
}

export interface SectionStatRow {
  sectionId:    number;
  section:      string;
  agent:        string;
  agentId:      string;
  campaign:     string;
  scorePercent: number;
}

export interface SectionStatResponse {
  rows:  SectionStatRow[];
  total: number;
}

export type ChartType = 'bar' | 'line' | 'pie';

export interface StatistiqueState {
  rows:      SectionStatRow[];
  total:     number;
  loading:   boolean;
  error:     string | null;
  filter:    SectionStatFilter;
  chartType: ChartType;
}