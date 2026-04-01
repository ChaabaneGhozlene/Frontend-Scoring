import React, { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  upsertEmailRequest,
  clearMessages,
  clearEditDetail,
} from '../AgentMailConfigSlice'
import {
  modalOverlay, modalBase,
  modalHeader, modalHeaderTitle, modalCloseBtn,
  modalFooter, modalBody,
  fieldGroup, fieldLabel, fieldInput,
  btnCancel, btnDanger,
} from '../../../Style/ComponentsStyles'
import type { RootState } from '../../../../app/store'

interface Props {
  opened: boolean
  onClose: () => void
}

const EditEmailModal: React.FC<Props> = ({ opened, onClose }) => {
  const dispatch = useDispatch()
  const { editDetail, editLoading, saving, error, successMessage } = useSelector(
    (s: RootState) => s.agentMailConfig
  )

  const [email, setEmail] = useState('')

  useEffect(() => {
    if (editDetail) setEmail(editDetail.email ?? '')
  }, [editDetail])

  useEffect(() => {
    if (successMessage) onClose()
  }, [successMessage, onClose])

  if (!opened) return null

  const handleSubmit = () => {
    if (!editDetail || !email.trim()) return
    dispatch(upsertEmailRequest({
      oid:     editDetail.oid,
      agentId: editDetail.ident,
      email:   email.trim(),
    }))
  }

  const handleClose = () => {
    dispatch(clearMessages())
    dispatch(clearEditDetail())
    onClose()
  }

  const isDisabled = !email.trim() || saving || editLoading

  return (
    <div style={modalOverlay}>
      <div style={modal}>

        {/* ── Header ── */}
        <div style={modalHeader}>
          <span style={modalHeaderTitle}>Modifier l'Email de Notification</span>
          <button style={modalCloseBtn} onClick={handleClose}>✕</button>
        </div>

        {/* ── Body ── */}
        <div style={modalBody}>
          {editLoading ? (
            <div style={loadingBox}>Chargement…</div>
          ) : (
            <>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Identifiant Agent</label>
                <input style={readonlyInput}
                  value={editDetail?.ident ?? ''} readOnly disabled />
              </div>

              <div style={fieldGroup}>
                <label style={fieldLabel}>Nom Complet</label>
                <input style={readonlyInput}
                  value={editDetail?.fullName ?? ''} readOnly disabled />
              </div>

              <div style={fieldGroup}>
                <label style={fieldLabel}>Email de Notification</label>
                <input style={fieldInput} type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com" />
              </div>

              {error && <div style={errorBox}>⚠️ {error}</div>}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={handleClose}>Quitter</button>
          <button style={isDisabled ? btnDisabled : btnDanger}
            onClick={handleSubmit} disabled={isDisabled}>
            {saving ? 'Enregistrement…' : 'Valider'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── 4 constantes locales seulement ──────────────────────────────────
const modal:         CSSProperties = { ...modalBase, width: 480 }
const readonlyInput: CSSProperties = { ...fieldInput, background: '#f0f0f0', color: '#999' }
const loadingBox:    CSSProperties = { padding: 24, textAlign: 'center' as const, color: '#888', fontSize: 13 }
const errorBox:      CSSProperties = { background:'#fff0f0', border:'1px solid #f5a0a0', padding:'8px 12px', fontSize:12, color:'#c00', borderRadius: 4 }
const btnDisabled:   CSSProperties = { ...btnDanger, opacity: 0.6, cursor: 'not-allowed' }

export default EditEmailModal