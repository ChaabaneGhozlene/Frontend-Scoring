// ─────────────────────────────────────────────
// Types — Notification Setting (AgentMailConfig)
// ─────────────────────────────────────────────

export interface AgentMailConfig {
  id:    number
  oid:   string
  agent: string
  email: string | null
}

export interface AgentMailEditDetail {
  ident:    number
  oid:      string
  fullName: string
  email:    string | null
}

export interface UpdateAgentEmailPayload {
  oid:     string
  agentId: number
  email:   string
}

export interface AgentMailConfigState {
  agents:       AgentMailConfig[]
  editDetail:   AgentMailEditDetail | null
  loading:      boolean
  editLoading:  boolean
  saving:       boolean
  error:        string | null
  successMessage: string | null
}