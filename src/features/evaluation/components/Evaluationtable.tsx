// components/evaluation/EvaluationTable.tsx
import { useEffect, useMemo, useCallback, useState } from 'react'
import {  setColumnFilters as setColumnFiltersAction } from '../Evaluationslice'
import type { MRT_ExpandedState } from 'mantine-react-table'

import {
  MantineReactTable, useMantineReactTable,
  type MRT_ColumnDef, type MRT_PaginationState,
  type MRT_RowSelectionState, type MRT_ColumnFiltersState,
  type MRT_GroupingState,
} from 'mantine-react-table'
import { useDispatch, useSelector } from 'react-redux'
import type { RefObject } from 'react'

import type { RootState } from '../../../app/store'
import type { ColumnFilter } from '../Evaluationtypes'
import {
  clearAgentReport, deleteFicheRequest,
  fetchAgentReportRequest, fetchFichesRequest,
  fetchSurveysRequest, selectFiche, setPageSize,
  setSelectedRow, resetDeleteModal, resetReportModal,
} from '../Evaluationslice'
import type { LsFicheDto } from '../Evaluationtypes'
import AgentReportModal from './Agentreportmodal'
import EvaluationDeleteConfirmModal from './Evaluationdeleteconfirmmodal'
import { getSharedTableProps, singleSelect } from '../../Tableconfig'
import { exportEvaluations } from '../Evaluationservice'

interface EvaluationTableProps {
  tableStateGetterRef:     RefObject<(() => Record<string, unknown>) | null>
  initialColumnVisibility: Record<string, boolean>
  initialColumnSizing:     Record<string, number>
  initialColumnFilters:    ColumnFilter[]
}

// ── Colonnes ───────────────────────────────────────────────────────────────
const buildColumns = (): MRT_ColumnDef<LsFicheDto>[] => [
  {
  accessorKey: 'agentId',
  header:      'Agent Id',
  size:        90,
  // ✅ S'affiche dans la ligne de groupe
  GroupedCell: ({ cell, row }) => (
    <strong style={{ color: '#374151' }}>
      Agent Id: {cell.getValue<number>()} &nbsp;
      <span style={{ fontWeight: 400, color: '#888' }}>
        ({row.subRows?.length ?? 0})
      </span>
    </strong>
  ),
  // ✅ Ne rien afficher dans les cellules agrégées des autres colonnes
  AggregatedCell: () => null,
},
  { accessorKey: 'agent',        header: 'Agent',               size: 160 },
  { accessorKey: 'id',           header: 'ID',                  size: 80  },
  { accessorKey: 'recordDate',   header: 'Date enregistrement', size: 130 }, // ✅ ajout
  {
    accessorKey: 'score',
    header:      'Score(%)',
    size:        100,
    aggregationFn:  'count',
    AggregatedCell: () => null,
    Cell: ({ cell }) => {
      const v     = cell.getValue<number>()
      const color = v >= 80 ? '#065f46' : v >= 60 ? '#92400e' : '#991b1b'
      const bg    = v >= 80 ? '#d1fae5' : v >= 60 ? '#fef9c3' : '#fee2e2'
      return (
        <span style={{
          display: 'inline-block', padding: '2px 10px',
          borderRadius: 10, fontSize: 11, fontWeight: 700,
          background: bg, color,
        }}>
          {v}%
        </span>
      )
    },
  },
  { accessorKey: 'modeleName',   header: 'Modèle',   size: 160 },
{ accessorKey: 'auditorName', header: 'Auditeur', size: 160, AggregatedCell: () => null },  { accessorKey: 'campaignName', header: 'Campagne', size: 180 },
]

// ── Composant principal ────────────────────────────────────────────────────
const EvaluationTable = ({
  tableStateGetterRef,
  initialColumnVisibility,
  initialColumnSizing,
  initialColumnFilters,
}: EvaluationTableProps) => {
  const dispatch = useDispatch()
  const {
    fiches, totalCount, loading,
    page, pageSize, dateDebut, dateFin, selectedFilterId,
    deleteLoading,
    agentReport, agentReportLoading, agentReportError,
    selectedRow, openDeleteModal, openReportModal,
  } = useSelector((s: RootState) => s.evaluation)

  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [reportOpen,   setReportOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LsFicheDto | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility)
  const [columnSizing,     setColumnSizing]     = useState<Record<string, number>>(initialColumnSizing)
  const [columnFilters,    setColumnFilters]    = useState<MRT_ColumnFiltersState>(initialColumnFilters ?? [])

  // ✅ État du grouping — groupé par agentId par défaut
  const [grouping, setGrouping] = useState<MRT_GroupingState>(['agentId'])

  // ✅ État expanded — tous les groupes collapsés par défaut
const [expanded, setExpanded] = useState<MRT_ExpandedState>(true)

  useEffect(() => { setColumnVisibility(initialColumnVisibility) }, [initialColumnVisibility])
  useEffect(() => { setColumnSizing(initialColumnSizing) },         [initialColumnSizing])
  useEffect(() => { setColumnFilters(initialColumnFilters) },       [initialColumnFilters])

  const columns = useMemo(() => buildColumns(), [])

  useEffect(() => {
    tableStateGetterRef.current = () => ({ columnVisibility, columnSizing, columnFilters })
  }, [tableStateGetterRef, columnVisibility, columnSizing, columnFilters])

  const pagination: MRT_PaginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize]
  )
  // ── Ajouter ces deux useEffect manquants ──────────────────────────────────

useEffect(() => {
  if (openDeleteModal && selectedRow) {
    
    dispatch(fetchAgentReportRequest(selectedRow.id))
    setDeleteTarget(selectedRow)
    setDeleteOpen(true)
    dispatch(resetDeleteModal())
  }
}, [openDeleteModal, selectedRow, dispatch])

useEffect(() => {
  if (openReportModal && selectedRow) {
    dispatch(fetchAgentReportRequest(selectedRow.id))
    setReportOpen(true)
    dispatch(resetReportModal())
  }
}, [openReportModal, selectedRow, dispatch])

  const handlePaginationChange = useCallback(
    (updater: MRT_PaginationState | ((p: MRT_PaginationState) => MRT_PaginationState)) => {
      const next        = typeof updater === 'function' ? updater(pagination) : updater
      const newPage     = next.pageIndex + 1
      const newPageSize = next.pageSize
      if (newPageSize !== pageSize) dispatch(setPageSize(newPageSize))
      dispatch(fetchFichesRequest({
        dateDebut, dateFin, filterId: selectedFilterId,
        page: newPage, pageSize: newPageSize,
        columnFilters: columnFilters as ColumnFilter[],
      }))
    },
    [pagination, dispatch, dateDebut, dateFin, selectedFilterId, pageSize, columnFilters]
  )

  const handleColumnFiltersChange = useCallback(
    (updater: MRT_ColumnFiltersState | ((p: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)
      dispatch(setColumnFiltersAction(next as ColumnFilter[]))
      dispatch(fetchFichesRequest({
        dateDebut, dateFin, filterId: selectedFilterId,
        page: 1, pageSize,
        columnFilters: next as ColumnFilter[],
      }))
    },
    [columnFilters, dispatch, dateDebut, dateFin, selectedFilterId, pageSize]
  )

 const handleRowClick = useCallback((rowId: string, original: LsFicheDto) => {
  setRowSelection({ [rowId]: true })
  dispatch(setSelectedRow(original))
  dispatch(selectFiche(original.id))
  dispatch(fetchSurveysRequest({
    lsId:         original.id,
    recordDataId: original.recordDataId,  // ✅ filtre par enregistrement
  }))
}, [dispatch])

const handleRowSelectionChange = useCallback(
  (updater: MRT_RowSelectionState | ((prev: MRT_RowSelectionState) => MRT_RowSelectionState)) => {
    const next        = singleSelect(updater, rowSelection)
    setRowSelection(next)
    const selectedKey = Object.keys(next).find(k => next[k])
    const fiche       = selectedKey !== undefined ? fiches[parseInt(selectedKey)] : null
    dispatch(setSelectedRow(fiche))
    if (fiche) {
      dispatch(selectFiche(fiche.id))
      dispatch(fetchSurveysRequest({
        lsId:         fiche.id,
        recordDataId: fiche.recordDataId,
      }))
    }
  },
  [rowSelection, fiches, dispatch]
)
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return
    dispatch(deleteFicheRequest(deleteTarget.id))
    setDeleteOpen(false)
    setDeleteTarget(null)
  }, [deleteTarget, dispatch])

  const table = useMantineReactTable({
    ...getSharedTableProps<LsFicheDto>(totalCount, {
      filename:      'evaluations',
      records:       fiches,
      dateDebut,
      dateFin,
      filterId:      selectedFilterId,
      columnFilters: columnFilters as unknown[],
      fetchBlob:     exportEvaluations,
    }),
    columns,
    data:             fiches,
    rowCount:         totalCount,
    manualPagination: true,
    manualFiltering:  true,

    // ✅ Grouping activé
    enableGrouping:       true,
    enableColumnDragging: false,
groupedColumnMode: 'reorder',

    onPaginationChange:    handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onRowSelectionChange:  handleRowSelectionChange,
    enableMultiRowSelection: false,   // ✅ single select uniquement

    onColumnVisibilityChange: (updater) =>
      setColumnVisibility(prev => typeof updater === 'function' ? updater(prev) : updater),
    onColumnSizingChange: (updater) =>
      setColumnSizing(prev => typeof updater === 'function' ? updater(prev) : updater),

    // ✅ Grouping state contrôlé
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,

    state: {
      isLoading:        loading,
      pagination,
      rowSelection,
      columnVisibility,
      columnSizing,
      columnFilters,
      grouping,          // ✅
      expanded,          // ✅
    },

    // ✅ Pas de checkbox sur les lignes de groupe
    mantineSelectCheckboxProps: ({ row }) =>
      row.getIsGrouped() ? { style: { display: 'none' } } : { radius: 0, size: 'sm' },
    mantineSelectAllCheckboxProps: { radius: 0, size: 'sm' },
    displayColumnDefOptions: { 'mrt-row-select': { header: '', size: 40 } },

    // ✅ Style différent pour lignes groupe vs lignes données
    mantineTableBodyRowProps: ({ row }) => {
      if (row.getIsGrouped()) {
        return {
          style: {
            background:  '#f3f4f6',
            fontWeight:   700,
            cursor:       'pointer',
            borderBottom: '1px solid #e5e7eb',
          },
        }
      }
      return {
        onClick: () => handleRowClick(row.id, row.original),
        style: {
          cursor:     'pointer',
          background: rowSelection[row.id] ? '#eff6ff' : undefined,
        },
      }
    },
  })

  return (
    <>
      <MantineReactTable table={table} />

      <EvaluationDeleteConfirmModal
        opened={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        recordLabel={deleteTarget ? `${deleteTarget.agent} — ID ${deleteTarget.id}` : undefined}
        loading={deleteLoading}
        title="Supprimer la fiche"
        message="Voulez-vous vraiment supprimer cette fiche d'écoute et toutes ses évaluations ?"
      />

      <AgentReportModal
        opened={reportOpen}
        onClose={() => { setReportOpen(false); dispatch(clearAgentReport()) }}
        report={agentReport}
        loading={agentReportLoading}
        error={agentReportError}
      />
    </>
  )
}

export default EvaluationTable