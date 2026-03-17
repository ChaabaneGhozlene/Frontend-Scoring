import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type {
  ConfigurationState,
  LsTemplateDto,
  LsCalledCampaignDto,
  LsTemplatePeriodeDto,
  CustomerDto,
  AvailableCampaignDto,
} from './ConfigurationCampagnestypes'
// ── Initial State ─────────────────────────────────────────────────────────────
const initialState: ConfigurationState = {
  templates:          [],
  selectedTemplate:   null,
  campaigns:          [],
  periodes:           [],
  customers:          [],
  availableCampaigns: [],
  loading:            false,
  error:              null,
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {

    // ── UI ───────────────────────────────────────────────────────────────────
    setSelectedTemplate: (s, a: PayloadAction<LsTemplateDto | null>) => {
      s.selectedTemplate = a.payload
      s.campaigns        = []
    },
    clearError: (s) => { s.error = null },

    // ── Templates ─────────────────────────────────────────────────────────
    fetchTemplates:        (s)            => { s.loading = true;  s.error = null },
    fetchTemplatesSuccess: (s, a: PayloadAction<LsTemplateDto[]>) => { s.loading = false; s.templates = a.payload },
    fetchTemplatesFailure: (s, a: PayloadAction<string>)          => { s.loading = false; s.error = a.payload },

    createTemplate:        (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    createTemplateSuccess: (s)                         => { s.loading = false },
    createTemplateFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    updateTemplate:        (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    updateTemplateSuccess: (s)                         => { s.loading = false },
    updateTemplateFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    deleteTemplate:        (s, _a: PayloadAction<number>) => { s.loading = true;  s.error = null },
    deleteTemplateSuccess: (s, a: PayloadAction<number>)  => {
      s.loading = false
      if (s.selectedTemplate?.id === a.payload) { s.selectedTemplate = null; s.campaigns = [] }
    },
    deleteTemplateFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    changeModel:           (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    changeModelSuccess:    (s)                         => { s.loading = false },
    changeModelFailure:    (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    // ── Campaigns ─────────────────────────────────────────────────────────
    fetchCampaigns:        (s, _a: PayloadAction<number>) => { s.loading = true;  s.error = null },
    fetchCampaignsSuccess: (s, a: PayloadAction<LsCalledCampaignDto[]>) => { s.loading = false; s.campaigns = a.payload },
    fetchCampaignsFailure: (s, a: PayloadAction<string>)               => { s.loading = false; s.error = a.payload },

    createCampaign:        (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    createCampaignSuccess: (s)                         => { s.loading = false },
    createCampaignFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    updateCampaign:        (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    updateCampaignSuccess: (s)                         => { s.loading = false },
    updateCampaignFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    deleteCampaign:        (s, _a: PayloadAction<any>) => { s.loading = true;  s.error = null },
    deleteCampaignSuccess: (s)                         => { s.loading = false },
    deleteCampaignFailure: (s, a: PayloadAction<string>) => { s.loading = false; s.error = a.payload },

    // ── Lookups ───────────────────────────────────────────────────────────
    fetchPeriodes:               (s)            => { s.loading = true },
    fetchPeriodesSuccess:        (s, a: PayloadAction<LsTemplatePeriodeDto[]>) => { s.loading = false; s.periodes = a.payload },
    fetchCustomers:              (s)            => { s.loading = true },
    fetchCustomersSuccess:       (s, a: PayloadAction<CustomerDto[]>)          => { s.loading = false; s.customers = a.payload },
    fetchAvailableBySite:        (s, _a: PayloadAction<number>) => { s.loading = true },
    fetchAvailableBySiteSuccess: (s, a: PayloadAction<AvailableCampaignDto[]>) => { s.loading = false; s.availableCampaigns = a.payload },
  },
})

export const {
  setSelectedTemplate, clearError,
  fetchTemplates,  fetchTemplatesSuccess,  fetchTemplatesFailure,
  createTemplate,  createTemplateSuccess,  createTemplateFailure,
  updateTemplate,  updateTemplateSuccess,  updateTemplateFailure,
  deleteTemplate,  deleteTemplateSuccess,  deleteTemplateFailure,
  changeModel,     changeModelSuccess,     changeModelFailure,
  fetchCampaigns,  fetchCampaignsSuccess,  fetchCampaignsFailure,
  createCampaign,  createCampaignSuccess,  createCampaignFailure,
  updateCampaign,  updateCampaignSuccess,  updateCampaignFailure,
  deleteCampaign,  deleteCampaignSuccess,  deleteCampaignFailure,
  fetchPeriodes,   fetchPeriodesSuccess,
  fetchCustomers,  fetchCustomersSuccess,
  fetchAvailableBySite, fetchAvailableBySiteSuccess,
} = configurationSlice.actions

export default configurationSlice.reducer