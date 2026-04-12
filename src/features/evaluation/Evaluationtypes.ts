// ============================================================
// Evaluation Types
// ============================================================

export interface LsFicheDto {
  id:           number
  agent:        string
  lsId?:        number   

  agentOid:     string
  agentId:      number
    auditorName:  string   
  auditor:      number
  startPeriode: string
  endPeriode:   string
  createDate:   string
  updateDate:   string
  score:        number
  surveyCount:  number
  campaignName: string
  modeleName:   string
  surveyId:     number   
  recordDate:   string   
  recordDataId: number   
}

export interface LsSurveyDto {
  id:              number
  lsId:            number
  createDate:      string
  updateDate:      string
  score:           number
  isSaved:         number
  memo:            string
  memoActionTaken: string
  recordDataId:    number
  categoryName:    string
  callReasonName:  string
  recordDate:      string
  items:           SurveyItemDto[]

}

export interface SurveyItemDto {
  id:             number
  surveyId:       number
  templateItemId: number
  value:          number
  memo:           string | null
  sectionName:    string | null
  sectionId:      number
  sectionOrder:   number
  question:       string | null
  description:    string | null
  itemOrder:      number
  minValue:       number
  maxValue:       number
  allowNA:        boolean
}

export interface UpdateSurveyItemDto {
  id:    number
  value: number
  memo:  string 
}

export interface UpdateSurveyDto {
  categoryId?:      number | null
  callReasonId?:    number | null
  memo?:            string | null
  memoActionTaken?: string | null
  ccEmail?:         string | null
  items:            UpdateSurveyItemDto[]
}

export interface AgentReportDto {
  createDate:    string
  auditorName:   string
  auditorLogin:  string
  agentName:     string
  periodLabel:   string
  totalScore:    number
  surveys:       SurveyReportDto[]
  sectionScores: SectionScoreDto[]
}

export interface SurveyReportDto {
  surveyId:    number
  surveyLabel: string
  memo:        string
  score:       number
  items:       SurveyItemDto[]
}

export interface SectionScoreDto {
  sectionName:  string
  score:        number
  surveyLabel:  string
}

export interface EvaluationListFilterDto {
  dateDebut?:     string | null
  dateFin?:       string | null
  filterId?:      number | null
  page:           number
  pageSize:       number
  columnFilters?: { id: string; value: string }[]
}

export interface EvaluationState {
  fiches:          LsFicheDto[]
  totalCount:      number
  loading:         boolean
  error:           string | null
  page:            number
  pageSize:        number
  dateDebut:       string
  dateFin:         string
  selectedFilterId: number | null
  selectedRow:     LsFicheDto | null
  openDeleteModal: boolean
  openReportModal: boolean

  selectedFicheId: number | null
  surveys:         LsSurveyDto[]
  surveysLoading:  boolean
  surveysError:    string | null

  selectedSurveyId: number | null
  surveyItems:      SurveyItemDto[]
  itemsLoading:     boolean
  itemsError:       string | null
  updateLoading:    boolean
  updateError:      string | null

  agentReport:        AgentReportDto | null
  agentReportLoading: boolean
  agentReportError:   string | null

  deleteLoading: boolean
  deleteError:   string | null

  columnFilters: { id: string; value: string }[]

  // FIX: flag positionné à true par la saga après création d'un filtre avec applyAfter=true
  // Le toolbar l'observe via useEffect et déclenche le fetch, puis le remet à false
  pendingApplyFilter: boolean

 
  filtersLoading: boolean
  filtersError:   string | null

  // ── Vues ──
  viewConfigs:          EvalViewConfig[];
  viewConfigsLoading:   boolean;
  selectedViewConfigId: number | null;
}


export interface CreateEvaluationFilterDto {
  name:       string
  expression: string
  sqlWhere:   string
  type:       number
}

export interface CreateEvalFilterAndApplyPayload extends CreateEvaluationFilterDto {
  applyAfter?:    boolean
  columnFilters?: { id: string; value: string }[]
}
// Ajouter à la fin du fichier, ou avec les autres interfaces

export interface EvalViewConfig {
  id:         number;
  name:       string;
  layoutJson: string;
    groupe:     number;

}

export interface CreateEvalViewConfigDto {
  name:       string;
  layoutJson: string;
}

export interface UpdateEvalViewConfigPayload {
  id:         number;
  layoutJson: string;
}
// Ajouter à la fin du fichier

export interface ColumnFilter {
  id:    string;
value: string; 
}

export interface ViewLayoutState {
  columnVisibility:  Record<string, boolean>;
  columnSizing:      Record<string, number>;
  dateDebut?:        string;
  dateFin?:          string;
  selectedFilterId?: number | null;
  columnFilters?:    ColumnFilter[];
  pageSize?:         number;
}