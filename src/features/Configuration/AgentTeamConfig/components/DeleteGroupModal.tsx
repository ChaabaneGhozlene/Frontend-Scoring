import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteTeamRequest } from '../AgentTeamSlice'
import type { RootState } from '../../../../app/store'
import {
  modalOverlay,
  confirmModal, confirmIconWrap, confirmIconCircle,
  confirmTitle, confirmMsg, confirmFooter,
  confirmBtnCancel, confirmBtnDanger,
} from '../../../Style/ComponentsStyles'

interface Props {
  opened: boolean
  onClose: () => void
}

const WarningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 9v4M12 17h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#DC2626" strokeWidth="1.5" fill="none"/>
  </svg>
)

const DeleteGroupModal: React.FC<Props> = ({ opened, onClose }) => {
  const dispatch = useDispatch()
  const { teams, selectedTeamId, loading } = useSelector((s: RootState) => s.agentTeam)
  const team = teams.find(t => t.id === selectedTeamId)

  if (!opened) return null

  const handleConfirm = () => {
    if (!selectedTeamId) return
    dispatch(deleteTeamRequest({ id: selectedTeamId, onSuccess: onClose }))
  }

  return (
    <div style={modalOverlay}>
      <div style={confirmModal}>
        <div style={confirmIconWrap}>
          <div style={confirmIconCircle}><WarningIcon /></div>
        </div>
        <h3 style={confirmTitle}>Supprimer le groupe</h3>
        <p style={confirmMsg}>
          Êtes-vous sûr de vouloir supprimer le groupe{' '}
          <strong style={{ color: '#111' }}>« {team?.description} »</strong> ?
          <br />
          Tous les membres associés seront également supprimés.
        </p>
        <div style={confirmFooter}>
          <button style={confirmBtnCancel} onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button style={confirmBtnDanger} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteGroupModal