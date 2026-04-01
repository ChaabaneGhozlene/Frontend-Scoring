import { useEffect, useState } from 'react'
import axiosInstance from '../../../services/axiosInstance'
import {
  modalOverlay,  modalHeader, modalHeaderTitle, modalCloseBtn,
  historyModal, historyBody, historyCenter, historyError,
  masterRow, masterCell, masterCellLabel, masterCellValue,
  detailTable, detailThead, detailTh, detailTd, detailMono, detailGroup,
  actionBadge,
} from '../../Style/ComponentsStyles'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListenHistoryEvent {
  login: string; firstName: string; lastName: string; profil: string
  action: string; position: string; date: string; statut: string
}

interface Props {
  opened: boolean; onClose: () => void
  recordId: number | null; recordLabel?: string
}

// ─── Badge color ──────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  play:'#16a34a', pause:'#ca8a04', stop:'#dc2626', ended:'#7c3aed',
  mute:'#f97316', unmute:'#0d9488', load:'#2563eb',
}
function badgeColor(action: string): string {
  const a = action.toLowerCase()
  for (const [k, v] of Object.entries(ACTION_COLORS)) if (a.includes(k)) return v
  return '#6b7280'
}

// ─── Spinner SVG ──────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    style={{ animation:'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="3"
      strokeLinecap="round"/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

const ListenHistoryModal = ({ opened, onClose, recordId, recordLabel }: Props) => {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ListenHistoryEvent[]>([])
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!opened || !recordId) return
    setLoading(true); setError(null); setHistory([])
    axiosInstance.get<ListenHistoryEvent[]>(`/records/${recordId}/history`)
      .then(({ data }) => setHistory(data))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false))
  }, [opened, recordId])

  if (!opened) return null

  // Grouper par login
  const grouped = history.reduce<Record<string,{
    meta: ListenHistoryEvent; events: ListenHistoryEvent[]
  }>>((acc, item) => {
    if (!acc[item.login]) acc[item.login] = { meta: item, events: [] }
    acc[item.login].events.push(item)
    return acc
  }, {})

  return (
    <div style={modalOverlay}>
      <div style={historyModal}>

        {/* Header */}
        <div style={modalHeader}>
          <span style={{ fontSize:16 }}>🎧</span>
          <span style={modalHeaderTitle}>
            Historique d'écoute
            {recordLabel && (
              <span style={{ fontWeight:400, color:'#9ca3af', fontSize:12, marginLeft:8 }}>
                — {recordLabel}
              </span>
            )}
          </span>
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={historyBody}>

          {/* Chargement */}
          {loading && (
            <div style={historyCenter}>
              <Spinner />
              <span>Chargement de l'historique…</span>
            </div>
          )}

          {/* Erreur */}
          {!loading && error && (
            <p style={historyError}>{error}</p>
          )}

          {/* Vide */}
          {!loading && !error && history.length === 0 && (
            <div style={historyCenter}>
              <span style={{ fontSize:28 }}>📭</span>
              <span>Aucun historique d'écoute pour cet enregistrement.</span>
            </div>
          )}

          {/* Master / detail */}
          {!loading && !error && history.length > 0 &&
            Object.values(grouped).map(group => (
              <div key={group.meta.login} style={detailGroup}>

                {/* Ligne maître */}
                <div style={masterRow}>
                  {[
                    ['Login',   group.meta.login],
                    ['Prénom',  group.meta.firstName],
                    ['Nom',     group.meta.lastName],
                    ['Profil',  group.meta.profil],
                  ].map(([label, value]) => (
                    <div key={label} style={masterCell}>
                      <div style={masterCellLabel}>{label}</div>
                      <div style={masterCellValue}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Détail */}
                <table style={detailTable}>
                  <thead style={detailThead}>
                    <tr>
                      {['Action','Position','Date','Statut'].map(h => (
                        <th key={h} style={detailTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.events.map((ev, i) => (
                      <tr key={i}>
                        <td style={detailTd}>
                          <span style={actionBadge(badgeColor(ev.action))}>
                            {ev.action}
                          </span>
                        </td>
                        <td style={detailMono}>{ev.position}</td>
                        <td style={detailTd}>{ev.date}</td>
                        <td style={detailMono}>{ev.statut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default ListenHistoryModal