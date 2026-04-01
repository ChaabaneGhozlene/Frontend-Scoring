// components/evaluation/DeleteConfirmModal.tsx
import React from 'react'
import {
  modalOverlay,
  confirmModal, confirmIconWrap, confirmIconCircle,
  confirmTitle, confirmMsg, confirmFooter,
  confirmBtnCancel, confirmBtnDanger,
} from '../../Style/ComponentsStyles'

interface Props {
  opened:       boolean
  onClose:      () => void
  onConfirm:    () => void
  recordLabel?: string
  loading:      boolean
  title?:       string
  message?:     string
}

const TrashIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 6l-1 14H6L5 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 6V4h6v2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DeleteConfirmModal: React.FC<Props> = ({
  opened, onClose, onConfirm, recordLabel, loading,
  title   = 'Confirmer la suppression',
  message = 'Voulez-vous vraiment supprimer cet élément ?',
}) => {
  if (!opened) return null
  return (
    <div style={modalOverlay}>
      <div style={confirmModal}>
        <div style={confirmIconWrap}>
          <div style={confirmIconCircle}><TrashIcon /></div>
        </div>
        <h3 style={confirmTitle}>{title}</h3>
        <p style={confirmMsg}>
          {message}
          {recordLabel && (
            <><br /><strong style={{ color: '#111' }}> « {recordLabel} »</strong></>
          )}
        </p>
        <div style={confirmFooter}>
          <button style={confirmBtnCancel} onClick={onClose} disabled={loading}>Annuler</button>
          <button style={confirmBtnDanger} onClick={onConfirm} disabled={loading}>
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal