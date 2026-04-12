// components/evaluation/SurveyModalBase.tsx
// Base partagée — ne pas utiliser directement, passer par SurveyEditModal ou Evalsurveymodal
import React, { useState, useEffect } from 'react'
import {
  btnCancel, btnPrimary,
  modalBase, modalCloseBtn, modalFooter,
  modalHeader, modalHeaderIcon, modalHeaderTitle, modalOverlay,
} from '../../Style/ComponentsStyles'
import type { SurveyItemDto, UpdateSurveyDto } from '../../evaluation/Evaluationtypes'

// ─────────────────────────────────────────────
//  Props publiques
// ─────────────────────────────────────────────
// SurveyModalBase.tsx — change the interface
export interface SurveyModalBaseProps {
  opened:       boolean
  onClose:      () => void
  onSave:       (dto: UpdateSurveyDto) => void
  onListen?:    () => void
  items:        SurveyItemDto[]
  loading:      boolean
  saveLoading:  boolean
  error:        string | null
  surveyScore:  number
  surveyLabel:  string
  categories?:  { id: number; libelle: string }[]   // ← optional
  callReasons?: { id: number; libelle: string }[]   // ← optional
  recordDate?:  string | null
  date?:        string | null
  auditeur?:    string | null
  indice?:      string | null
  resetOnOpen?: boolean
    // ✅ ajouts
  initialMemo?:         string | null
  initialActionTaken?:  string | null
  initialCategoryId?:   number | null
  initialCallReasonId?: number | null
  audioUrl?:     string | null        // ← AJOUTER
  audioLoading?: boolean              // ← AJOUTER optionnel

}

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
const S = {
  modalInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: 900,
    maxHeight: '95vh',
    overflow: 'hidden',
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto' as const,
    minHeight: 0,
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderBottom: '1px solid #f0f0f0',
  },
  leftCol: {
    padding: '16px 20px',
    borderRight: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  rightCol: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  infoTable: { fontSize: 13, borderCollapse: 'collapse' as const, width: '100%' },
  infoLabel: {
    color: '#9ca3af', paddingRight: 12, paddingBottom: 5,
    whiteSpace: 'nowrap' as const, verticalAlign: 'top' as const,
  },
  infoValue: { color: '#374151', paddingBottom: 5 },
  listenBtn: {
    width: 46, height: 46, borderRadius: '50%',
    background: '#fce8e8', border: '2px solid #f5a0a0',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  listenLabel: { fontSize: 12, color: '#DC2626', fontWeight: 600 },
  fieldRow:    { display: 'flex', alignItems: 'center' as const, gap: 10 },
  fieldRowTop: { display: 'flex', alignItems: 'flex-start' as const, gap: 10 },
  fieldLabel: {
    fontSize: 13, color: '#374151',
    minWidth: 130, flexShrink: 0, paddingTop: 2,
  } as React.CSSProperties,
  select: {
    flex: 1, padding: '5px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 13, outline: 'none', background: '#fff',
  },
  textarea: {
    flex: 1, padding: '5px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 13, outline: 'none',
    resize: 'vertical' as const, fontFamily: 'inherit', minHeight: 52,
  },
  scoreBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 20px', background: '#fef2f2',
    borderBottom: '1px solid #f0f0f0', fontSize: 13,
  },
  ccRow: {
    padding: '10px 20px', borderTop: '1px solid #f0f0f0',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  itemsBody: { padding: '12px 20px' },
  sectionHeader: {
    background: '#f3f4f6', borderRadius: 5,
    padding: '6px 12px', marginBottom: 8, marginTop: 14,
    fontSize: 12, fontWeight: 700, color: '#374151',
    textTransform: 'uppercase' as const, letterSpacing: 0.5,
    borderLeft: '3px solid #DC2626',
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 4px', borderBottom: '1px solid #f0f0f0',
  },
  questionTxt: { flex: 1, fontSize: 13, color: '#333' },
  descTxt:     { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  valueInput: {
    width: 70, padding: '4px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 13, textAlign: 'center' as const, outline: 'none',
  },
  range: { fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' as const },
  naBtn: (active: boolean): React.CSSProperties => ({
    padding: '3px 10px', borderRadius: 5, border: '1px solid',
    fontSize: 11, cursor: 'pointer', fontWeight: 600,
    background:  active ? '#fee2e2' : '#f9fafb',
    color:       active ? '#dc2626' : '#6b7280',
    borderColor: active ? '#dc2626' : '#d1d5db',
  }),
  memoInput: {
    width: '100%', padding: '4px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 12, outline: 'none',
    resize: 'vertical' as const, minHeight: 36,
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
  },
  spinner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 0', fontSize: 13, color: '#6b7280',
  },
  errorBox: {
    background: '#fff0f0', border: '1px solid #f5a0a0',
    padding: '8px 12px', fontSize: 12, color: '#c00',
    marginBottom: 10, borderRadius: 4,
  },
}

// ─────────────────────────────────────────────
//  State interne d'un item
// ─────────────────────────────────────────────
interface ItemState { id: number; value: string; isNA: boolean; memo: string }

// ─────────────────────────────────────────────
//  Composant
// ─────────────────────────────────────────────
const SurveyModalBase: React.FC<SurveyModalBaseProps> = ({
  opened, onClose, onSave, onListen,
  items = [], loading, saveLoading, error,
  surveyScore, surveyLabel,
   categories = [],    
  callReasons = [],    
  recordDate, date, auditeur, indice,
  resetOnOpen = false,
    initialMemo         = null,
  initialActionTaken  = null,
  initialCategoryId   = null,
  initialCallReasonId = null,
    audioUrl,
  audioLoading,
}) => {
  const [itemStates,   setItemStates]   = useState<ItemState[]>([])
  const [categoryId,   setCategoryId]   = useState('')
  const [callReasonId, setCallReasonId] = useState('')
  const [commentaire,  setCommentaire]  = useState('')
  const [actionPrise,  setActionPrise]  = useState('')
  const [ccEmail,      setCcEmail]      = useState('')

  useEffect(() => {
    if (!opened) return
    setItemStates(items.map(it => ({
      id:    it.id,
      value: it.allowNA && it.value === -1 ? '' : String(it.value),
      isNA:  it.allowNA && it.value === -1,
      memo:  it.memo ?? '',
    })))
    if (resetOnOpen) {
      setCategoryId('')
      setCallReasonId('')
      setCommentaire('')
      setActionPrise('')
      setCcEmail('')
    }
     else {
    // ✅ pré-remplir avec les valeurs existantes
    setCategoryId(initialCategoryId   ? String(initialCategoryId)   : '')
    setCallReasonId(initialCallReasonId ? String(initialCallReasonId) : '')
    setCommentaire(initialMemo       ?? '')
    setActionPrise(initialActionTaken ?? '')
  }
}, [items, opened, resetOnOpen, initialMemo, initialActionTaken, initialCategoryId, initialCallReasonId])
  

  const setField = (id: number, key: keyof ItemState, val: string | boolean) =>
    setItemStates(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s))

  const handleSubmit = () => {
    const dto: UpdateSurveyDto = {
      items: itemStates.map(s => ({
        id:    s.id,
        value: s.isNA ? -1 : (parseFloat(s.value) || 0),
        memo:  s.memo,
      })),
      memo:            commentaire   || undefined,
      memoActionTaken: actionPrise   || undefined,
      categoryId:      categoryId    ? parseInt(categoryId)   : null,
      callReasonId:    callReasonId  ? parseInt(callReasonId) : null,
      ccEmail:         ccEmail       || null,
    }
    onSave(dto)
  }

  // Grouper les items par section
  const sections = new Map<string, { sectionName: string; items: SurveyItemDto[] }>()
  items.forEach(it => {
    const key = it.sectionName ?? ''
    if (!sections.has(key)) sections.set(key, { sectionName: it.sectionName ?? '', items: [] })
    sections.get(key)!.items.push(it)
  })

  return !opened ? null : (
    <div style={modalOverlay}>
      <div style={{ ...modalBase, ...S.modalInner }}>

        {/* ── Header fixe ── */}
        <div style={modalHeader}>
          <div style={{ ...modalHeaderIcon, background: '#DC2626' }}>✏️</div>
          <span style={modalHeaderTitle}>Evaluation — {surveyLabel}</span>
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Zone scrollable unique ── */}
        <div style={S.scrollBody}>

          {/* Top 2-colonnes */}
          <div style={S.topGrid}>

            {/* Gauche : infos + écouter */}
            <div style={S.leftCol}>
              <table style={S.infoTable}>
                <tbody>
                  <tr><td style={S.infoLabel}>Record Date:</td><td style={S.infoValue}>{recordDate ?? '—'}</td></tr>
                  <tr><td style={S.infoLabel}>Date:</td><td style={{ ...S.infoValue, fontWeight: 700 }}>{date ?? '—'}</td></tr>
                  <tr><td style={S.infoLabel}>Auditeur:</td><td style={S.infoValue}>{auditeur ?? '—'}</td></tr>
                  <tr><td style={S.infoLabel}>Indice:</td><td style={S.infoValue}>{indice ?? '—'}</td></tr>
                </tbody>
              </table>
              {/* Lecteur audio inline */}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, marginTop: 16 }}>
  
  {/* Lecteur affiché au-dessus si audioUrl disponible */}
  {audioUrl && (
    <audio
      key={audioUrl}
      controls
      autoPlay
      style={{
        width: '100%',
        height: 36,
        marginBottom: 6,
        borderRadius: 6,
        outline: 'none',
      }}
    >
      <source src={audioUrl} />
    </audio>
  )}

  {audioLoading && (
    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
      Chargement…
    </div>
  )}

  {/* Bouton Écouter */}
  <button
    style={{
      ...S.listenBtn,
      opacity: audioLoading ? 0.6 : 1,
      cursor: audioLoading ? 'not-allowed' : 'pointer',
    }}
    onClick={() => {
      console.log('🖱️ Écouter cliqué, onListen:', typeof onListen)
      onListen?.()
    }}
    disabled={audioLoading}
    title="Écouter l'appel"
  >
    {audioLoading ? '⏳' : '🎧'}
  </button>
  <span style={S.listenLabel}>Ecouter</span>
</div>
            </div>

            {/* Droite : champs éditables */}
            <div style={S.rightCol}>
              <div style={S.fieldRow}>
                <label style={S.fieldLabel}>Catégories:</label>
                <select style={S.select} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="" />
                  {categories.map(c => <option key={c.id} value={String(c.id)}>{c.libelle}</option>)}
                </select>
              </div>
              <div style={S.fieldRow}>
                <label style={S.fieldLabel}>Raison d'appel:</label>
                <select style={S.select} value={callReasonId} onChange={e => setCallReasonId(e.target.value)}>
                  <option value="" />
                  {callReasons.map(c => <option key={c.id} value={String(c.id)}>{c.libelle}</option>)}
                </select>
              </div>
              <div style={S.fieldRowTop}>
                <label style={S.fieldLabel}>Commentaire:</label>
                <textarea style={S.textarea} rows={2} value={commentaire} onChange={e => setCommentaire(e.target.value)} />
              </div>
              <div style={S.fieldRowTop}>
                <label style={S.fieldLabel}>Action prise avec l'agent:</label>
                <textarea style={S.textarea} rows={2} value={actionPrise} onChange={e => setActionPrise(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div style={S.scoreBar}>
            <span style={{ color: '#6b7280' }}>Score actuel :</span>
            <strong style={{ color: '#DC2626', fontSize: 15 }}>{surveyScore}%</strong>
          </div>

          {/* Items par section */}
          <div style={S.itemsBody}>
            {error   && <div style={S.errorBox}>{error}</div>}
            {loading && <div style={S.spinner}>Chargement…</div>}
            {!loading && [...sections.values()].map(sec => (
              <div key={sec.sectionName}>
                {sec.sectionName && <div style={S.sectionHeader}>{sec.sectionName}</div>}
                {sec.items.map(it => {
                  const st = itemStates.find(s => s.id === it.id)
                  if (!st) return null
                  return (
                    <div key={it.id}>
                      <div style={S.itemRow}>
                        <div style={S.questionTxt}>
                          <div>{it.question}</div>
                          {it.description && <div style={S.descTxt}>{it.description}</div>}
                        </div>
                        <span style={S.range}>[{it.minValue}–{it.maxValue}]</span>
                        <input
                          type="number"
                          style={{ ...S.valueInput, opacity: st.isNA ? 0.4 : 1, pointerEvents: st.isNA ? 'none' : 'auto' }}
                          value={st.isNA ? '' : st.value}
                          min={it.minValue} max={it.maxValue} step={1}
                          onChange={e => setField(it.id, 'value', e.target.value)}
                          disabled={st.isNA}
                        />
                        {it.allowNA && (
                          <button style={S.naBtn(st.isNA)} onClick={() => setField(it.id, 'isNA', !st.isNA)}>N/A</button>
                        )}
                      </div>
                      <div style={{ paddingLeft: 4, paddingBottom: 6 }}>
                        <textarea
                          style={S.memoInput} placeholder="Commentaire…"
                          value={st.memo} rows={1}
                          onChange={e => setField(it.id, 'memo', e.target.value)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* CC Email */}
          <div style={S.ccRow}>
            <label style={{ ...S.fieldLabel, minWidth: 130, flexShrink: 0 }}>CC Email :</label>
            <input
              type="email"
              style={{ flex: 1, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, outline: 'none' }}
              placeholder="email@exemple.com"
              value={ccEmail}
              onChange={e => setCcEmail(e.target.value)}
            />
          </div>

        </div>
        {/* end scrollBody */}

        {/* ── Footer fixe ── */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={onClose} disabled={saveLoading}>Annuler</button>
          <button
            style={{ ...btnPrimary, background: '#DC2626' }}
            onClick={handleSubmit}
            disabled={saveLoading || loading}
          >
            {saveLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default SurveyModalBase