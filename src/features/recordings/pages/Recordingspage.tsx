import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Box, Paper } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import {
  fetchRecordingsRequest, fetchFiltersRequest,
  fetchViewConfigsRequest, updateViewConfigRequest,
} from '../Recordingslice';
import RecordingsToolbar   from '../components/Recordingstoolbar';
import RecordingsTable     from '../components/Recordingstable';
import CreateFilterModal   from '../components/Createfiltermodal';
import SaveViewConfigModal from '../components/Saveviewconfigmodal';

const RecordingsPage = () => {
  const dispatch = useDispatch();
  const {
    dateDebut, dateFin, selectedFilterId,
    pageSize, columnFilters,
    viewConfigs, selectedViewConfigId,
  } = useSelector((s: RootState) => s.recordings);

  const [createFilterOpen, setCreateFilterOpen] = useState(false);
  const [saveViewOpen,     setSaveViewOpen]     = useState(false);
  const [currentLayout,    setCurrentLayout]    = useState('{}');

  const tableStateGetterRef = useRef<(() => Record<string, unknown>) | null>(null);

  // ── Parse le layout de la vue sélectionnée → appliqué à la table ─────────
  const selectedLayout = useMemo(() => {
    if (!selectedViewConfigId) return { columnVisibility: {}, columnSizing: {} };
    const found = viewConfigs.find(v => v.id === selectedViewConfigId);
    if (!found?.layoutJson) return { columnVisibility: {}, columnSizing: {} };
    try {
      return JSON.parse(found.layoutJson) as {
        columnVisibility: Record<string, boolean>;
        columnSizing:     Record<string, number>;
      };
    } catch {
      return { columnVisibility: {}, columnSizing: {} };
    }
  }, [selectedViewConfigId, viewConfigs]);

  useEffect(() => {
    dispatch(fetchFiltersRequest());
    dispatch(fetchViewConfigsRequest());
    dispatch(fetchRecordingsRequest({
      dateDebut, dateFin, filterId: selectedFilterId,
      page: 1, pageSize, columnFilters,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilterId, dateDebut, dateFin]);

  // ── Nouvelle vue → ouvre le modal avec le nom à saisir ───────────────────
  const handleOpenSaveView = useCallback(() => {
    const state  = tableStateGetterRef.current?.();
    const layout = state
      ? JSON.stringify(state)
      : JSON.stringify({ columnVisibility: {}, columnSizing: {} });
    setCurrentLayout(layout);
    setSaveViewOpen(true);
  }, []);

  // ── Sauvegarder vue EXISTANTE → dispatch direct, sans modal ──────────────
  const handleUpdateView = useCallback(() => {
    if (!selectedViewConfigId) return;
    const state  = tableStateGetterRef.current?.();
    const layout = state
      ? JSON.stringify(state)
      : JSON.stringify({ columnVisibility: {}, columnSizing: {} });
    dispatch(updateViewConfigRequest({
      id:         selectedViewConfigId,
      layoutJson: layout,
    }));
  }, [selectedViewConfigId, dispatch]);

  return (
    <Box p="md">
      <Paper shadow="xs" withBorder style={{ overflow: 'hidden' }}>
        <RecordingsToolbar
          onOpenCreateFilter={() => setCreateFilterOpen(true)}
          onOpenSaveView={handleOpenSaveView}    // ← nouvelle vue
          onOpenUpdateView={handleUpdateView}    // ← vue existante
        />
        <RecordingsTable
          onOpenCreateFilter={() => setCreateFilterOpen(true)}
          tableStateGetterRef={tableStateGetterRef}
          initialColumnVisibility={selectedLayout.columnVisibility}
          initialColumnSizing={selectedLayout.columnSizing}
        />
      </Paper>

      <CreateFilterModal
        opened={createFilterOpen}
        onClose={() => setCreateFilterOpen(false)}
      />
      <SaveViewConfigModal
        opened={saveViewOpen}
        onClose={() => setSaveViewOpen(false)}
        currentLayout={currentLayout}
      />
    </Box>
  );
};

export default RecordingsPage;