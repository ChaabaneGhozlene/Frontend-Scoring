import React, { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LsTemplateDto, LsTemplatePeriodeDto, ChangeModelDto } from '../ConfigurationCampagnestypes'
import {
  modalOverlay, modalBase,
  modalHeader, modalHeaderTitle, modalHeaderIcon, modalCloseBtn,
  modalFooter, modalBody,
  fieldGroup, fieldLabel, fieldInput, fieldInputErr, fieldErrTxt,
  btnCancel, btnDanger,
} from '../../../Style/ComponentsStyles'

interface Props {
  template: LsTemplateDto
  periodes: LsTemplatePeriodeDto[]
  onConfirm: (dto: ChangeModelDto) => void
  onClose: () => void
}

const ChangeModelModal: React.FC<Props> = ({ template, periodes, onConfirm, onClose }) => {
  const [description, setDescription] = useState('')
  const [min, setMin]                 = useState(0)
  const [max, setMax]                 = useState(100)
  const [periodeId, setPeriodeId]     = useState<number>(0)
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [errors, setErrors]           = useState<Record<string, string>>({})

  useEffect(() => {
    setDescription(`${template.description} V${template.version + 1}`)
    setMin(template.min)
    setMax(template.max)
    setPeriodeId(template.lsTemplatePeriodeId ?? 0)
    if (template.endDate) {
      const d = new Date(template.endDate)
      d.setDate(d.getDate() + 1)
      setStartDate(d.toISOString().slice(0, 10))
      const e = new Date(d)
      e.setFullYear(e.getFullYear() + 1)
      setEndDate(e.toISOString().slice(0, 10))
    }
  }, [template])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!description.trim()) e.description = 'Champ requis'
    if (!periodeId)           e.periode     = 'Champ requis'
    if (!startDate)           e.startDate   = 'Champ requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onConfirm({ description, min, max, lsTemplatePeriodeId: periodeId, startDate, endDate, itemGroups: [], selectedCampaignParams: [] })
  }

  return (
    <div style={modalOverlay}>
      <div style={modal}>

        {/* ── Header ── */}
        <div style={modalHeader}>
          <div style={headerIcon}>⇄   </div>
          <div style={{ flex: 1 }}>
            <div style={modalHeaderTitle}>Nouvelle version du modèle</div>
            <div style={headerSub}>
              V{template.version} → <strong>V{template.version + 1}</strong>
            </div>
          </div>
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Avertissement ── */}
        <div style={warnBox}>
          ⚠️ L'ancien modèle <strong>V{template.version}</strong> sera <strong>désactivé</strong> et
          ses campagnes <strong>copiées automatiquement</strong> vers la <strong>V{template.version + 1}</strong>.
        </div>

        {/* ── Corps ── */}
        <div style={modalBody}>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Description *</label>
            <input style={{ ...fieldInput, ...(errors.description ? fieldInputErr : {}) }}
              value={description} onChange={e => setDescription(e.target.value)} />
            {errors.description && <span style={fieldErrTxt}>{errors.description}</span>}
          </div>

          <div style={row2}>
            <div style={fieldGroup}>
              <label style={fieldLabel}>Score Min</label>
              <input style={fieldInput} type="number" value={min}
                onChange={e => setMin(Number(e.target.value))} />
            </div>
            <div style={fieldGroup}>
              <label style={fieldLabel}>Score Max</label>
              <input style={fieldInput} type="number" value={max}
                onChange={e => setMax(Number(e.target.value))} />
            </div>
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Période *</label>
            <select style={{ ...fieldInput, ...(errors.periode ? fieldInputErr : {}) }}
              value={periodeId} onChange={e => setPeriodeId(Number(e.target.value))}>
              <option value={0}>-- Sélectionner --</option>
              {periodes.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
            </select>
            {errors.periode && <span style={fieldErrTxt}>{errors.periode}</span>}
          </div>

          <div style={row2}>
            <div style={fieldGroup}>
              <label style={fieldLabel}>Date Début *</label>
              <input style={{ ...fieldInput, ...(errors.startDate ? fieldInputErr : {}) }}
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              {errors.startDate && <span style={fieldErrTxt}>{errors.startDate}</span>}
            </div>
            <div style={fieldGroup}>
              <label style={fieldLabel}>Date Fin</label>
              <input style={fieldInput} type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={onClose}>Annuler</button>
          <button style={btnDanger} onClick={handleSubmit}>Valider</button>
        </div>

      </div>
    </div>
  )
}

// ── 4 constantes locales seulement ──────────────────────────────────
const modal:     CSSProperties = { ...modalBase,       width: 500 }
const headerIcon:CSSProperties = { ...modalHeaderIcon, background: '#DC2626' }
const headerSub: CSSProperties = { fontSize: 12, color: '#888', marginTop: 2 }
const warnBox:   CSSProperties = { background:'#FFF7ED', borderLeft:'3px solid #F97316',
                                    padding:'10px 16px', fontSize:12, color:'#7C2D12',
                                    margin:'12px 20px 0' }
const row2:      CSSProperties = { display: 'flex', gap: 12 }

export default ChangeModelModal