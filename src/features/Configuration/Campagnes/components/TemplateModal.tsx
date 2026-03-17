import React, { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type {
  LsTemplateDto, LsTemplatePeriodeDto,
  CreateLsTemplateDto, UpdateLsTemplateDto,
  ItemGroupDto, TemplateItemDto, AvailableCampaignDto,
} from '../ConfigurationCampagnestypes'
import { ConfigurationService } from '../ConfigurationCampagnesservice'
import {
  modalOverlay, modalCloseBtn, modalFooter,
  fieldInputErr, fieldErrTxt,
  btnCancel, btnDanger,
} from '../../../Style/ComponentsStyles'

interface LocalItem {
  tempId: number
  realId: number | null
  description: string
  question: string | null
  min: number
  max: number
  coef: number
  order: number
  isNa: number
  isKillerQuestion: number
  isKillerSection: number
}

interface Props {
  mode: 'create' | 'edit'
  template?: LsTemplateDto | null
  periodes: LsTemplatePeriodeDto[]
  onConfirm: (dto: CreateLsTemplateDto | UpdateLsTemplateDto) => void
  onClose: () => void
}

let _tempId = 1

const TemplateModal: React.FC<Props> = ({ mode, template, periodes, onConfirm, onClose }) => {
  const [tab, setTab] = useState<'info' | 'item' | 'campagnes'>('info')

  const [description, setDescription] = useState('')
  const [min, setMin]                 = useState(0)
  const [max, setMax]                 = useState(0)
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [periodeId, setPeriodeId]     = useState<number>(0)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  const [items, setItems]               = useState<LocalItem[]>([])
  const itemsRef                        = useRef<LocalItem[]>([])
  const [editingItem, setEditingItem]   = useState<LocalItem | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const editingItemRef                  = useRef<LocalItem | null>(null)

  const setItemsSync = (updater: LocalItem[] | ((prev: LocalItem[]) => LocalItem[])) => {
    setItems(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      itemsRef.current = next
      return next
    })
  }

  const updateEditingItem = (item: LocalItem | null) => {
    editingItemRef.current = item
    setEditingItem(item)
  }

  const [allCampaigns, setAllCampaigns]           = useState<AvailableCampaignDto[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState<AvailableCampaignDto[]>([])
  const [highlightedAll, setHighlightedAll]       = useState<string[]>([])
  const [highlightedSel, setHighlightedSel]       = useState<string[]>([])

  useEffect(() => {
    if (mode === 'edit' && template) {
      setDescription(template.description)
      setMin(template.min)
      setMax(template.max)
      setPeriodeId(template.lsTemplatePeriodeId ?? 0)
      setStartDate(template.startDate?.slice(0, 10) ?? '')
      setEndDate(template.endDate?.slice(0, 10) ?? '')

      ConfigurationService.getGroupsByTemplate(template.id)
        .then(r => {
          const groups = r.data as Array<{ id: number; items: any[] }>
          const allItems: LocalItem[] = groups.flatMap(g =>
            (g.items ?? []).map((it: any) => ({
              tempId: _tempId++,
              realId: it.id ?? null,
              description: it.description ?? '',
              question: it.question ?? null,
              min: it.min ?? 0,
              max: it.max ?? 10,
              coef: it.coef ?? 1,
              order: it.order ?? 1,
              isNa: it.isNa ?? 0,
              isKillerQuestion: it.isKillerQuestion ?? 0,
              isKillerSection: it.isKillerSection ?? 0,
            }))
          )
          setItemsSync(allItems)
        })
        .catch(() => {})

      ConfigurationService.getCampaignsByTemplate(template.id)
        .then(r => {
          const linked = r.data as Array<{ campagneDid: string; campagneDescription: string }>
          setSelectedCampaigns(linked.map(c => ({ param: c.campagneDid, display: c.campagneDescription })))
        })
        .catch(() => {})
    }

    ConfigurationService.getAvailableCampaigns()
      .then(r => setAllCampaigns(r.data))
      .catch(() => {})
  }, [mode, template])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!description.trim()) e.description = 'Champ requis'
    if (!periodeId)           e.periode     = 'Champ requis'
    if (!startDate)           e.startDate   = 'Champ requis'
    if (!endDate)             e.endDate     = 'Champ requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) { setTab('info'); return }
    const currentItems = itemsRef.current
    const itemGroups: ItemGroupDto[] = currentItems.length > 0 ? [{
      id: 0,
      description: 'Groupe Principal',
      coef: 1,
      order: 1,
      items: currentItems.map((it, idx) => ({
        id: 0,
        description: it.description,
        min: it.min,
        max: it.max,
        coef: it.coef,
        question: it.question,
        order: it.order || idx + 1,
        isNa: it.isNa,
        isKillerQuestion: it.isKillerQuestion,
        isKillerSection: it.isKillerSection,
      } as TemplateItemDto)),
    }] : []

    const selectedCampaignParams = selectedCampaigns.map(c => c.param)
    const base = { description, min, max, lsTemplatePeriodeId: periodeId, startDate, endDate }
    if (mode === 'create') {
      onConfirm({ ...base, itemGroups, selectedCampaignParams } as CreateLsTemplateDto)
    } else {
      onConfirm({ ...base, itemGroups, selectedCampaignParams } as UpdateLsTemplateDto)
    }
  }

  const newItem = (): LocalItem => ({
    tempId: _tempId++, realId: null,
    description: '', question: null,
    min: 0, max: 10, coef: 1, order: itemsRef.current.length + 1,
    isNa: 0, isKillerQuestion: 0, isKillerSection: 0,
  })

  const saveItem = () => {
    const item = editingItemRef.current
    if (!item || !item.description.trim()) return
    const isExisting = itemsRef.current.some(i => i.tempId === item.tempId)
    if (isExisting) {
      setItemsSync(prev => prev.map(i => i.tempId === item.tempId ? item : i))
    } else {
      setItemsSync(prev => [...prev, item])
    }
    setShowItemForm(false)
    updateEditingItem(null)
  }

  const deleteItem = (tempId: number) => {
    const item = itemsRef.current.find(i => i.tempId === tempId)
    if (item?.realId) {
      ConfigurationService.deleteTemplateItem(item.realId)
        .catch(() => console.error('Erreur suppression item', item.realId))
    }
    setItemsSync(prev => prev.filter(i => i.tempId !== tempId))
  }

  const addSelected = () => {
    const toAdd = allCampaigns.filter(c => highlightedAll.includes(c.param))
    setSelectedCampaigns(prev => [...prev, ...toAdd.filter(c => !prev.find(p => p.param === c.param))])
    setAllCampaigns(prev => prev.filter(c => !highlightedAll.includes(c.param)))
    setHighlightedAll([])
  }
  const addAll = () => {
    setSelectedCampaigns(prev => [...prev, ...allCampaigns.filter(c => !prev.find(p => p.param === c.param))])
    setAllCampaigns([])
    setHighlightedAll([])
  }
  const removeSelected = () => {
    const toRemove = selectedCampaigns.filter(c => highlightedSel.includes(c.param))
    setAllCampaigns(prev => [...prev, ...toRemove])
    setSelectedCampaigns(prev => prev.filter(c => !highlightedSel.includes(c.param)))
    setHighlightedSel([])
  }
  const removeAll = () => {
    setAllCampaigns(prev => [...prev, ...selectedCampaigns])
    setSelectedCampaigns([])
    setHighlightedSel([])
  }

  return (
    <div style={modalOverlay}>
      <div style={modal}>

        {/* ── Title bar ── */}
        <div style={titleBar}>
          <span style={titleTxt}>{mode === 'create' ? 'Nouveau Modèle' : 'Modifier le Modèle'}</span>
          <button type="button" style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={tabsBar}>
          {(['info', 'item', 'campagnes'] as const).map(t => (
            <button type="button" key={t}
              style={tab === t ? tabActive : tabInactive}
              onClick={() => setTab(t)}>
              {t === 'info' ? 'Informations Générales' : t === 'item' ? 'Item' : 'Campagnes'}
            </button>
          ))}
        </div>

        <div style={tabBody}>

          {/* ── Tab : Informations ── */}
          {tab === 'info' && (
            <div style={formGrid}>
              <div style={formRow}>
                <label style={formLabel}>Description :</label>
                <div style={formField}>
                  <input style={{ ...formInp, ...(errors.description ? fieldInputErr : {}) }}
                    value={description} onChange={e => setDescription(e.target.value)} />
                  {errors.description && <span style={fieldErrTxt}>{errors.description}</span>}
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>Minimum :</label>
                <div style={formField}>
                  <input style={formInpNum} type="number" value={min}
                    onChange={e => setMin(Number(e.target.value))} />
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>Maximum :</label>
                <div style={formField}>
                  <input style={formInpNum} type="number" value={max}
                    onChange={e => setMax(Number(e.target.value))} />
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>From :</label>
                <div style={formField}>
                  <input style={{ ...formInp, ...(errors.startDate ? fieldInputErr : {}) }}
                    type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  {errors.startDate && <span style={fieldErrTxt}>{errors.startDate}</span>}
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>To :</label>
                <div style={formField}>
                  <input style={{ ...formInp, ...(errors.endDate ? fieldInputErr : {}) }}
                    type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  {errors.endDate && <span style={fieldErrTxt}>{errors.endDate}</span>}
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>Période :</label>
                <div style={formField}>
                  <select style={{ ...formInp, ...(errors.periode ? fieldInputErr : {}) }}
                    value={periodeId} onChange={e => setPeriodeId(Number(e.target.value))}>
                    <option value={0}></option>
                    {periodes.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
                  </select>
                  {errors.periode && <span style={fieldErrTxt}>{errors.periode}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab : Items ── */}
          {tab === 'item' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                {!showItemForm && (
                  <button type="button" style={btnNew}
                    onClick={() => { updateEditingItem(newItem()); setShowItemForm(true) }}>
                    + New
                  </button>
                )}
              </div>

              {showItemForm && editingItem && (
                <div style={formPanel}>
                  <div style={formPanelGrid}>
                    <div style={fpField}>
                      <label style={fpLbl}>Description *</label>
                      <input type="text" style={fpInp} autoFocus
                        value={editingItem.description}
                        onChange={e => updateEditingItem({ ...editingItemRef.current!, description: e.target.value })} />
                    </div>
                    <div style={fpField}>
                      <label style={fpLbl}>Question</label>
                      <input type="text" style={fpInp}
                        value={editingItem.question ?? ''}
                        onChange={e => updateEditingItem({ ...editingItemRef.current!, question: e.target.value || null })} />
                    </div>
                    <div style={fpRow}>
                      {([
                        ['Min',          'min'],
                        ['Max',          'max'],
                        ['Coef (Weight)','coef'],
                        ['Ordre',        'order'],
                      ] as const).map(([lbl, key]) => (
                        <div key={key} style={fpFieldSm}>
                          <label style={fpLbl}>{lbl}</label>
                          <input type="number" style={fpInpSm}
                            value={editingItem[key]}
                            onChange={e => updateEditingItem({ ...editingItemRef.current!, [key]: Number(e.target.value) })} />
                        </div>
                      ))}
                    </div>
                    <div style={fpRow}>
                      {([
                        ['N/A',             'isNa'],
                        ['Killer Question', 'isKillerQuestion'],
                        ['Killer Section',  'isKillerSection'],
                      ] as const).map(([lbl, key]) => (
                        <label key={key} style={fpCheck}>
                          <input type="checkbox" checked={editingItem[key] === 1}
                            onChange={e => updateEditingItem({ ...editingItemRef.current!, [key]: e.target.checked ? 1 : 0 })} />
                          &nbsp;{lbl}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={fpActions}>
                    <button type="button" style={btnCancel}
                      onClick={() => { setShowItemForm(false); updateEditingItem(null) }}>
                      Annuler
                    </button>
                    <button type="button" style={fpSaveBtn} onClick={saveItem}>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}

              <div style={itemGridWrap}>
                <table style={itemTable}>
                  <thead>
                    <tr>
                      {['#','Description','Question','Coef','Ordre','N/A','Killer Q','Killer S',''].map((h, i) => (
                        <th key={i} style={i === 1 ? { ...iTh, width:'35%' } : iTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={9} style={iEmptyTd}>No data to display</td></tr>
                    ) : items.map((it, idx) => (
                      <tr key={it.tempId} style={iRow}
                        onClick={() => { if (!showItemForm) { updateEditingItem(it); setShowItemForm(true) } }}>
                        <td style={iTd}>{idx + 1}</td>
                        <td style={iTd}>{it.description}</td>
                        <td style={iTd}>{it.question ?? '—'}</td>
                        <td style={iTd}>{it.coef}</td>
                        <td style={iTd}>{it.order}</td>
                        <td style={iTd}>{it.isNa === 1 ? '✓' : ''}</td>
                        <td style={iTd}>{it.isKillerQuestion === 1 ? '✓' : ''}</td>
                        <td style={iTd}>{it.isKillerSection === 1 ? '✓' : ''}</td>
                        <td style={{ ...iTd, textAlign:'right' }}>
                          <button type="button" style={iDeleteBtn}
                            onClick={e => { e.stopPropagation(); deleteItem(it.tempId) }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={iPaginate}>{items.length} item(s)</div>
              </div>
            </div>
          )}

          {/* ── Tab : Campagnes ── */}
          {tab === 'campagnes' && (
            <div style={campTab}>
              <div style={campCol}>
                <div style={campColTitle}>Tous</div>
                <select multiple style={campList} value={highlightedAll}
                  onChange={e => setHighlightedAll(Array.from(e.target.selectedOptions, o => o.value))}>
                  {allCampaigns.map(c => <option key={c.param} value={c.param}>{c.display}</option>)}
                </select>
              </div>
              <div style={campBtns}>
                <button type="button" style={transferBtn} disabled={highlightedAll.length === 0} onClick={addSelected}>Ajouter &gt;</button>
                <button type="button" style={transferBtnPrimary} onClick={addAll}>Ajouter tous &gt;&gt;</button>
                <div style={{ height:16 }} />
                <button type="button" style={transferBtn} disabled={highlightedSel.length === 0} onClick={removeSelected}>&lt; Supprimer</button>
                <button type="button" style={transferBtn} disabled={selectedCampaigns.length === 0} onClick={removeAll}>&lt;&lt; Supprimer tous</button>
              </div>
              <div style={campCol}>
                <div style={campColTitle}>Campagnes sélectionnées</div>
                <select multiple style={campList} value={highlightedSel}
                  onChange={e => setHighlightedSel(Array.from(e.target.selectedOptions, o => o.value))}>
                  {selectedCampaigns.map(c => <option key={c.param} value={c.param}>{c.display}</option>)}
                </select>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div style={modalFooter}>
          <button type="button" style={btnCancel} onClick={onClose}>Quitter</button>
          <button type="button" style={btnDanger} onClick={handleSubmit}>Valider</button>
        </div>

      </div>
    </div>
  )
}

// ── Styles spécifiques à TemplateModal ───────────────────────────────────────
// (tout ce qui concerne les tabs, le layout info, la table items, et la transfer list)

const modal: CSSProperties          = { background:'#fff',borderRadius:6,width:760,maxWidth:'97vw',maxHeight:'92vh',boxShadow:'0 20px 60px rgba(0,0,0,.25)',display:'flex',flexDirection:'column',overflow:'hidden' }

// Title bar (différent de modalHeader — fond gris, pas de icône)
const titleBar: CSSProperties       = { display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',background:'#e8e8e8',borderBottom:'1px solid #ccc' }
const titleTxt: CSSProperties       = { fontSize:13,fontWeight:600,color:'#333' }

// Tabs
const tabsBar: CSSProperties        = { display:'flex',background:'#f0f0f0',borderBottom:'1px solid #ccc',padding:'6px 10px 0' }
const tabActive: CSSProperties      = { padding:'6px 16px',border:'1px solid #ccc',borderBottom:'2px solid #fff',background:'#fff',fontSize:12,fontWeight:700,color:'#333',cursor:'pointer',borderRadius:'4px 4px 0 0',marginRight:2,position:'relative',top:1 }
const tabInactive: CSSProperties    = { padding:'6px 16px',border:'1px solid transparent',background:'transparent',fontSize:12,color:'#666',cursor:'pointer',borderRadius:'4px 4px 0 0',marginRight:2 }
const tabBody: CSSProperties        = { flex:1,padding:'20px',overflowY:'auto',minHeight:300,background:'#fff' }

// Formulaire info (layout label + champ côte à côte — différent de fieldGroup)
const formGrid: CSSProperties       = { display:'flex',flexDirection:'column',gap:14 }
const formRow: CSSProperties        = { display:'flex',alignItems:'center',gap:12 }
const formLabel: CSSProperties      = { fontSize:13,color:'#333',width:100,textAlign:'right' as const,flexShrink:0 }
const formField: CSSProperties      = { flex:1,display:'flex',flexDirection:'column',gap:3 }
const formInp: CSSProperties        = { padding:'5px 8px',border:'1px solid #bbb',borderRadius:4,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box' as const }
const formInpNum: CSSProperties     = { ...formInp,width:160 }

// Formulaire item inline
const btnNew: CSSProperties         = { padding:'5px 14px',background:'#fff',border:'1px solid #bbb',borderRadius:4,fontSize:12,cursor:'pointer',color:'#333',fontWeight:600 }
const formPanel: CSSProperties      = { padding:'14px 16px',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:6 }
const formPanelGrid: CSSProperties  = { display:'flex',flexDirection:'column',gap:10 }
const fpField: CSSProperties        = { display:'flex',flexDirection:'column',gap:3 }
const fpRow: CSSProperties          = { display:'flex',gap:16,flexWrap:'wrap' as const,alignItems:'flex-end' }
const fpFieldSm: CSSProperties      = { display:'flex',flexDirection:'column',gap:3 }
const fpLbl: CSSProperties          = { fontSize:12,fontWeight:500,color:'#444' }
const fpInp: CSSProperties          = { padding:'5px 8px',border:'1px solid #d1d5db',borderRadius:4,fontSize:12,outline:'none',width:'100%',boxSizing:'border-box' as const }
const fpInpSm: CSSProperties        = { ...fpInp,width:90 }
const fpCheck: CSSProperties        = { fontSize:12,color:'#444',display:'flex',alignItems:'center',cursor:'pointer',gap:4 }
const fpActions: CSSProperties      = { display:'flex',justifyContent:'flex-end',gap:8,marginTop:12 }
const fpSaveBtn: CSSProperties      = { padding:'5px 16px',background:'#DC2626',color:'#fff',border:'none',borderRadius:4,fontSize:12,cursor:'pointer',fontWeight:600 }

// Table items
const itemGridWrap: CSSProperties   = { border:'1px solid #d1d5db',borderRadius:4,overflow:'hidden' }
const itemTable: CSSProperties      = { width:'100%',borderCollapse:'collapse' as const }
const iTh: CSSProperties            = { padding:'7px 8px',background:'#f9fafb',fontSize:11,fontWeight:600,color:'#374151',borderBottom:'1px solid #e5e7eb',textAlign:'left' as const,whiteSpace:'nowrap' as const }
const iTd: CSSProperties            = { padding:'6px 8px',fontSize:11,color:'#374151',borderBottom:'1px solid #f3f4f6' }
const iEmptyTd: CSSProperties       = { textAlign:'center' as const,padding:'28px',fontSize:12,color:'#9ca3af' }
const iPaginate: CSSProperties      = { padding:'6px 10px',fontSize:11,color:'#9ca3af',background:'#fafafa',borderTop:'1px solid #e5e7eb' }
const iRow: CSSProperties           = { cursor:'pointer' }
const iDeleteBtn: CSSProperties     = { background:'none',border:'none',cursor:'pointer',fontSize:13,padding:'2px 6px',color:'#DC2626',fontWeight:600 }

// Transfer list campagnes
const campTab: CSSProperties        = { display:'flex',alignItems:'flex-start',gap:12 }
const campCol: CSSProperties        = { flex:1,display:'flex',flexDirection:'column',gap:6 }
const campColTitle: CSSProperties   = { fontSize:12,color:'#444',fontWeight:500 }
const campList: CSSProperties       = { width:'100%',height:220,border:'1px solid #bbb',borderRadius:4,fontSize:12,padding:4,outline:'none' }
const campBtns: CSSProperties       = { display:'flex',flexDirection:'column',gap:6,justifyContent:'center',paddingTop:24 }
const transferBtn: CSSProperties    = { padding:'5px 12px',background:'#f0f0f0',border:'1px solid #bbb',borderRadius:4,fontSize:12,cursor:'pointer',color:'#555',whiteSpace:'nowrap' as const }
const transferBtnPrimary: CSSProperties = { ...transferBtn,background:'#e0e0e0',fontWeight:600,color:'#333' }

export default TemplateModal