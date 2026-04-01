import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Box, Paper } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { saveViewConfigRequest } from '../Recordingslice'

import type { RootState } from '../../../app/store';
import type { ViewLayoutState, ColumnFilter } from '../Recordingstypes'; // ← plus de ColumnFiltersState
import {
  fetchRecordingsRequest, fetchFiltersRequest,
  fetchViewConfigsRequest, updateViewConfigRequest,
  setStartDate, setEndDate, setSelectedFilterId,
  setSelectedViewConfigId, setColumnFilters, setPageSize,
} from '../Recordingslice';

import RecordingsToolbar     from '../components/Recordingstoolbar';
import RecordingsTable       from '../components/Recordingstable';
import SaveViewConfigModal   from '../../Saveviewconfigmodal';

const RecordingsPage = () => {
  const dispatch = useDispatch();
  const {
    dateDebut, dateFin, selectedFilterId,
    pageSize, columnFilters,
    viewConfigs, selectedViewConfigId,
  } = useSelector((s: RootState) => s.recordings);

  const [saveViewOpen,     setSaveViewOpen]     = useState(false);
  const [currentLayout,    setCurrentLayout]    = useState('{}');
  const tableKey = selectedViewConfigId ?? 'default';   // ← ajouter cette ligne

  const tableStateGetterRef = useRef<(() => Record<string, unknown>) | null>(null);

  // ── Construit le layoutJson complet ──────────────────────────────────────
  const buildFullLayout = useCallback((): string => {
    const tableState = tableStateGetterRef.current?.() ?? {};
    const colState = tableState as {
      columnVisibility?: Record<string, boolean>;
      columnSizing?:     Record<string, number>;
    };
    const fullLayout: ViewLayoutState = {
      columnVisibility: colState.columnVisibility ?? {},
      columnSizing:     colState.columnSizing     ?? {},
      dateDebut:        dateDebut,
      dateFin:          dateFin,
      selectedFilterId: selectedFilterId ?? null,
      columnFilters:    columnFilters    ?? [],
      pageSize,
    };
    return JSON.stringify(fullLayout);
  }, [dateDebut, dateFin, selectedFilterId, columnFilters, pageSize]);

  // ── Layout de la vue sélectionnée ────────────────────────────────────────
  const selectedLayout = useMemo((): ViewLayoutState => {
    const empty: ViewLayoutState = {
      columnVisibility: {}, columnSizing: {},
      columnFilters: [],
    };
    if (!selectedViewConfigId) return empty;
    const found = viewConfigs.find(v => v.id === selectedViewConfigId);
    if (!found?.layoutJson) return empty;
    try   { return JSON.parse(found.layoutJson) as ViewLayoutState; }
    catch { return empty; }
  }, [selectedViewConfigId, viewConfigs]);

  useEffect(() => {
    dispatch(fetchFiltersRequest());
    dispatch(fetchViewConfigsRequest());
    dispatch(fetchRecordingsRequest({
      dateDebut, dateFin,
      filterId: selectedFilterId,
      page: 1, pageSize, columnFilters,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenSaveView = useCallback(() => {
    setCurrentLayout(buildFullLayout());
    setSaveViewOpen(true);
  }, [buildFullLayout]);

  const handleUpdateView = useCallback(() => {
    if (!selectedViewConfigId) return;
    dispatch(updateViewConfigRequest({
      id:         selectedViewConfigId,
      layoutJson: buildFullLayout(),
    }));
  }, [selectedViewConfigId, dispatch, buildFullLayout]);

  // ── Restaurer une vue complète ───────────────────────────────────────────
  const handleSelectViewConfig = useCallback((id: number | null) => {
    dispatch(setSelectedViewConfigId(id));

    // ── Désélection → réinitialiser tout ──────────────────────────────────
    if (!id) {
      const today = new Date().toISOString().split('T')[0];

      dispatch(setStartDate(today));
      dispatch(setEndDate(today));
      dispatch(setSelectedFilterId(null));
      dispatch(setColumnFilters([]));

      dispatch(fetchRecordingsRequest({
        dateDebut:     today,
        dateFin:       today,
        filterId:      null,
        columnFilters: [],
        page:          1,
        pageSize,
      }));
      return;
    }

    // ── Sélection → restaurer la vue ──────────────────────────────────────
    const found = viewConfigs.find(v => v.id === id);
    if (!found?.layoutJson) return;

    try {
      const layout = JSON.parse(found.layoutJson) as ViewLayoutState;

      if (layout.dateDebut) dispatch(setStartDate(layout.dateDebut));
      if (layout.dateFin)   dispatch(setEndDate(layout.dateFin));

      dispatch(setSelectedFilterId(layout.selectedFilterId ?? null));

      const filters: ColumnFilter[] = layout.columnFilters ?? [];
      dispatch(setColumnFilters(filters));

      if (layout.pageSize) dispatch(setPageSize(layout.pageSize));

      dispatch(fetchRecordingsRequest({
        dateDebut:     layout.dateDebut  ?? dateDebut,
        dateFin:       layout.dateFin    ?? dateFin,
        filterId:      layout.selectedFilterId ?? null,
        columnFilters: filters,
        page:          1,
        pageSize:      layout.pageSize   ?? pageSize,
      }));

    } catch (e) {
      console.error('Erreur parsing vue:', e);
    }
  }, [viewConfigs, dispatch, dateDebut, dateFin, pageSize]);
  return (
    <Box p="md">
      <Paper shadow="xs" withBorder style={{ overflow: 'hidden' }}>
        <RecordingsToolbar
          onOpenSaveView={handleOpenSaveView}
          onOpenUpdateView={handleUpdateView}
          onSelectViewConfig={handleSelectViewConfig}
        />
        <RecordingsTable
         key={tableKey} 
          tableStateGetterRef={tableStateGetterRef}
          initialColumnVisibility={selectedLayout.columnVisibility}
          initialColumnSizing={selectedLayout.columnSizing}
          initialColumnFilters={selectedLayout.columnFilters ?? []}  // ← ColumnFilter[], pas ColumnFiltersState
        />
      </Paper>

      
<SaveViewConfigModal
  opened={saveViewOpen}
  onClose={() => setSaveViewOpen(false)}
  currentLayout={currentLayout}
  dateDebut={dateDebut}
  dateFin={dateFin}
  selectedFilterId={selectedFilterId}
  columnFilters={columnFilters}
  pageSize={pageSize}
  onSave={(payload) => dispatch(saveViewConfigRequest(payload))}  // ← was saveAction={}
/>

    </Box>
  );
};

export default RecordingsPage;