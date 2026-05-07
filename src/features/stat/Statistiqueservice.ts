import axiosInstance from "../../services/axiosInstance";
import type {
  AgentDto, CampaignDto, StatistiqueExportDto,
  StatistiqueFilterDto, StatistiqueRowDto
} from "./StatiTypes";

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
  getData: (filter: StatistiqueFilterDto): Promise<StatistiqueRowDto[]> =>
    axiosInstance
      .get<any>(`${BASE}/data`, {
        params: {
          dateDebut: filter.dateDebut,
          dateFin: filter.dateFin,
          agentId: filter.agentId ?? null,
          campaignId: filter.campaignId ?? null,
          auditorId: filter.auditorId ?? null,
          allSupervisors: filter.allSupervisors ?? true,
          // ✅ Plus de userId, userRole, siteId
        },
      })
      .then((r) => toArray<StatistiqueRowDto>(r.data)),

  getAgents: (allSupervisors = true): Promise<AgentDto[]> =>
    axiosInstance
      .get<any>(`${BASE}/agents`, {
        params: { allSupervisors },
      })
      .then((r) => toArray<AgentDto>(r.data)),

  getCampaigns: (): Promise<CampaignDto[]> => {
    console.log("📡 getCampaigns — requête (sans paramètres, lecture depuis JWT)");
    return axiosInstance
      .get<any>(`${BASE}/campaigns`)
      .then((r) => toArray<CampaignDto>(r.data));
  },

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