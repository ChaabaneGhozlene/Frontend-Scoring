// ── Templates ──────────────────────────────────────────────────────────────
export interface LsTemplateDto {
  id: number
  description: string
  min: number
  max: number
  version: number
  status: number
  relatedTemplate: number | null
  startDate: string
  endDate: string
  lsTemplatePeriodeId: number | null
  periodeDescription: string | null
}

export interface CreateLsTemplateDto {
  description: string
  min: number
  max: number
  lsTemplatePeriodeId: number
  startDate: string
  endDate: string
  itemGroups: ItemGroupDto[]
  selectedCampaignParams: string[]
}

export interface UpdateLsTemplateDto {
  description: string
  min: number
  max: number
  lsTemplatePeriodeId: number
  startDate: string
  endDate: string
    itemGroups?: ItemGroupDto[]        // ← ajouter si absent

  selectedCampaignParams: string[]
}

export interface ChangeModelDto {
  description: string
  min: number
  max: number
  lsTemplatePeriodeId: number
  startDate: string
  endDate: string
  itemGroups: ItemGroupDto[]
  selectedCampaignParams: string[]
}

// ── Item Groups & Items ─────────────────────────────────────────────────────
export interface ItemGroupDto {
  id: number
  description: string
  coef: number
  order: number
  items: TemplateItemDto[]
}

export interface TemplateItemDto {
  id: number
  description: string
  question: string | null
  min: number
  max: number
  coef: number
  order: number
  isNa: number
  isKillerQuestion: number
  isKillerSection: number
}

// ── Called Campaigns ────────────────────────────────────────────────────────
export interface LsCalledCampaignDto {
  id: number
  description: string
  site: number
  campagneDid: string
  campagneDescription: string
  status: number
  startDate: string
  endDate: string
  lsTemplateId: number
}

export interface CreateCalledCampaignDto {
  description: string
  site: number
  campagneParam: string
  status: number
  lsTemplateId: number
}

export interface UpdateCalledCampaignDto {
  description: string
  site: number
  campagneParam: string
  status: number
  lsTemplateId: number
}

// ── Lookups ─────────────────────────────────────────────────────────────────
export interface AvailableCampaignDto {
  display: string
  param: string
}

export interface CustomerDto {
  customerId: number
  description: string
}

export interface LsTemplatePeriodeDto {
  id: number
  description: string
}

// ── Redux State ─────────────────────────────────────────────────────────────
export interface ConfigurationState {
  templates: LsTemplateDto[]
  selectedTemplate: LsTemplateDto | null
  campaigns: LsCalledCampaignDto[]
  periodes: LsTemplatePeriodeDto[]
  customers: CustomerDto[]
  availableCampaigns: AvailableCampaignDto[]
  loading: boolean
  error: string | null
}