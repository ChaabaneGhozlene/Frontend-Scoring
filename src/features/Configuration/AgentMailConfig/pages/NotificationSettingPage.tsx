import { useEffect, useState, useMemo } from 'react'
import type { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_RowSelectionState } from 'mantine-react-table'
import type { RootState } from '../../../../app/store'
import { fetchAgentsRequest, fetchEditDetailRequest, clearMessages } from '../AgentMailConfigSlice'
import type { AgentMailConfig } from '../AgentMailConfigTypes'
import EditEmailModal from '../components/EditEmailModal'

// ── Shared ────────────────────────────────────────────────────────────────────
import {  selBadge, tableWrap } from '../../Pagestyles'
import PageLayout from '../../Pagelayout'
import HeaderButton, { IconEdit } from '../../Headerbutton'
import { getSharedTableProps, singleSelect, tableGroupingHint } from '../../Tableconfig'
import { useSettingsPage } from '../../Usesettingspage' 
const columns: MRT_ColumnDef<AgentMailConfig>[] = [
  { accessorKey: 'id',    header: 'Id',    size: 120 },
  { accessorKey: 'agent', header: 'Agent', size: 280 },
  {
    accessorKey: 'email',
    header: 'Email',
    Cell: ({ cell }) => (
      <span style={{ color: cell.getValue<string | null>() ? '#111' : '#bbb' }}>
        {cell.getValue<string | null>() ?? '—'}
      </span>
    ),
  },
]

const NotificationSettingPage: FC = () => {
  const dispatch = useDispatch()
  const { agents, loading, error, successMessage } = useSelector((s: RootState) => s.agentMailConfig)

  const { toast, setToast, notify } = useSettingsPage()
  const [editOpen,     setEditOpen] = useState(false)
  const [rowSelection, setRowSel]   = useState<MRT_RowSelectionState>({})

  useEffect(() => { dispatch(fetchAgentsRequest()) }, [dispatch])
  useEffect(() => { if (!editOpen) setRowSel({}) }, [editOpen])

  useEffect(() => {
    if (successMessage) { notify(successMessage) }
  }, [successMessage, notify])

  useEffect(() => {
    if (error) {
      setToast({ msg: error, type: 'error' })
      const t = setTimeout(() => { setToast(null); dispatch(clearMessages()) }, 3500)
      return () => clearTimeout(t)
    }
  }, [error, dispatch, setToast])

  const selectedAgents = useMemo(() => agents.filter((_, i) => rowSelection[i]), [agents, rowSelection])

  const handleEdit = () => {
    if (selectedAgents.length === 0) { notify('Veuillez sélectionner un agent.', 'error'); return }
    if (selectedAgents.length > 1)   { notify('Veuillez sélectionner un seul agent à la fois.', 'error'); return }
    dispatch(fetchEditDetailRequest(selectedAgents[0].oid))
    setEditOpen(true)
  }

  const table = useMantineReactTable({
    ...getSharedTableProps<AgentMailConfig>(agents.length),
    columns,
    data: agents,
    state: { isLoading: loading, rowSelection },
    onRowSelectionChange: (updater) => setRowSel(prev => singleSelect(updater, prev)),
    renderTopToolbarCustomActions: () => tableGroupingHint,
  })

  return (
    <PageLayout
      title="Notification Setting"
      crumb="Settings / Notification Setting"
      toast={toast}
      actions={<HeaderButton label="Editer" icon={IconEdit} onClick={handleEdit} />}
    >
      {selectedAgents.length > 0 && (
        <div style={{ ...selBadge, margin:'10px 24px 0', display:'inline-flex' }}>
          Agent sélectionné :&nbsp;<strong>{selectedAgents[0].agent}</strong>
        </div>
      )}

      <div style={tableWrap}><MantineReactTable table={table} /></div>

      <EditEmailModal opened={editOpen} onClose={() => setEditOpen(false)} />
    </PageLayout>
  )
}

export default NotificationSettingPage