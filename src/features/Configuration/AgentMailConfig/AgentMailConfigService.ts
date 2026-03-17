import axiosInstance from '../../../services/axiosInstance'
import type {
  AgentMailConfig,
  AgentMailEditDetail,
  UpdateAgentEmailPayload,
} from './AgentMailConfigTypes'

const BASE = '/configuration/agent-mail'

// ── GET liste agents ────────────────────────────────────────────────────────
export const getAgentsWithEmail = async (): Promise<AgentMailConfig[]> => {
  const res = await axiosInstance.get<AgentMailConfig[]>(BASE)
  return res.data
}

// ── GET détail agent pour popup édition ────────────────────────────────────
export const getAgentEditDetail = async (oid: string): Promise<AgentMailEditDetail> => {
  const res = await axiosInstance.get<AgentMailEditDetail>(`${BASE}/${oid}`)
  return res.data
}

// ── PUT upsert email ────────────────────────────────────────────────────────
export const upsertAgentEmail = async (dto: UpdateAgentEmailPayload): Promise<void> => {
  await axiosInstance.put(BASE, dto)
}