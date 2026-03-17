// ─── Types de données ────────────────────────────────────────────────────────

export interface AgentTeam {
  id: number;
  description: string;
  idSite: number;
  siteDescription: string;
}

export interface AgentTeamMember {
  id: number;
  agentOid: string;
  agentId: number;
  agentName: string;
}

export interface AvailableAgent {
  oid: string;
  name: string;
}

export interface AgentSite {
  id: number;
  description: string;
}

// ─── DTOs (payloads envoyés au backend) ──────────────────────────────────────

export interface CreateAgentTeamDto {
  description: string;
  idSite: number;
  agentOids: string[];
}

export interface UpdateAgentTeamDto {
  description: string;
  agentOids: string[];
}

// ─── State Redux ──────────────────────────────────────────────────────────────

export interface AgentTeamState {
  teams: AgentTeam[];
  members: AgentTeamMember[];
  availableAgents: AvailableAgent[];
  sites: AgentSite[];
  selectedTeamId: number | null;
  loading: boolean;
  membersLoading: boolean;
  agentsLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ─── Payloads Saga ────────────────────────────────────────────────────────────

export interface FetchAvailableAgentsPayload {
  customerId: number;
  excludeTeamId?: number;
}

export interface CreateTeamPayload {
  dto: CreateAgentTeamDto;
  onSuccess: () => void;
}

export interface UpdateTeamPayload {
  id: number;
  dto: UpdateAgentTeamDto;
  onSuccess: () => void;
}

export interface DeleteTeamPayload {
  id: number;
  onSuccess: () => void;
}
export interface RemoveMembersPayload {
  teamId:    number
  agentOids: string[]
  onSuccess: () => void
}