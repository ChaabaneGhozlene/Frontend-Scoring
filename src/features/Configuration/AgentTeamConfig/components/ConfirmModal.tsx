import React from 'react'
import { modalOverlay,
  confirmModal, confirmIconWrap, confirmIconCircle,
  confirmTitle, confirmMsg, confirmFooter,
  confirmBtnCancel, confirmBtnDanger,
} from '../../../Style/ComponentsStyles'


interface Props {
  title?: string
  message: string
  onConfirm: () => void
  onClose: () => void
}

const WarningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 9v4M12 17h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#DC2626" strokeWidth="1.5" fill="none"/>
  </svg>
)

const ConfirmModal: React.FC<Props> = ({
  title = 'Confirmer la suppression',
  message,
  onConfirm,
  onClose,
}) => (
  <div style={modalOverlay}>
    <div style={confirmModal}>
      <div style={confirmIconWrap}>
        <div style={confirmIconCircle}><WarningIcon /></div>
      </div>
      <h3 style={confirmTitle}>{title}</h3>
      <p style={confirmMsg}>{message}</p>
      <div style={confirmFooter}>
        <button style={confirmBtnCancel} onClick={onClose}>Annuler</button>
        <button style={confirmBtnDanger} onClick={onConfirm}>Confirmer</button>
      </div>
    </div>
  </div>
)

export default ConfirmModal