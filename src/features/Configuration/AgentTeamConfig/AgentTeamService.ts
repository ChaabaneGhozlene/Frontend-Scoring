import axiosInstance from '../../../services/axiosInstance';
import type {
  AgentTeam,
  AgentTeamMember,
  AvailableAgent,
  AgentSite,
  CreateAgentTeamDto,
  UpdateAgentTeamDto,
} from './AgentTeamTypes';

const BASE = '/agentteam';

const AgentTeamService = {
  // ── Lookups ────────────────────────────────────────────────────────────────
  getSites: () =>
    axiosInstance.get<AgentSite[]>(`${BASE}/sites`),

  getAvailableAgents: (customerId: number, excludeTeamId?: number) => {
    const params: Record<string, unknown> = { customerId };
    if (excludeTeamId !== undefined) params.excludeTeamId = excludeTeamId;
    return axiosInstance.get<AvailableAgent[]>(`${BASE}/available-agents`, { params });
  },

  // ── Groupes ────────────────────────────────────────────────────────────────
  getAllTeams: () =>
    axiosInstance.get<AgentTeam[]>(BASE),

  getTeamById: (id: number) =>
    axiosInstance.get<AgentTeam>(`${BASE}/${id}`),

  getMembers: (teamId: number) =>
    axiosInstance.get<AgentTeamMember[]>(`${BASE}/${teamId}/members`),

  createTeam: (dto: CreateAgentTeamDto) =>
    axiosInstance.post<{ id: number }>(BASE, dto),

  updateTeam: (id: number, dto: UpdateAgentTeamDto) =>
    axiosInstance.put(`${BASE}/${id}`, dto),

  deleteTeam: (id: number) =>
    axiosInstance.delete(`${BASE}/${id}`),
  removeMembers: (teamId: number, agentOids: string[]) =>
    axiosInstance.delete(`${BASE}/${teamId}/members`, {
      data: { agentOids },  // ← body dans un DELETE avec axios
    }),
};

export default AgentTeamService;