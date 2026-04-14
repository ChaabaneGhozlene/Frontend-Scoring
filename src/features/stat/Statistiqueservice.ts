import axiosInstance from "../../services/axiosInstance";
import type {
  AgentDto, CampaignDto, StatistiqueExportDto,
  StatistiqueFilterDto, StatistiqueRowDto
} from "./StatiTypes";

// ✅ StatistiqueController2 → [controller] = "statistique2"
const BASE = "/statistique2";

function toArray<T>(raw: any): T[] {
  if (Array.isArray(raw))          return raw;
  if (Array.isArray(raw?.$values)) return raw.$values;
  if (Array.isArray(raw?.rows))    return raw.rows;
  if (Array.isArray(raw?.data))    return raw.data;
  console.warn("toArray: format inattendu →", raw);
  return [];
}

export const StatistiqueService = {

  // ✅ GET /api/statistique2/data
  getData: (filter: StatistiqueFilterDto): Promise<StatistiqueRowDto[]> =>
    axiosInstance
      .get<any>(`${BASE}/data`, {
        params: {
          dateDebut:      filter.dateDebut,
          dateFin:        filter.dateFin,
          agentId:        filter.agentId        ?? null,
          campaignId:     filter.campaignId     ?? null,
          allSupervisors: filter.allSupervisors ?? true,
          userId:         filter.userId,
          userRole:       filter.userRole,
          siteId:         filter.siteId,
        },
      })
      .then((r) => toArray<StatistiqueRowDto>(r.data)),

  // ✅ GET /api/statistique2/agents
  getAgents: (
    userId: number,
    userRole: number,
    siteId: number,
    allSupervisors = true
  ): Promise<AgentDto[]> =>
    axiosInstance
      .get<any>(`${BASE}/agents`, {
        params: { userId, userRole, siteId, allSupervisors },
      })
      .then((r) => toArray<AgentDto>(r.data)),

  // ✅ GET /api/statistique2/campaigns
  getCampaigns: (
    userId: number,
    siteId: number
  ): Promise<CampaignDto[]> =>
    axiosInstance
      .get<any>(`${BASE}/campaigns`, {
        params: { userId, siteId },
      })
      .then((r) => toArray<CampaignDto>(r.data)),

  // ✅ POST /api/statistique2/export
  export: async (payload: StatistiqueExportDto): Promise<void> => {
    const response = await axiosInstance.post(
      `${BASE}/export`,
      payload,
      { responseType: "blob" }
    );
    const ext = payload.format.toLowerCase();
    const mime: Record<string, string> = {
      csv: "text/csv",
      pdf: "application/pdf",
      xls: "application/vnd.ms-excel",
      rtf: "application/rtf",
    };
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: mime[ext] ?? "application/octet-stream" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `statistique_${new Date().toISOString().slice(0, 10)}.${ext}`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};