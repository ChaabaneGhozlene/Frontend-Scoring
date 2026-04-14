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

  // ✅ GET /api/statistique2/campaigns — avec logs de diagnostic
  getCampaigns: (
    userId: number,
    siteId: number
  ): Promise<CampaignDto[]> => {
    // 🔍 LOG 1 — paramètres envoyés à l'API
    console.group("📡 getCampaigns — requête");
    console.log("userId  :", userId);
    console.log("siteId  :", siteId);
    console.log("URL     :", `/api${BASE}/campaigns?userId=${userId}&siteId=${siteId}`);
    console.groupEnd();

    return axiosInstance
      .get<any>(`${BASE}/campaigns`, {
        params: { userId, siteId },
      })
      .then((r) => {
        // 🔍 LOG 2 — réponse brute du backend
        console.group("✅ getCampaigns — réponse brute");
        console.log("status      :", r.status);
        console.log("data (raw)  :", r.data);
        console.log("type        :", typeof r.data);
        console.log("est tableau :", Array.isArray(r.data));

        // 🔍 LOG 3 — après toArray
        const result = toArray<CampaignDto>(r.data);
        console.log("après toArray (nb) :", result.length);
        console.log("après toArray      :", result);

        if (result.length === 0) {
          console.warn(
            "⚠️  Aucune campagne retournée. Vérifiez :",
            "\n  • userId/siteId corrects dans UsersCampagne",
            "\n  • CampagneDID dans Ls_CalledCampaign correspond à CampagneId",
            "\n  • Status = 1 dans Ls_CalledCampaign"
          );
        } else {
          // 🔍 LOG 4 — aperçu des campagnes reçues
          console.log("🎯 Campagnes disponibles :");
          result.forEach((c) =>
            console.log(`  → id=${c.id}  description="${c.description}"`)
          );
        }

        console.groupEnd();
        return result;
      })
      .catch((err) => {
        // 🔍 LOG 5 — erreur HTTP
        console.group("❌ getCampaigns — ERREUR");
        console.error("status  :", err?.response?.status);
        console.error("message :", err?.response?.data ?? err?.message);
        console.groupEnd();
        throw err;
      });
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