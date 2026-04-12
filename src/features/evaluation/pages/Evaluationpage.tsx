import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Box, Paper } from '@mantine/core'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '../../../app/store'
import type { ViewLayoutState, ColumnFilter } from '../Evaluationtypes'
import {
  fetchFichesRequest,
  triggerDeleteModal,
  triggerReportModal,
 
  fetchViewConfigsRequest,
  updateViewConfigRequest,
  saveViewConfigRequest,
  setStartDate, setEndDate,
  setSelectedFilterId,
  setSelectedViewConfigId,
  setColumnFilters,
  setPageSize,
} from '../Evaluationslice'
import EvaluationToolbar  from '../components/Evaluationtoolbar'
import EvaluationTable    from '../components/Evaluationtable'
import SurveysPanel       from '../components/Surveyspanel'
import PageLayout         from '../../Pagelayout'
import HeaderButton       from '../../Configuration/Headerbutton'
import SaveViewConfigModal from '../../Saveviewconfigmodal'  
import { IconChecklist }  from '@tabler/icons-react'

const C = '#DC2626'

const DeleteIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19 6l-1 14H6L5 6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 11v6M14 11v6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 6V4h6v2" stroke={C} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)

const FicheAgentIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8"
      stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <polyline points="10 9 9 9 8 9"   stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const EvaluationPage = () => {
  const dispatch = useDispatch()
  const {
    dateDebut, dateFin, pageSize,
    selectedFilterId, selectedRow,
    columnFilters,
    viewConfigs, selectedViewConfigId,
  } = useSelector((s: RootState) => s.evaluation)

  const [saveViewOpen,  setSaveViewOpen]  = useState(false)
  const [currentLayout, setCurrentLayout] = useState('{}')

  const tableKey = selectedViewConfigId ?? 'default'

  const tableStateGetterRef = useRef<(() => Record<string, unknown>) | null>(null)

  const paramsRef = useRef({ dateDebut, dateFin, pageSize, selectedFilterId })
  paramsRef.current = { dateDebut, dateFin, pageSize, selectedFilterId }

  // ✅ APRÈS
useEffect(() => {
  const today = new Date().toISOString().split('T')[0]
  dispatch(setStartDate(today))
  dispatch(setEndDate(today))

  const { pageSize, selectedFilterId } = paramsRef.current
  dispatch(fetchViewConfigsRequest())
  dispatch(fetchFichesRequest({
    dateDebut: today,
    dateFin:   today,
    filterId:  selectedFilterId,
    page:      1,
    pageSize,
  }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  // ── Construit le layoutJson complet ────────────────────────────────────────
  const buildFullLayout = useCallback((): string => {
    const tableState = tableStateGetterRef.current?.() ?? {}
    const colState = tableState as {
      columnVisibility?: Record<string, boolean>
      columnSizing?:     Record<string, number>
    }
      const { dateDebut, dateFin, pageSize, selectedFilterId } = paramsRef.current

    const fullLayout: ViewLayoutState = {
      columnVisibility: colState.columnVisibility ?? {},
      columnSizing:     colState.columnSizing     ?? {},
      dateDebut,
      dateFin,
      selectedFilterId: selectedFilterId ?? null,
      columnFilters:    columnFilters    ?? [],
      pageSize,
    }
    return JSON.stringify(fullLayout)
  }, [dateDebut, dateFin, selectedFilterId, columnFilters, pageSize])

  // ── Layout de la vue sélectionnée ──────────────────────────────────────────
  const selectedLayout = useMemo((): ViewLayoutState => {
    const empty: ViewLayoutState = {
      columnVisibility: {}, columnSizing: {}, columnFilters: [],
    }
    if (!selectedViewConfigId) return empty
    const found = viewConfigs.find(v => v.id === selectedViewConfigId)
    if (!found?.layoutJson) return empty
    try   { return JSON.parse(found.layoutJson) as ViewLayoutState }
    catch { return empty }
  }, [selectedViewConfigId, viewConfigs])

  // ── Nouvelle vue ───────────────────────────────────────────────────────────
 const handleOpenSaveView = useCallback(() => {
  console.log('=== OPEN SAVE VIEW ===')
  console.log('selectedFilterId depuis store:', selectedFilterId)
  console.log('columnFilters depuis store:', columnFilters)
  console.log('paramsRef.current:', paramsRef.current)
  
  const layout = buildFullLayout()
  console.log('layout construit:', layout)
  
  setCurrentLayout(layout)
  setSaveViewOpen(true)
}, [buildFullLayout])
  // ── Mettre à jour vue existante ────────────────────────────────────────────
  const handleUpdateView = useCallback(() => {
    if (!selectedViewConfigId) return
    dispatch(updateViewConfigRequest({
      id:         selectedViewConfigId,
      layoutJson: buildFullLayout(),
    }))
  }, [selectedViewConfigId, dispatch, buildFullLayout])

  // ── Restaurer une vue complète ─────────────────────────────────────────────
  const handleSelectViewConfig = useCallback((id: number | null) => {
    dispatch(setSelectedViewConfigId(id))

    if (!id) {
      const today = new Date().toISOString().split('T')[0]
      dispatch(setStartDate(today))
      dispatch(setEndDate(today))
      dispatch(setSelectedFilterId(null))
      dispatch(setColumnFilters([]))
      dispatch(fetchFichesRequest({
        dateDebut: today, dateFin: today,
        filterId: null, columnFilters: [],
        page: 1, pageSize,
      }))
      return
    }

    const found = viewConfigs.find(v => v.id === id)
    if (!found?.layoutJson) return

    try {
      const layout = JSON.parse(found.layoutJson) as ViewLayoutState
      if (layout.dateDebut) dispatch(setStartDate(layout.dateDebut))
      if (layout.dateFin)   dispatch(setEndDate(layout.dateFin))
      dispatch(setSelectedFilterId(layout.selectedFilterId ?? null))
      const filters: ColumnFilter[] = layout.columnFilters ?? []
      dispatch(setColumnFilters(filters))
      if (layout.pageSize) dispatch(setPageSize(layout.pageSize))
      dispatch(fetchFichesRequest({
        dateDebut:     layout.dateDebut  ?? dateDebut,
        dateFin:       layout.dateFin    ?? dateFin,
        filterId:      layout.selectedFilterId ?? null,
        columnFilters: filters,
        page:          1,
        pageSize:      layout.pageSize   ?? pageSize,
      }))
    } catch (e) {
      console.error('Erreur parsing vue:', e)
    }
  }, [viewConfigs, dispatch, dateDebut, dateFin, pageSize])

  const hasSelection = !!selectedRow

  return (
    <PageLayout
      title="Évaluation"
      crumb="Évaluation / Fiches"
      toast={null}
      icon={<IconChecklist size={20} />}
      actions={
        <>
          <HeaderButton
            label="Supprimer"
            icon={DeleteIcon}
            onClick={() => hasSelection && dispatch(triggerDeleteModal())}
          />
          <HeaderButton
            label="Fiche Agent"
            icon={FicheAgentIcon}
            onClick={() => hasSelection && dispatch(triggerReportModal())}
          />
        </>
      }
    >
      <Box p="md">
        <Paper shadow="xs" withBorder style={{ overflow: 'hidden' }}>
          <EvaluationToolbar
            onOpenSaveView={handleOpenSaveView}
            onOpenUpdateView={handleUpdateView}
            onSelectViewConfig={handleSelectViewConfig}
          />
          <EvaluationTable
            key={tableKey}
            tableStateGetterRef={tableStateGetterRef}
            initialColumnVisibility={selectedLayout.columnVisibility}
            initialColumnSizing={selectedLayout.columnSizing}
            initialColumnFilters={selectedLayout.columnFilters ?? []}
          />
          <SurveysPanel />
        </Paper>
      </Box>

<SaveViewConfigModal
  opened={saveViewOpen}
  onClose={() => setSaveViewOpen(false)}
  currentLayout={currentLayout}
  dateDebut={dateDebut}
  dateFin={dateFin}
  selectedFilterId={selectedFilterId}
  columnFilters={columnFilters}
  pageSize={pageSize}
  onSave={(payload) => dispatch(saveViewConfigRequest(payload))}  // ← callback direct
/>

    </PageLayout>
  )
}

export default EvaluationPage