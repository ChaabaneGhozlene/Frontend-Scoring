import { useState } from 'react'

import {
  modalOverlay, modalBase, modalHeader, modalHeaderTitle, modalCloseBtn,
  modalBody, modalFooter,
  fieldGroup, fieldLabel, fieldInput, fieldInputErr, fieldErrTxt,
  btnCancel, btnDanger,
  errorBox,
} from './Style/ComponentsStyles'

// ── Types génériques (pas liés à un slice spécifique) ─────────────────────────

export interface ColumnFilter {
  id:    string;
  value: unknown;
}

export interface ViewLayoutState {
  columnVisibility:  Record<string, boolean>;
  columnSizing:      Record<string, number>;
  dateDebut?:        string;
  dateFin?:          string;
  selectedFilterId?: number | null;
  columnFilters?:    ColumnFilter[];
  pageSize?:         number;
}

interface Props {
  opened:            boolean;
  onClose:           () => void;
  currentLayout:     string;
  dateDebut?:        string;
  dateFin?:          string;
  selectedFilterId?: number | null;
  columnFilters?:    ColumnFilter[];
  pageSize?:         number;
  // ← Action à dispatcher — chaque feature passe la sienne
  onSave:            (payload: { name: string; layoutJson: string }) => void  // ← callback simple
}

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
      stroke="currentColor" strokeWidth="2" fill="none"/>
    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2"/>
    <polyline points="7 3 7 8 15 8"           stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const SaveViewConfigModal = ({
  opened,
  onClose,
  currentLayout,
  dateDebut,
  dateFin,
  selectedFilterId,
  columnFilters,
  pageSize,onSave,       // ← reçoit le callback de sauvegarde en prop
}: Props) => {
  
  const [name,    setName]    = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  const handleSave = async () => {
      console.log('=== HANDLE SAVE ===')
  console.log('selectedFilterId prop:', selectedFilterId)
  console.log('columnFilters prop:', columnFilters)
  console.log('currentLayout prop:', currentLayout)
    if (!name.trim()) { setError('Le nom de la vue est obligatoire.'); return }

    let colState: {
      columnVisibility?: Record<string, boolean>;
      columnSizing?:     Record<string, number>;
    } = {}
    try {
      colState = JSON.parse(currentLayout) ?? {}
    } catch {
      colState = { columnVisibility: {}, columnSizing: {} }
    }

    const fullLayout: ViewLayoutState = {
      columnVisibility: colState.columnVisibility ?? {},
      columnSizing:     colState.columnSizing     ?? {},
      dateDebut,
      dateFin,
      selectedFilterId: selectedFilterId ?? null,
      columnFilters:    columnFilters    ?? [],
      pageSize,
    }

      setLoading(true)
        console.log('fullLayout final:', JSON.stringify(fullLayout, null, 2))

  try {
    onSave({                          // ← use the callback, not dispatch(saveAction)
      name:       name.trim(),
      layoutJson: JSON.stringify(fullLayout),
    })
    handleClose()
  } finally {
    setLoading(false)
  }
}

  const buildPreview = (): string[] => {
    const lines: string[] = []
    try {
      const parsed = JSON.parse(currentLayout)
      if (parsed?.columnVisibility) {
        const hidden = Object.entries(parsed.columnVisibility)
          .filter(([, v]) => v === false)
          .map(([k]) => k)
        if (hidden.length > 0)
          lines.push(`Colonnes masquées : ${hidden.join(', ')}`)
      }
    } catch { /* pas de preview */ }

    if (dateDebut || dateFin)
      lines.push(`Période : ${dateDebut ?? '…'} → ${dateFin ?? '…'}`)

    if (columnFilters && columnFilters.length > 0)
      lines.push(`Filtres colonnes : ${columnFilters.map(f => f.id).join(', ')}`)

    if (selectedFilterId != null)
      lines.push(`Filtre actif : #${selectedFilterId}`)

    return lines
  }

  const previewLines = buildPreview()

  if (!opened) return null

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBase, width: 380 }}>

        <div style={modalHeader}>
          <SaveIcon />
          <span style={modalHeaderTitle}>Sauvegarder la vue</span>
          <button style={modalCloseBtn} onClick={handleClose}>✕</button>
        </div>

        <div style={modalBody}>
          <div style={fieldGroup}>
            <label style={fieldLabel}>
              Nom de la vue <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              style={{ ...fieldInput, ...(error ? fieldInputErr : {}) }}
              placeholder="Ex: Vue superviseur, Vue complète…"
              value={name}
              onChange={e => { setName(e.currentTarget.value); setError(null) }}
              autoFocus
            />
            {error && <span style={fieldErrTxt}>{error}</span>}
          </div>

          {previewLines.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {previewLines.map((line, i) => (
                <p key={i} style={{ margin: 0, fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {error && !name && <div style={errorBox}>{error}</div>}
        </div>

        <div style={modalFooter}>
          <button style={btnCancel} onClick={handleClose} disabled={loading}>
            Annuler
          </button>
          <button
            style={{ ...btnDanger, opacity: !name.trim() ? .5 : 1 }}
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