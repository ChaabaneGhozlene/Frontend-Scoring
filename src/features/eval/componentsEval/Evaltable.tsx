// features/evaluation/components/Evaluationtable.tsx

import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import { Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

import type { RecordRow } from '../Evalslice'
import { setSelectedRecordId, setPage, setPageSize } from '../Evalslice'
import { FETCH_RECORDS_REQUEST } from '../Evalsaga'
import { getSharedTableProps } from '../../Tableconfig'
import { exportRecordsBlob } from '../Evalservice'
import type { RootState } from '../../../app/store'

interface Props {
  onRowDoubleClick?: (recordId: number) => void
    onOpenReport?:     (lsId: number)    => void  // ← ajouter

}

const EvaluationTable = ({ onRowDoubleClick }: Props) => {
  const dispatch = useDispatch()
  const {
    records, totalCount, page, pageSize,
    loadingRecords, errorRecords,
   
    startDate, endDate, selectedAgentOid,
  } = useSelector((s: RootState) => s.eval)

  const [columnFilters, setColumnFilters] = useState<any[]>([])
  const [globalFilter,  setGlobalFilter]  = useState('')
  const [rowSelection,  setRowSelection]  = useState<Record<string, boolean>>({})

const columns = useMemo<MRT_ColumnDef<RecordRow>[]>(() => [
  {id:          'heureAppel',
    accessorKey: 'callLocalTime',
    header:      'Date Enregistrement',
    size:        160,
    Cell: ({ cell }) => {
      const v = cell.getValue<string | null>()
      if (!v) return null
      const d = new Date(v)
      return isNaN(d.getTime())
        ? v
        : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    },
  },
  {
    accessorKey: 'campaignDescription',
    header:      'Campagne',
    size:        220,
  },
  {
    accessorKey: 'agentId',
    header:      'Agent ID',
    size:        100,
  },
  {
    accessorKey: 'nomAgent',
    header:      'Nom Agent',
    size:        140,
  },
  {
    accessorKey: 'prenomAgent',
    header:      'Prenom Agent',
    size:        140,
  },
  {
    accessorKey: 'callLocalTime',
    header:      'Heure Appel',
    size:        120,
    Cell: ({ cell }) => {
      const v = cell.getValue<string | null>()
      if (!v) return null
      const d = new Date(v)
      return isNaN(d.getTime())
        ? v
        : `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
    },
  },
  {
    accessorKey: 'statusDescription',
    header:      'Statut',
    size:        160,
  },
  {
    accessorKey: 'callTypeDescription',
    header:      'Détail Statut',
    size:        260,
  },
], [])

  const sharedProps = getSharedTableProps<RecordRow>(
    totalCount,
    {
      filename:      'evaluation-records',
      records,
      dateDebut:     startDate,
      dateFin:       endDate,
filterId: selectedAgentOid.length > 0 ? selectedAgentOid.join(',') : null,
      fetchBlob:     exportRecordsBlob,
    }
  )

  const table = useMantineReactTable({
    ...sharedProps,
    columns,
    data: records,

    // ── Server-side pagination ──────────────────────────
    manualPagination: true,
      manualFiltering:  true,   // ← AJOUTER
  manualSorting:    true, 
    rowCount:         totalCount,
    state: {
      pagination:    { pageIndex: page - 1, pageSize },
      columnFilters,
      globalFilter,
      
      rowSelection,
      isLoading:     loadingRecords,
    },
onPaginationChange: (updater) => {
  const prev = { pageIndex: page - 1, pageSize }
  const next = typeof updater === 'function' ? updater(prev) : updater

  const newPage     = next.pageIndex + 1
  const newPageSize = next.pageSize

  // Ne dispatcher setPageSize que si la taille change vraiment
  if (newPageSize !== pageSize) {
    dispatch(setPageSize(newPageSize))
  }

  // Toujours mettre à jour la page
  dispatch(setPage(newPage))

  dispatch({
    type:    FETCH_RECORDS_REQUEST,
    payload: { page: newPage, pageSize: newPageSize,
            columnFilters, // ← manquait ici
      globalFilter,  // ← manquait ici aussi
     },
  })
},
    onColumnFiltersChange: (updater) => {
  const next = typeof updater === 'function' ? updater(columnFilters) : updater
  setColumnFilters(next)
  dispatch(setPage(1))
  dispatch({
    type:    FETCH_RECORDS_REQUEST,
    payload: { page: 1, pageSize, columnFilters: next },
  })
},
onGlobalFilterChange: (value) => {
  const val = value ?? ''
  setGlobalFilter(val)
  dispatch(setPage(1))
  dispatch({
    type:    FETCH_RECORDS_REQUEST,
    payload: { page: 1, pageSize, columnFilters, globalFilter: val },
  })
},    

    // ── Row selection ───────────────────────────────────
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      // Single select: keep only last selected
      const keys = Object.keys(next).filter(k => next[k])
      const single = keys.length > 0 ? { [keys[keys.length - 1]]: true } : {}
      setRowSelection(single)
      const selectedIdx = keys[keys.length - 1]
      const record = selectedIdx !== undefined ? records[parseInt(selectedIdx)] : null
      dispatch(setSelectedRecordId(record?.id ?? null))
    },

    // ── Row styling ─────────────────────────────────────
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        const idx    = row.index.toString()
        const newSel = rowSelection[idx] ? {} : { [idx]: true }
        setRowSelection(newSel)
        const record = records[row.index]
        dispatch(setSelectedRecordId(record?.id ?? null))
      },
      onDoubleClick: () => {
        const record = records[row.index]
        if (record?.id) onRowDoubleClick?.(record.id)
      },
      style: {
        cursor:          'pointer',
        backgroundColor: rowSelection[row.index.toString()]
          ? 'rgba(24,100,171,0.08)'
          : undefined,
      },
    }),

    // ── Grouping hint ───────────────────────────────────
    renderDetailPanel: undefined,

    

    mantineTableHeadCellProps: {
      style: { fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' },
    },
  })

  return (
    <>
      {errorRecords && (
        <Alert
          icon={<IconAlertCircle size={14} />}
          color="red"
          mb="xs"
          withCloseButton
        >
          {errorRecords}
        </Alert>
      )}
      <MantineReactTable table={table} />
    </>
  )
}

export default EvaluationTable