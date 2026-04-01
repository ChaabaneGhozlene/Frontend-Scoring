import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { saveViewConfigRequest } from '../Recordingslice'
import {
  modalOverlay, modalBase, modalHeader, modalHeaderTitle, modalCloseBtn,
  modalBody, modalFooter,
  fieldGroup, fieldLabel, fieldInput, fieldInputErr, fieldErrTxt,
  btnCancel, btnDanger,
  errorBox,
} from '../../Style/ComponentsStyles'

interface Props {
  opened:        boolean
  onClose:       () => void
  currentLayout: string
}

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
      stroke="currentColor" strokeWidth="2" fill="none"/>
    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2"/>
    <polyline points="7 3 7 8 15 8"           stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const SaveViewConfigModal = ({ opened, onClose, currentLayout }: Props) => {
  const dispatch = useDispatch()
  const [name,    setName]    = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Le nom de la vue est obligatoire.'); return }

    let layout = currentLayout
    try {
      const parsed = JSON.parse(currentLayout)
      if (!parsed || Object.keys(parsed).length === 0)
        layout = JSON.stringify({ columnVisibility: {}, columnSizing: {} })
    } catch {
      layout = JSON.stringify({ columnVisibility: {}, columnSizing: {} })
    }

    setLoading(true)
    try {
      dispatch(saveViewConfigRequest({ name: name.trim(), layoutJson: layout }))
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  // Aperçu colonnes masquées
  let layoutPreview: string | null = null
  try {
    const parsed = JSON.parse(currentLayout)
    if (parsed?.columnVisibility) {
      const hidden = Object.entries(parsed.columnVisibility)
        .filter(([, v]) => v === false)
        .map(([k]) => k)
      if (hidden.length > 0)
        layoutPreview = `Colonnes masquées : ${hidden.join(', ')}`
    }
  } catch { /* pas de preview */ }

  if (!opened) return null

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBase, width: 380 }}>

        {/* Header */}
        <div style={modalHeader}>
          <SaveIcon />
          <span style={modalHeaderTitle}>Sauvegarder la vue</span>
          <button style={modalCloseBtn} onClick={handleClose}>✕</button>
        </div>

        {/* Body */}
        <div style={modalBody}>

          {/* Champ nom */}
          <div style={fieldGroup}>
            <label style={fieldLabel}>Nom de la vue <span style={{ color:'#DC2626' }}>*</span></label>
            <input
              style={{ ...fieldInput, ...(error ? fieldInputErr : {}) }}
              placeholder="Ex: Vue superviseur, Vue complète…"
              value={name}
              onChange={e => { setName(e.currentTarget.value); setError(null) }}
              autoFocus
            />
            {error && <span style={fieldErrTxt}>{error}</span>}
          </div>

          {/* Aperçu layout */}
          {layoutPreview && (
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
              {layoutPreview}
            </p>
          )}

          {/* Erreur globale */}
          {error && !name && (
            <div style={errorBox}>{error}</div>
          )}

        </div>

        {/* Footer */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={handleClose} disabled={loading}>
            Annuler
          </button>
          <button
  style={{ ...btnDanger, opacity: !name.trim() ? .5 : 1 }}  // ← btnDanger
            onClick={handleSave}  
            disabled={loading || !name.trim()}
          >
            <SaveIcon />
            {loading ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default SaveViewConfigModal