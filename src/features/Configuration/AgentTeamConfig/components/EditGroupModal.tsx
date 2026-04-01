import React, { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAvailableAgentsRequest, updateTeamRequest,
  clearMessages, clearAvailableAgents,
} from '../AgentTeamSlice'
import type { RootState } from '../../../../app/store'
import {
  modalOverlay, modalCloseBtn, modalFooter,
  btnCancel, btnDanger,
  tabModal, tabTitleBar, tabTitleTxt, tabsBar, tabActive, tabInactive, tabBody,
  formGrid, formRow, formLabel, formField, formInp,
  transferWrap, transferCol, transferColTitle, 
  transferBtnsCol, transferBtn, transferBtnBold,
  readonlyInput, errorBox,
} from '../../../Style/ComponentsStyles'

interface Props {
  opened: boolean
  onClose: () => void
}

const EditGroupModal: React.FC<Props> = ({ opened, onClose }) => {
  const dispatch = useDispatch()
  const { teams, selectedTeamId, members, availableAgents, agentsLoading, loading, error } =
    useSelector((s: RootState) => s.agentTeam)

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null

  const [description,  setDescription]  = useState('')
  const [selectedOids, setSelectedOids] = useState<string[]>([])
  const [activeTab,    setActiveTab]    = useState<'infos' | 'agents'>('infos')
  const [hoveredLeft,  setHoveredLeft]  = useState<string | null>(null)
  const [hoveredRight, setHoveredRight] = useState<string | null>(null)

  useEffect(() => {
    if (opened && selectedTeam) {
      setDescription(selectedTeam.description)
      setActiveTab('infos')
      dispatch(clearMessages())
      setSelectedOids(members.map(m => m.agentOid))
      dispatch(clearAvailableAgents())
      dispatch(fetchAvailableAgentsRequest({
        customerId:    selectedTeam.idSite,
        excludeTeamId: selectedTeam.id,
      }))
    }
  }, [opened, selectedTeam, dispatch])

  if (!opened) return null

  const leftAgents  = availableAgents.filter(a => !selectedOids.includes(a.oid))
  const allAgents   = [
    ...availableAgents,
    ...members.map(m => ({ oid: m.agentOid, name: m.agentName })),
  ]
  const uniqueAll   = Array.from(new Map(allAgents.map(a => [a.oid, a])).values())
  const rightAgents = uniqueAll.filter(a => selectedOids.includes(a.oid))

  const handleAddOne    = () => { if (leftAgents.length  > 0) setSelectedOids(p => [...p, leftAgents[0].oid]) }
  const handleAddAll    = () => setSelectedOids(p => [...p, ...availableAgents.map(a => a.oid).filter(o => !p.includes(o))])
  const handleRemoveOne = () => { if (rightAgents.length > 0) setSelectedOids(p => p.filter(o => o !== rightAgents[rightAgents.length - 1].oid)) }
  const handleRemove    = (oid: string) => setSelectedOids(p => p.filter(o => o !== oid))
  const handleRemoveAll = () => setSelectedOids([])

  const handleSubmit = () => {
    if (!selectedTeamId || !description.trim()) return
    dispatch(updateTeamRequest({
      id:  selectedTeamId,
      dto: { description: description.trim(), agentOids: selectedOids },
      onSuccess: onClose,
    }))
  }

  const isDisabled = !description.trim() || loading

  return (
    <div style={modalOverlay}>
      <div style={modal}>

        {/* ── Title bar ── */}
        <div style={tabTitleBar}>
          <span style={tabTitleTxt}>Modifier le Groupe</span>
          <button type="button" style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={tabsBar}>
          {(['infos', 'agents'] as const).map(t => (
            <button type="button" key={t}
              style={activeTab === t ? tabActive : tabInactive}
              onClick={() => setActiveTab(t)}>
              {t === 'infos' ? 'Informations Générales' : 'Agents'}
            </button>
          ))}
        </div>

        <div style={tabBody}>

          {/* ── Tab Infos ── */}
          {activeTab === 'infos' && (
            <div style={formGrid}>
              <div style={formRow}>
                <label style={formLabel}>Description :</label>
                <div style={formField}>
                  <input style={formInp} value={description}
                    onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div style={formRow}>
                <label style={formLabel}>Site :</label>
                <div style={formField}>
                  <input style={readonlyInput}
                    value={selectedTeam?.siteDescription ?? ''} readOnly disabled />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab Agents ── */}
          {activeTab === 'agents' && (
            <div style={transferWrap}>

              {/* Colonne gauche */}
              <div style={transferCol}>
                <div style={transferColTitle}>Tous</div>
                <div style={agentListBox}>
                  {agentsLoading ? (
                    <div style={listEmpty}>Chargement…</div>
                  ) : leftAgents.length === 0 ? (
                    <div style={listEmpty}>Aucun agent disponible</div>
                  ) : leftAgents.map(agent => (
                    <div key={agent.oid}
                      style={{ ...listItem, background: hoveredLeft === agent.oid ? '#1565C0' : 'transparent', color: hoveredLeft === agent.oid ? '#fff' : '#222' }}
                      onMouseEnter={() => setHoveredLeft(agent.oid)}
                      onMouseLeave={() => setHoveredLeft(null)}
                      onClick={() => setSelectedOids(p => p.includes(agent.oid) ? p : [...p, agent.oid])}>
                      {agent.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons transfert */}
              <div style={transferBtnsCol}>
                <button style={transferBtn}     onClick={handleAddOne}    disabled={leftAgents.length === 0}>Ajouter &gt;</button>
                <button style={transferBtnBold} onClick={handleAddAll}    disabled={leftAgents.length === 0}>Ajouter tous &gt;&gt;</button>
                <div style={{ height: 8 }} />
                <button style={transferBtn}     onClick={handleRemoveOne} disabled={rightAgents.length === 0}>&lt; Supprimer</button>
                <button style={transferBtn}     onClick={handleRemoveAll} disabled={selectedOids.length === 0}>&lt;&lt; Supprimer tous</button>
              </div>

              {/* Colonne droite */}
              <div style={transferCol}>
                <div style={transferColTitle}>Agents sélectionnés</div>
                <div style={agentListBox}>
                  {rightAgents.length === 0 ? (
                    <div style={listEmpty}>Aucun agent sélectionné</div>
                  ) : rightAgents.map(agent => (
                    <div key={agent.oid}
                      style={{ ...listItem, background: hoveredRight === agent.oid ? '#1565C0' : 'transparent', color: hoveredRight === agent.oid ? '#fff' : '#222' }}
                      onMouseEnter={() => setHoveredRight(agent.oid)}
                      onMouseLeave={() => setHoveredRight(null)}
                      onClick={() => handleRemove(agent.oid)}>
                      {agent.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {error && <div style={errorBox}>⚠️ {error}</div>}
        </div>

        {/* ── Footer ── */}
        <div style={modalFooter}>
          <button type="button" style={btnCancel} onClick={onClose}>Quitter</button>
          <button type="button" style={isDisabled ? btnDisabled : btnDanger}
            onClick={handleSubmit} disabled={isDisabled}>
            {loading ? 'Enregistrement…' : 'Valider'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── 3 constantes locales seulement ──────────────────────────────────
const modal:       CSSProperties = { ...tabModal, width: 660 }
const agentListBox:CSSProperties = { border:'1px solid #bbb',height:260,overflowY:'auto' as const,background:'#fff' }
const listItem:    CSSProperties = { padding:'5px 8px',fontSize:13,cursor:'pointer',userSelect:'none' as const }
const listEmpty:   CSSProperties = { padding:12,fontSize:12,color:'#aaa',textAlign:'center' as const }
const btnDisabled: CSSProperties = { ...btnDanger, opacity:0.6, cursor:'not-allowed' }

export default EditGroupModal