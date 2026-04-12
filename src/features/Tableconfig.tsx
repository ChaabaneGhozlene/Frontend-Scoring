import type { MRT_TableOptions, MRT_RowSelectionState } from 'mantine-react-table'
import { Box, Button, Text } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { exportAll, exportRows, type ExportBlobParams } from './exportUtils'

export function getSharedTableProps<T extends object>(
  totalCount?: number,
  exportConfig?: {
    filename?: string
    records?: T[]
    dateDebut?: string | null
    dateFin?: string | null
    filterId?: string | number | null
    columnFilters?: unknown[]
    fetchBlob?: (p: ExportBlobParams) => Promise<Blob>
  }
): Partial<MRT_TableOptions<T>> {
  return {
    enableRowSelection: true,
    enableMultiRowSelection: true,
    manualFiltering: true,
    positionToolbarAlertBanner: 'bottom',
    enableGrouping: true,
    enableColumnDragging: false,
    enableStickyHeader: true,
    enableColumnFilters: true,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    enableToolbarInternalActions: true,
    enableGlobalFilter: true,
    enableDensityToggle: true,
    enableColumnOrdering: true,
    enableFullScreenToggle: true,

    mantinePaginationProps: {
      rowsPerPageOptions: ['10', '15', '25', '50'],
    },
  mantineTableProps: {
      striped:           true,
      highlightOnHover:  true,
      withBorder:        true,
      withColumnBorders: true,
    },

    localization: {
      noRecordsToDisplay: 'No data to display',
      rowsPerPage: 'Affichage:',
      of: 'sur',
    },

    mantineTopToolbarProps: {
      style: {
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        padding: 0,
      },
    },

    /** ✅ EXPORT BUTTONS */
    renderTopToolbarCustomActions: ({ table: t }) => (
      <Box style={{ display: 'flex', gap: 8, padding: 8, flexWrap: 'wrap' }}>

        {/* ✅ Export All */}
        <Button
          size="xs"
          color="red"
          leftIcon={<IconDownload size={14} />}
          onClick={() => exportAll<T>({ ...exportConfig })}
          disabled={!exportConfig?.fetchBlob && !exportConfig?.records}
        >
          Export All
        </Button>

        {/* ✅ Export Page */}
        <Button
          size="xs"
          color="red"
          leftIcon={<IconDownload size={14} />}
          disabled={t.getRowModel().rows.length === 0}
          onClick={() =>
            exportRows<T>(
              t.getRowModel().rows.map(r => r.original),
              exportConfig?.filename
            )
          }
        >
          Export Page
        </Button>

        {/* ✅ Export Selected */}
        <Button
          size="xs"
          color="red"
          leftIcon={<IconDownload size={14} />}
          disabled={!t.getIsSomeRowsSelected() && !t.getIsAllRowsSelected()}
          onClick={() =>
            exportRows<T>(
              t.getSelectedRowModel().rows.map(r => r.original),
              exportConfig?.filename
            )
          }
        >
          Export Selected
        </Button>

      </Box>
    ),

    renderBottomToolbarCustomActions: () => (
      <Box px="xs">
        <Text size="xs" c="dimmed">
          {totalCount ?? 0} fiche(s) trouvée(s)
        </Text>
      </Box>
    ),
  }
}

/** sélection unique */
export function singleSelect(
  updater: ((prev: MRT_RowSelectionState) => MRT_RowSelectionState) | MRT_RowSelectionState,
  prev: MRT_RowSelectionState,
): MRT_RowSelectionState {
  const next = typeof updater === 'function' ? updater(prev) : updater
  const keys = Object.keys(next).filter(k => next[k])

  if (keys.length <= 1) return next

  return { [keys[keys.length - 1]]: true }
}
// Tableconfig.tsx
export const tableGroupingHint = (
  <span style={{ fontSize: 13, color: '#888' }}>
    Faites glisser une colonne ici pour grouper
  </span>
)