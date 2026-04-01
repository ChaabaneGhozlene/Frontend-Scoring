// ─── Recording Entity ─────────────────────────────────────────────────────────

export interface Recording {
  id:                   number;
  campaignDescription:  string | null;
  agentOid:             string | null;
  nomAgent:             string | null;
  agentId:              number | null;
  prenomAgent:          string | null;
  callLocalTime:        string | null;
  callLocalTimeString:  string | null;
  statusRequal:         string | null;
  statusDescription:    string | null;
  callTypeDescription:  string | null;
  numeroTel:            string | null;
  duration:             number | null;
  hasHistory:           boolean;
  hasEvaluation:        boolean;
  HasHistoryScreen:     boolean;
  lsId:                 number | null;
  typeRequalif:         number | null;
  audioUrl?:            string;
}

// ─── Filter / View Config ─────────────────────────────────────────────────────

export interface UserFilter {
  id:         number;
  name:       string;
  expression: string;
  sqlWhere:   string;
  type:       number;
}

export interface CreateFilterDto {
  name:       string;
  expression: string;
  sqlWhere:   string;
  type:       number;
}

export interface ViewConfig {
  id:         number;
  name:       string;
  layoutJson: string;
}

export interface CreateViewConfigDto {
  name:       string;
  layoutJson: string;
}

// ─── Column Filter ────────────────────────────────────────────────────────────
// Compatible avec TanStack Table ColumnFiltersState
export interface ColumnFilter {
  id:    string;
  value: unknown;
}

// ─── View Layout State ────────────────────────────────────────────────────────
// Ce qui est sérialisé dans layoutJson
export interface ViewLayoutState {
  columnVisibility:  Record<string, boolean>;
  columnSizing:      Record<string, number>;
  columnOrder?:      string[];
  dateDebut?:        string;
  dateFin?:          string;
  selectedFilterId?: number | null;
  columnFilters?:    ColumnFilter[];
  pageSize?:         number;
  page?:             number;
}

// ─── Search / Pagination ──────────────────────────────────────────────────────

export interface RecordingsSearchRequest {
  dateDebut:      string;
  dateFin:        string;
  filterId?:      number | null;
  page:           number;
  pageSize:       number;
  columnFilters?: ColumnFilter[];
}

export interface RecordingsSearchResponse {
  records:    Recording[];
  totalCount: number;
  page:       number;
  pageSize:   number;
}

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface RecordingsState {
  records:              Recording[];
  totalCount:           number;
  page:                 number;
  pageSize:             number;
  loading:              boolean;
  error:                string | null;
  columnFilters:        ColumnFilter[];
  filters:              UserFilter[];
  filtersLoading:       boolean;
  selectedFilterId:     number | null;
  viewConfigs:          ViewConfig[];
  viewConfigsLoading:   boolean;
  selectedViewConfigId: number | null;
  dateDebut:            string;
  dateFin:              string;
}

// ─── Saga Action Payloads ─────────────────────────────────────────────────────

export interface FetchRecordingsPayload {
  dateDebut:      string;
  dateFin:        string;
  filterId?:      number | null;
  page:           number;
  pageSize:       number;
  columnFilters?: ColumnFilter[];
}

export interface FetchRecordingsParams {
  dateDebut:      string;
  dateFin:        string;
  filterId:       number | null;
  page:           number;
  pageSize:       number;
  columnFilters?: ColumnFilter[];
}

export interface CreateFilterPayload {
  name:       string;
  expression: string;
  sqlWhere:   string;
  type:       number;
}

export interface SaveViewConfigPayload {
  name:       string;
  layoutJson: string;
}

export interface UpdateViewConfigPayload {
  id:         number;
  layoutJson: string;
}