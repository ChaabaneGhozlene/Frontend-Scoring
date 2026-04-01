import { useEffect, useState, useCallback } from 'react'
import axiosInstance from '../../../services/axiosInstance'
import {
  modalOverlay, modalHeader, modalHeaderTitle, modalCloseBtn,
  historyModal, historyBody, historyCenter, historyError,
  flatTable, flatTh, flatTd, flatTdMono, flatTrEven,
  actionBadge,
} from '../../Style/ComponentsStyles'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenHistoryItem {
  login: string; firstName: string; lastName: string; profil: string
  action: string; position: string; date: string; statut: string
}

interface Props {
  opened: boolean; onClose: () => void
  recordId: number | null; recordLabel?: string
}

// ─── Badge color ──────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  play:'#16a34a', pause:'#ca8a04', stop:'#dc2626', mute:'#6b7280',
  unmute:'#0d9488', seekforward:'#2563eb', seekreversed:'#7c3aed',
  ended:'#f97316', 'load player':'#06b6d4',
}
const badgeColor = (action: string) =>
  ACTION_COLORS[action.toLowerCase()] ?? '#6b7280'

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    style={{ animation:'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
)

// ─── Video icon SVG ───────────────────────────────────────────────────────────

const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="15" height="16" rx="2"
      stroke="#2563eb" strokeWidth="1.8" fill="none"/>
    <path d="M17 9l5-3v12l-5-3V9z"
      stroke="#2563eb" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
  </svg>
)

const COLUMNS = ['Login','Prénom','Nom','Profil','Action','Position','Date','Durée']

// ─── Component ────────────────────────────────────────────────────────────────

const ScreenHistoryModal = ({ opened, onClose, recordId, recordLabel }: Props) => {
  const [history, setHistory] = useState<ScreenHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!recordId) return
    setLoading(true); setError(null)
    try {
      const res = await axiosInstance.get(`/records/${recordId}/screen-history`)
      setHistory(res.data ?? [])
    } catch {
      setError("Erreur lors du chargement de l'historique screen.")
    } finally {
      setLoading(false)
    }
  }, [recordId])

  useEffect(() => {
    if (opened) fetchHistory()
    else        setHistory([])
  }, [opened, fetchHistory])

  if (!opened) return null

  return (
    <div style={modalOverlay}>
      <div style={{ ...historyModal, width:'900px' }}>

        {/* Header */}
        <div style={modalHeader}>
          <VideoIcon />
          <span style={modalHeaderTitle}>
            Historique Screen Recording
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
              <span>Chargement…</span>
            </div>
          )}

          {/* Erreur */}
          {!loading && error && (
            <p style={historyError}>{error}</p>
          )}

          {/* Vide */}
          {!loading && !error && history.length === 0 && (
            <div style={historyCenter}>
              <span style={{ fontSize:28 }}>🎬</span>
              <span>Aucun historique screen disponible.</span>
            </div>
          )}

          {/* Tableau plat */}
          {!loading && !error && history.length > 0 && (
            <table style={flatTable}>
              <thead>
                <tr>
                  {COLUMNS.map(c => <th key={c} style={flatTh}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} style={i % 2 === 1 ? flatTrEven : undefined}>
                    <td style={flatTd}>{row.login}</td>
                    <td style={flatTd}>{row.firstName}</td>
                    <td style={flatTd}>{row.lastName}</td>
                    <td style={flatTd}>{row.profil}</td>
                    <td style={flatTd}>
                      <span style={actionBadge(badgeColor(row.action))}>
                        {row.action.toUpperCase()}
                      </span>
                    </td>
                    <td style={flatTdMono}>{row.position}</td>
                    <td style={{ ...flatTd, whiteSpace:'nowrap' }}>{row.date}</td>
                    <td style={flatTdMono}>{row.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  )
}

export default ScreenHistoryModal