import axiosInstance from '../../../services/axiosInstance'
import type {
  LsTemplateDto,
  LsCalledCampaignDto,
  LsTemplatePeriodeDto,
  CustomerDto,
  AvailableCampaignDto,
  CreateLsTemplateDto,
  UpdateLsTemplateDto,
  ChangeModelDto,
  CreateCalledCampaignDto,
  UpdateCalledCampaignDto,
  ItemGroupDto,
} from './ConfigurationCampagnestypes'

const BASE = '/configuration'

// ── Templates ────────────────────────────────────────────────────────────────

export const ConfigurationService = {

  // Templates
  getTemplates: () =>
    axiosInstance.get<LsTemplateDto[]>(`${BASE}/templates`),

  getTemplateById: (id: number) =>
    axiosInstance.get<LsTemplateDto>(`${BASE}/templates/${id}`),

  createTemplate: (dto: CreateLsTemplateDto) =>
    axiosInstance.post<{ id: number }>(`${BASE}/templates`, dto),

  updateTemplate: (id: number, dto: UpdateLsTemplateDto) =>
    axiosInstance.put(`${BASE}/templates/${id}`, dto),

  deleteTemplate: (id: number) =>
    axiosInstance.delete(`${BASE}/templates/${id}`),

  changeModel: (id: number, dto: ChangeModelDto) =>
    axiosInstance.post<{ id: number }>(`${BASE}/templates/${id}/change-model`, dto),
  // ✅ Ajouter cette méthode après changeModel :
getGroupsByTemplate: (templateId: number) =>
  axiosInstance.get<ItemGroupDto[]>(`${BASE}/templates/${templateId}/groups`),
deleteTemplateItem: (id: number) =>
  axiosInstance.delete(`/configuration/items/${id}`),
  // Campaigns
  getCampaignsByTemplate: (templateId: number) =>
    axiosInstance.get<LsCalledCampaignDto[]>(`${BASE}/templates/${templateId}/campaigns`),

  createCampaign: (dto: CreateCalledCampaignDto) =>
    axiosInstance.post<{ id: number }>(`${BASE}/campaigns`, dto),

  updateCampaign: (id: number, dto: UpdateCalledCampaignDto) =>
    axiosInstance.put(`${BASE}/campaigns/${id}`, dto),

  deleteCampaign: (id: number) =>
    axiosInstance.delete(`${BASE}/campaigns/${id}`),

  // Lookups
  getPeriodes: () =>
    axiosInstance.get<LsTemplatePeriodeDto[]>(`${BASE}/periodes`),

  getCustomers: () =>
    axiosInstance.get<CustomerDto[]>(`${BASE}/customers`),

  getAvailableCampaigns: (excludeTemplateId?: number) =>
    axiosInstance.get<AvailableCampaignDto[]>(
      `${BASE}/available-campaigns${excludeTemplateId ? `?excludeTemplateId=${excludeTemplateId}` : ''}`
    ),

  getAvailableCampaignsBySite: (customerId: number) =>
    axiosInstance.get<AvailableCampaignDto[]>(`${BASE}/available-campaigns/by-site/${customerId}`),
}