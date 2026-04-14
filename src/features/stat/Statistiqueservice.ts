import axios from "axios";
import type { AgentDto, CampaignDto, StatistiqueExportDto, StatistiqueFilterDto, StatistiqueRowDto } from "./StatiTypes";


// Base URL résolu depuis les constantes du projet
const BASE = "/api/statistique2";

export const StatistiqueService = {
  /**
   * Récupère les données brutes depuis Ls_survey + Ls_surveyItem.
   * Le pivot est construit côté frontend.
   */
  getData: (filter: StatistiqueFilterDto): Promise<StatistiqueRowDto[]> =>
    axios
      .get<StatistiqueRowDto[]>(`${BASE}/data`, { params: filter })
      .then((r) => r.data),

  /**
   * Liste des agents selon le rôle de l'utilisateur connecté.
   */
  getAgents: (
    userId: number,
    userRole: number,
    siteId: number,
    allSupervisors = true
  ): Promise<AgentDto[]> =>
    axios
      .get<AgentDto[]>(`${BASE}/agents`, {
        params: { userId, userRole, siteId, allSupervisors },
      })
      .then((r) => r.data),

  /**
   * Campagnes qualité accessibles à l'utilisateur.
   */
  getCampaigns: (userId: number, siteId: number): Promise<CampaignDto[]> =>
    axios
      .get<CampaignDto[]>(`${BASE}/campaigns`, { params: { userId, siteId } })
      .then((r) => r.data),

  /**
   * Export côté serveur (CSV / PDF / XLS / RTF).
   * Déclenche un téléchargement navigateur.
   */
  export: async (payload: StatistiqueExportDto): Promise<void> => {
    const response = await axios.post(`${BASE}/export`, payload, {
      responseType: "blob",
    });

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