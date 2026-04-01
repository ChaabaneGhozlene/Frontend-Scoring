import type { MRT_TableOptions, MRT_RowSelectionState } from 'mantine-react-table'
import type { ReactNode } from 'react'

export function getSharedTableProps<T extends Record<string, any>>(): Partial<MRT_TableOptions<T>> {
  return {
    enableRowSelection: true,
    enableMultiRowSelection: true,
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

    localization: {
      noRecordsToDisplay: 'No data to display',
      rowsPerPage: 'Affichage:',
      of: 'sur',
    },

    mantineTopToolbarProps: {
      style: {
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: 'unset',
        padding: 0,
      },
    },
  }
}

/** Label affiché dans la toolbar de chaque table */
export const tableGroupingHint: ReactNode = (
  <div style={{ padding: '5px 12px', fontSize: 12, color: '#9ca3af' }}>
    Drag a column header here to group by that column
  </div>
)

/** sélection d'une seule ligne */
export function singleSelect(
  updater: ((prev: MRT_RowSelectionState) => MRT_RowSelectionState) | MRT_RowSelectionState,
  prev: MRT_RowSelectionState,
): MRT_RowSelectionState {
  const next = typeof updater === 'function' ? updater(prev) : updater

  const keys = Object.keys(next).filter((k) => next[k])
  if (keys.length <= 1) return next

  const prevKeys = Object.keys(prev).filter((k) => prev[k])
  const newKey = keys.find((k) => !prevKeys.includes(k))

  return newKey ? { [newKey]: true } : { [keys[keys.length - 1]]: true }
}