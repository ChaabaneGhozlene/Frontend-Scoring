import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  Button, ActionIcon, Tooltip, Group, Box, Text, Anchor,
} from '@mantine/core';
import {
  IconDownload, IconHeadphones, IconVideo, IconTrash, IconFileText,
} from '@tabler/icons-react';
import {
  MantineReactTable, useMantineReactTable,
  type MRT_ColumnDef, type MRT_Row,
  type MRT_PaginationState, type MRT_ColumnFiltersState,
} from 'mantine-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import {
  fetchRecordingsRequest, setPageSize,
  setColumnFilters as setColumnFiltersAction,
} from '../Recordingslice';
import type { Recording, ColumnFilter } from '../Recordingstypes';
import { exportRecordings, deleteRecording } from '../Recordingsservice';
import ListenHistoryModal  from './Listhistorymodal';
import ScreenHistoryModal  from './Screenhistorymodal';
import DeleteConfirmModal  from './Deleteconfirmmodal';

const csvConfig = mkConfig({
  fieldSeparator: ',', decimalSeparator: '.', useKeysAsHeaders: true, filename: 'enregistrements',
});

const buildColumns = (
  onHistory: (r: Recording) => void,
  onScreenHistory: (r: Recording) => void,
  onDelete: (r: Recording) => void,
  onEvaluation: (r: Recording) => void,
): MRT_ColumnDef<Recording>[] => [
  {
    id: 'actions', header: 'Actions', size: 160,
    enableColumnFilter: false, enableSorting: false,
    Cell: ({ row }) => (
      <Group spacing={4} noWrap>
        <Tooltip label="Historique d'écoute" withArrow>
          <ActionIcon size="sm" variant="light"
            color={row.original.hasHistory ? 'red' : 'gray'}
            onClick={() => onHistory(row.original)}>
            <IconHeadphones size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Screen recording" withArrow>
          <ActionIcon size="sm" variant="light"
            color={row.original.HasHistoryScreen ? 'red' : 'gray'}
            onClick={() => onScreenHistory(row.original)}>
            <IconVideo size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Supprimer" withArrow>
          <ActionIcon size="sm" variant="light" color="gray"
            onClick={() => onDelete(row.original)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={row.original.hasEvaluation ? 'Voir évaluation' : 'Évaluer'} withArrow>
          <ActionIcon size="sm" variant="light"
            color={row.original.hasEvaluation ? 'red' : 'gray'}
            onClick={() => onEvaluation(row.original)}>
            <IconFileText size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
  },
  { accessorKey: 'callLocalTime',       header: 'Date Enregistrement', size: 170,
    Cell: ({ cell }) => { const v = cell.getValue<string|null>(); return v ? <span>{v}</span> : null; } },
  { accessorKey: 'agentId',             header: 'Agent ID',           size: 100 },
  { accessorKey: 'prenomAgent',         header: 'Prénom',             size: 120 },
  { accessorKey: 'nomAgent',            header: 'Nom Agent',          size: 140 },
  { accessorKey: 'campaignDescription', header: 'Profil / Campagne',  size: 200 },
  { accessorKey: 'callTypeDescription', header: 'Action',             size: 130 },
  { accessorKey: 'numeroTel',           header: 'Indice / Numéro',    size: 140 },
  { accessorKey: 'duration',            header: 'Durée Conv.',        size: 110,
    Cell: ({ cell }) => cell.getValue<number|null>() ?? null },
  { accessorKey: 'agentOid',            header: 'Agent OID',          size: 140 },
];

interface Props {
  onOpenCreateFilter:   () => void;
 tableStateGetterRef?: React.MutableRefObject<(() => Record<string, unknown>) | null>;
  initialColumnVisibility?: Record<string, boolean>; // ← NOUVEAU
  initialColumnSizing?:     Record<string, number>;  // ← NOUVEAU
}

const RecordingsTable = ({ onOpenCreateFilter, tableStateGetterRef,   initialColumnVisibility = {},  // ← NOUVEAU
  initialColumnSizing     = {}, }: Props) => {
  const dispatch = useDispatch();
  const {
    records, totalCount, loading,
    page, pageSize, dateDebut, dateFin, selectedFilterId,
  } = useSelector((s: RootState) => s.recordings);

  const [columnFilters,    setColumnFilters]    = useState<MRT_ColumnFiltersState>([]);
  const [rowSelection,     setRowSelection]     = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [columnSizing,     setColumnSizing]     = useState<Record<string, number>>({});
  // ← NOUVEAU : applique le layout quand la vue change
  useEffect(() => {
    setColumnVisibility(initialColumnVisibility);
    setColumnSizing(initialColumnSizing);
  }, [initialColumnVisibility, initialColumnSizing]);

  const [histRecord,    setHistRecord]    = useState<Recording | null>(null);
  const [histOpen,      setHistOpen]      = useState(false);
  const [screenRecord,  setScreenRecord]  = useState<Recording | null>(null);
  const [screenOpen,    setScreenOpen]    = useState(false);
  const [deleteRecord,  setDeleteRecord]  = useState<Recording | null>(null);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const colVisRef  = useRef(columnVisibility);
  const colSizeRef = useRef(columnSizing);
  colVisRef.current  = columnVisibility;
  colSizeRef.current = columnSizing;

  const refetch = useCallback(() => {
    dispatch(fetchRecordingsRequest({
      dateDebut, dateFin, filterId: selectedFilterId,
      page, pageSize, columnFilters: columnFilters as ColumnFilter[],
    }));
  }, [dispatch, dateDebut, dateFin, selectedFilterId, page, pageSize, columnFilters]);

  const handleHistory       = useCallback((r: Recording) => { setHistRecord(r);   setHistOpen(true);   }, []);
  const handleScreenHistory = useCallback((r: Recording) => { setScreenRecord(r); setScreenOpen(true); }, []);
  const handleDelete        = useCallback((r: Recording) => { setDeleteRecord(r); setDeleteOpen(true); }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteRecord) return;
    setDeleteLoading(true);
    try {
      await deleteRecording(deleteRecord.id);
      setDeleteOpen(false);
      setDeleteRecord(null);
      refetch();
    } catch (err: unknown) {
      let msg = 'Erreur lors de la suppression.';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } } };
        if (e.response?.data?.message) msg = e.response.data.message;
      }
      alert(msg);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteRecord, refetch]);

  const handleEvaluation = useCallback((r: Recording) => {
    console.log('Évaluation', r.id);
  }, []);

  const handleExportRows = useCallback((rows: MRT_Row<Recording>[]) => {
    download(csvConfig)(generateCsv(csvConfig)(rows.map((r) => r.original) as never));
  }, []);

  const handleExportAll = useCallback(async () => {
    try {
      const blob = await exportRecordings({
        dateDebut, dateFin, filterId: selectedFilterId, page: 1, pageSize: 99999,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'enregistrements.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      download(csvConfig)(generateCsv(csvConfig)(records as never));
    }
  }, [dateDebut, dateFin, selectedFilterId, records]);

  const pagination: MRT_PaginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize }), [page, pageSize],
  );

  const handlePaginationChange = useCallback(
    (updater: MRT_PaginationState | ((p: MRT_PaginationState) => MRT_PaginationState)) => {
      const next        = typeof updater === 'function' ? updater(pagination) : updater;
      const newPage     = next.pageIndex + 1;
      const newPageSize = next.pageSize;
      if (newPageSize !== pageSize) dispatch(setPageSize(newPageSize));
      dispatch(fetchRecordingsRequest({
        dateDebut, dateFin, filterId: selectedFilterId,
        page: newPage, pageSize: newPageSize,
        columnFilters: columnFilters as ColumnFilter[],
      }));
    },
    [pagination, dispatch, dateDebut, dateFin, selectedFilterId, pageSize, columnFilters],
  );

  const handleColumnFiltersChange = useCallback(
    (updater: MRT_ColumnFiltersState | ((p: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(next);
      dispatch(setColumnFiltersAction(next as ColumnFilter[]));
      dispatch(fetchRecordingsRequest({
        dateDebut, dateFin, filterId: selectedFilterId,
        page: 1, pageSize, columnFilters: next as ColumnFilter[],
      }));
    },
    [columnFilters, dispatch, dateDebut, dateFin, selectedFilterId, pageSize],
  );

  const columns = useMemo(
    () => buildColumns(handleHistory, handleScreenHistory, handleDelete, handleEvaluation),
    [handleHistory, handleScreenHistory, handleDelete, handleEvaluation],
  );

  const table = useMantineReactTable({
    columns, data: records, rowCount: totalCount,
    state: {
      isLoading: loading, pagination, columnFilters,
      rowSelection, columnVisibility, columnSizing,
    },
    manualPagination: true, manualFiltering: true,
    onPaginationChange:    handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onRowSelectionChange:  setRowSelection,
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(colVisRef.current) : updater;
      setColumnVisibility(next);
    },
    onColumnSizingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(colSizeRef.current) : updater;
      setColumnSizing(next);
    },
    enableRowSelection:         true,
    enableColumnFilters:        true,
    enableColumnResizing:       true,
    columnResizeMode:           'onChange',
    columnFilterDisplayMode:    'popover',
    paginationDisplayMode:      'pages',
    positionToolbarAlertBanner: 'bottom',
    enableGrouping:             true,
    enableColumnDragging:       false,
    enableStickyHeader:         true,
    mantinePaginationProps: { rowsPerPageOptions: ['15', '25', '50', '100'] },
    // Boutons export — tous red
renderTopToolbarCustomActions: ({ table: t }) => (
  <Box style={{ display: 'flex', gap: 8, padding: 8, flexWrap: 'wrap' }}>
    <Button size="xs" color="red" variant="filled" leftIcon={<IconDownload size={14} />}
      onClick={handleExportAll}>Export All</Button>
    <Button size="xs" color="red" variant="filled" leftIcon={<IconDownload size={14} />}
      disabled={t.getPrePaginationRowModel().rows.length === 0}
      onClick={() => handleExportRows(t.getPrePaginationRowModel().rows)}>Export Rows</Button>
    <Button size="xs" color="red" variant="filled" leftIcon={<IconDownload size={14} />}
      disabled={t.getRowModel().rows.length === 0}
      onClick={() => handleExportRows(t.getRowModel().rows)}>Export Page</Button>
    <Button size="xs" color="red" variant="filled" leftIcon={<IconDownload size={14} />}
      disabled={!t.getIsSomeRowsSelected() && !t.getIsAllRowsSelected()}
      onClick={() => handleExportRows(t.getSelectedRowModel().rows)}>Export Selected</Button>
  </Box>
),
    renderBottomToolbarCustomActions: () => (
      <Box px="xs">
        <Anchor size="sm" color="red" onClick={onOpenCreateFilter} style={{ cursor: 'pointer' }}>
          ♥ Create Filter
        </Anchor>
      </Box>
    ),
    localization: {
      noRecordsToDisplay: 'No data to display', rowsPerPage: 'Affichage:', of: 'sur',
      showHideColumns: 'Colonnes', toggleSelectAll: 'Tout sélectionner',
      toggleSelectRow: 'Sélectionner', groupedBy: 'Groupé par',
      expand: 'Développer', collapse: 'Réduire',
    },
  });

  //  enregistre un getter direct sur table.getState() ──
  // Pas de copie intermédiaire — lit l'état réel au moment du clic "Sauvegarder"
  useEffect(() => {
  if (tableStateGetterRef) {
    tableStateGetterRef.current = () => ({
      columnVisibility: colVisRef.current,   // ← ref React, toujours à jour
      columnSizing:     colSizeRef.current,  // ← ref React, toujours à jour
    });
  }
}, [tableStateGetterRef]); // ← plus de dépendance sur table

  const deleteLabel = deleteRecord
    ? `${deleteRecord.prenomAgent ?? ''} ${deleteRecord.nomAgent ?? ''} — N°${deleteRecord.id}`.trim()
    : undefined;

  return (
    <>
      <Box px="sm" py={4} style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <Text size="xs" c="dimmed">Drag a column header here to group by that column</Text>
      </Box>
      <MantineReactTable table={table} />
      <ListenHistoryModal opened={histOpen} onClose={() => setHistOpen(false)}
        recordId={histRecord?.id ?? null}
        recordLabel={histRecord
          ? `${histRecord.prenomAgent ?? ''} ${histRecord.nomAgent ?? ''} — ${histRecord.callLocalTimeString ?? ''}`
          : undefined} />
      <ScreenHistoryModal opened={screenOpen} onClose={() => setScreenOpen(false)}
        recordId={screenRecord?.id ?? null}
        recordLabel={screenRecord
          ? `${screenRecord.prenomAgent ?? ''} ${screenRecord.nomAgent ?? ''} — ${screenRecord.callLocalTimeString ?? ''}`
          : undefined} />
      <DeleteConfirmModal opened={deleteOpen} onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleConfirmDelete} recordLabel={deleteLabel} loading={deleteLoading} />
    </>
  );
};

export default RecordingsTable;