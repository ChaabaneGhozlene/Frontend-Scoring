import { useEffect, useState, useMemo } from 'react'
import type { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_RowSelectionState } from 'mantine-react-table'
import type { RootState } from '../../../../app/store'
import { fetchTeamsRequest, fetchMembersRequest, setSelectedTeamId, clearMessages, removeMembersRequest } from '../AgentTeamSlice'
import type { AgentTeamMember } from '../AgentTeamTypes'
import NewGroupModal    from '../components/NewGroupModal'
import EditGroupModal   from '../components/EditGroupModal'
import DeleteGroupModal from '../components/DeleteGroupModal'
import ConfirmModal     from '../components/ConfirmModal'

// ── Shared ────────────────────────────────────────────────────────────────────

import { badgeLbl, infoBadge, selBadge, tableWrap, toolbarBar, toolbarBtn, toolbarBtnsWrap, toolbarLbl, toolbarSelect } from '../../Pagestyles'
import PageLayout from '../../Pagelayout'
import HeaderButton, { IconDelete } from '../../Headerbutton'
import { getSharedTableProps, singleSelect, tableGroupingHint } from '../../Tableconfig'
import { useSettingsPage } from '../../Usesettingspage'


const columns: MRT_ColumnDef<AgentTeamMember>[] = [
  { accessorKey: 'agentId',   header: 'Agent ID', size: 200 },
  { accessorKey: 'agentName', header: 'Agent' },
]

const AgentTeamSettingsPage: FC = () => {
  const dispatch = useDispatch()
  const { teams, members, selectedTeamId, membersLoading, error, successMessage } =
    useSelector((s: RootState) => s.agentTeam)

  const { toast, setToast, notify } = useSettingsPage()
  const [newOpen,          setNewOpen]         = useState(false)
  const [editOpen,         setEditOpen]         = useState(false)
  const [deleteOpen,       setDeleteOpen]       = useState(false)
  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false)
  const [rowSelection,     setRowSel]           = useState<MRT_RowSelectionState>({})

  useEffect(() => { dispatch(fetchTeamsRequest()) }, [dispatch])
  useEffect(() => { setRowSel({}) }, [selectedTeamId])

  useEffect(() => {
    if (successMessage) {
      notify(successMessage)
      if (successMessage.includes('Agent')) { setDeleteMemberOpen(false); setRowSel({}) }
    }
  }, [successMessage, notify])

  useEffect(() => {
    if (error) {
      setToast({ msg: error, type: 'error' })
      const t = setTimeout(() => { setToast(null); dispatch(clearMessages()) }, 3500)
      return () => clearTimeout(t)
    }
  }, [error, dispatch, setToast])

  const handleSelectTeam = (value: string | null) => {
    const id = value ? Number(value) : null
    dispatch(setSelectedTeamId(id))
    dispatch(clearMessages())
    if (id) dispatch(fetchMembersRequest(id))
  }

  const selectedAgents = useMemo(() => members.filter((_, i) => rowSelection[i]), [members, rowSelection])
  const selectedOids   = selectedAgents.map(m => m.agentOid)
  const selectedTeam   = teams.find(t => t.id === selectedTeamId)

  const handleDeleteMembers = () => {
    if (!selectedTeamId) return
    dispatch(removeMembersRequest({ teamId: selectedTeamId, agentOids: selectedOids }))
  }

  const table = useMantineReactTable({
    ...getSharedTableProps<AgentTeamMember>(members.length),
    columns,
    data: members,
    state: { isLoading: membersLoading, rowSelection },
    onRowSelectionChange: (updater) => setRowSel(prev => singleSelect(updater, prev)),
    renderTopToolbarCustomActions: () => tableGroupingHint,
  })

  return (
    <PageLayout
      title="Agent Team Settings"
      crumb="Settings / Agent Team Settings"
      toast={toast}
      actions={
        <HeaderButton
          label="Supprimer"
          icon={IconDelete}
          onClick={() => {
            if (selectedOids.length === 0) { notify('Sélectionnez au moins un agent', 'error'); return }
            setDeleteMemberOpen(true)
          }}
        />
      }
      toolbar={
        <div style={toolbarBar}>
          <label style={toolbarLbl}>Groupe :</label>
          <select style={toolbarSelect} value={selectedTeamId ? String(selectedTeamId) : ''}
            onChange={e => handleSelectTeam(e.target.value || null)}>
            <option value="">-- Sélectionner --</option>
            {teams.map(t => <option key={t.id} value={String(t.id)}>{t.description}</option>)}
          </select>

          <div style={toolbarBtnsWrap}>
            <button style={toolbarBtn} title="Nouveau groupe"     onClick={() => setNewOpen(true)}>＋</button>
            <button style={toolbarBtn} title="Modifier le groupe" disabled={!selectedTeamId} onClick={() => setEditOpen(true)}>✏</button>
            <button style={{ ...toolbarBtn, color:'#DC2626', fontWeight:700 }} title="Supprimer le groupe" disabled={!selectedTeamId} onClick={() => setDeleteOpen(true)}>—</button>
          </div>

          {selectedTeam?.siteDescription && (
            <div style={infoBadge}>
              <span style={badgeLbl}>Site :</span>
              <strong>{selectedTeam.siteDescription}</strong>
            </div>
          )}

          {selectedOids.length > 0 && (
            <div style={selBadge}>
              {selectedOids.length} membre{selectedOids.length > 1 ? 's' : ''} sélectionné{selectedOids.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      }
    >
      <div style={tableWrap}><MantineReactTable table={table} /></div>

      <NewGroupModal    opened={newOpen}    onClose={() => setNewOpen(false)} />
      <EditGroupModal   opened={editOpen}   onClose={() => setEditOpen(false)} />
      <DeleteGroupModal opened={deleteOpen} onClose={() => setDeleteOpen(false)} />

      {deleteMemberOpen && (
        <ConfirmModal
          message={selectedOids.length > 1 ? `Supprimer les ${selectedOids.length} agents du groupe ?` : 'Supprimer cet agent du groupe ?'}
          onConfirm={handleDeleteMembers}
          onClose={() => setDeleteMemberOpen(false)}
        />
      )}
    </PageLayout>
  )
}

export default AgentTeamSettingsPage