// components/evaluation/SurveyEditModal.tsx
import React, { useState, useEffect } from 'react'
import type { SurveyItemDto, UpdateSurveyDto } from '../Evaluationtypes'
import { btnCancel, btnPrimary, modalBase, modalCloseBtn, modalFooter, modalHeader, modalHeaderIcon, modalHeaderTitle, modalOverlay } from '../../Style/ComponentsStyles'


interface Props {
  opened:      boolean
  onClose:     () => void
  onSave:      (dto: UpdateSurveyDto) => void
  items:       SurveyItemDto[]
  loading:     boolean
  saveLoading: boolean
  error:       string | null
  surveyScore: number
  surveyLabel: string
}

const S = {
  body: {
    padding: '16px 20px', overflowY: 'auto' as const,
    maxHeight: 'calc(86vh - 110px)', minWidth: 580,
  },
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
  descTxt: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  valueInput: {
    width: 70, padding: '4px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 13, textAlign: 'center' as const,
    outline: 'none',
  },
  range: { fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' as const },
  naBtn: (active: boolean): React.CSSProperties => ({
    padding: '3px 10px', borderRadius: 5, border: '1px solid',
    fontSize: 11, cursor: 'pointer', fontWeight: 600,
    background: active ? '#fee2e2' : '#f9fafb',
    color: active ? '#dc2626' : '#6b7280',
    borderColor: active ? '#dc2626' : '#d1d5db',
  }),
  memoInput: {
    width: '100%', padding: '4px 8px', border: '1px solid #d1d5db',
    borderRadius: 5, fontSize: 12, outline: 'none', resize: 'vertical' as const,
    minHeight: 36,
  },
  scoreBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', background: '#fef2f2', borderRadius: 6,
    marginBottom: 12, fontSize: 13,
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

interface ItemState {
  id:    number
  value: string   // string for input control
  isNA:  boolean
  memo:  string
}

const SurveyEditModal: React.FC<Props> = ({
  opened, onClose, onSave, items, loading, saveLoading, error, surveyScore, surveyLabel,
}) => {
  const [itemStates, setItemStates] = useState<ItemState[]>([])

  useEffect(() => {
    setItemStates(items.map(it => ({
      id:    it.id,
      value: it.allowNA && it.value === -1 ? '' : String(it.value),
      isNA:  it.allowNA && it.value === -1,
      memo:  it.memo ?? '',
    })))
  }, [items])

  if (!opened) return null

  const setField = (id: number, key: keyof ItemState, val: string | boolean) => {
    setItemStates(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s))
  }

  const handleSubmit = () => {
    const dto: UpdateSurveyDto = {
      items: itemStates.map(s => ({
        id:    s.id,
        value: s.isNA ? -1 : parseFloat(s.value) || 0,
        memo:  s.memo || '',
      })),
    }
    onSave(dto)
  }

  // group items by section
  const sections = new Map<string, { sectionName: string; items: SurveyItemDto[] }>()
  items.forEach(it => {
    const key = it.sectionName ?? ''
    if (!sections.has(key)) sections.set(key, { sectionName: it.sectionName ?? '', items: [] })
    sections.get(key)!.items.push(it)
  })

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBase, width: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ ...modalHeaderIcon, background: '#DC2626' }}>✏️</div>
          <span style={modalHeaderTitle}>Modifier évaluation — {surveyLabel}</span>
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Score summary */}
          <div style={S.scoreBar}>
            <span style={{ color: '#6b7280' }}>Score actuel :</span>
            <strong style={{ color: '#DC2626', fontSize: 15 }}>{surveyScore}%</strong>
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          {loading && <div style={S.spinner}>Chargement…</div>}

          {!loading && [...sections.values()].map(sec => (
            <div key={sec.sectionName}>
              {sec.sectionName && (
                <div style={S.sectionHeader}>{sec.sectionName}</div>
              )}
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
                        style={{
                          ...S.valueInput,
                          opacity: st.isNA ? 0.4 : 1,
                          pointerEvents: st.isNA ? 'none' : 'auto',
                        }}
                        value={st.isNA ? '' : st.value}
                        min={it.minValue}
                        max={it.maxValue}
                        step={1}
                        onChange={e => setField(it.id, 'value', e.target.value)}
                        disabled={st.isNA}
                      />
                      {it.allowNA && (
                        <button
                          style={S.naBtn(st.isNA)}
                          onClick={() => setField(it.id, 'isNA', !st.isNA)}
                        >
                          N/A
                        </button>
                      )}
                    </div>
                    {/* Memo per item */}
                    <div style={{ paddingLeft: 4, paddingBottom: 6 }}>
                      <textarea
                        style={S.memoInput}
                        placeholder="Commentaire…"
                        value={st.memo}
                        rows={1}
                        onChange={e => setField(it.id, 'memo', e.target.value)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
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

export default SurveyEditModal