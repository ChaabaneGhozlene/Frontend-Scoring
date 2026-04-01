import { useEffect, useState, useRef, type FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MantineReactTable, type MRT_ColumnDef, type MRT_RowSelectionState } from 'mantine-react-table'
import type { RootState } from '../../../app/store'
import {
  fetchUsersRequest,
  fetchSitesRequest,
  createUserRequest,
  updateUserRequest,
  deleteUsersRequest,
} from '../userSlice'
import type { CreateUserDto, UpdateUserDto, UserDto } from '../userTypes'
import UserModal from '../components/userModal'
import PageLayout from '../../Configuration/Pagelayout'
import { useSettingsPage } from '../../Configuration/Usesettingspage'
import HeaderButton, { IconDelete, IconEdit, IconPlus } from '../../Configuration/Headerbutton'
import { getSharedTableProps, singleSelect } from '../../Configuration/Tableconfig'

// ═══════════════════════════════════════════════════════════════
// PAGE — List of Users (Evaluation)
// ═══════════════════════════════════════════════════════════════

const UsersPage: FC = () => {
  const dispatch = useDispatch()
  const { items, sites, totalCount, loading, saving, error } =
    useSelector((state: RootState) => state.Users)
  const { toast, notify } = useSettingsPage()

  // ── Local UI state ────────────────────────────────────────────
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none')
  const [editTarget, setEditTarget] = useState<UserDto | undefined>()
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  })
  const prevSaving = useRef(saving)

  // ── Column definitions ────────────────────────────────────────
  const columns: MRT_ColumnDef<UserDto>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'login',
      header: 'Login',
      size: 150,
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      size: 150,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      size: 150,
    },
    {
      accessorKey: 'isActive',
      header: 'IsActive',
      size: 100,
      Cell: ({ cell }) => (
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: cell.getValue() ? '#dcfce7' : '#fee2e2',
            color: cell.getValue() ? '#16a34a' : '#DC2626',
          }}
        >
          {cell.getValue() ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      accessorKey: 'siteName',
      header: 'Site',
      size: 200,
    },
  ]

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchSitesRequest())
    dispatch(fetchUsersRequest({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize }))
  }, [dispatch, pagination.pageIndex, pagination.pageSize])

  // ── Detect save completion to show toast ─────────────────────
  useEffect(() => {
    if (prevSaving.current && !saving) {
      if (error) {
        notify(error, 'error')
      } else if (modal !== 'none') {
        notify(modal === 'create' ? 'Utilisateur créé ✓' : 'Utilisateur mis à jour ✓')
        setModal('none')
        setRowSelection({})
        dispatch(fetchUsersRequest({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize }))
      } else {
        notify('Suppression effectuée ✓')
        setRowSelection({})
        dispatch(fetchUsersRequest({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize }))
      }
    }
    prevSaving.current = saving
  }, [saving, error, modal, notify, dispatch, pagination.pageIndex, pagination.pageSize])

  // ── Actions ───────────────────────────────────────────────────
  const handleCreate = () => {
    setEditTarget(undefined)
    setModal('create')
  }

  const handleEdit = () => {
    const selectedRow = Object.keys(rowSelection)[0]
    if (!selectedRow) return
    const user = items.find((u: UserDto) => u.id === parseInt(selectedRow))
    setEditTarget(user)
    setModal('edit')
  }

  const handleDelete = () => {
    const selectedIds = Object.keys(rowSelection).map((id) => parseInt(id))
    if (selectedIds.length === 0) return
    if (!window.confirm(`Supprimer ${selectedIds.length} utilisateur(s) ?`)) return
    dispatch(deleteUsersRequest({ ids: selectedIds }))
  }

  const handleSave = (dto: CreateUserDto | UpdateUserDto) => {
    if (modal === 'create') {
      dispatch(createUserRequest({ dto: dto as CreateUserDto }))
    } else if (modal === 'edit' && editTarget) {
      dispatch(updateUserRequest({ id: editTarget.id, dto: dto as UpdateUserDto }))
    }
  }

  // ── Table props ───────────────────────────────────────────────
  const tableProps = {
    columns,
    data: items,
    state: {
      rowSelection,
      globalFilter,
      pagination,
      isLoading: loading,
    },
    onRowSelectionChange: (updater: any) => {
      setRowSelection((prev) => singleSelect(updater, prev))
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: totalCount,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    positionToolbarAlertBanner: 'bottom' as const,
    mantineTopToolbarProps: {
      style: {
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: 'unset',
        padding: 0,
      },
    },
    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
      withColumnBorders: false,
    },
    mantineTableBodyRowProps: ({ row }: any) => ({
      onDoubleClick: () => {
        setEditTarget(row.original)
        setModal('edit')
      },
      style: {
        cursor: 'pointer',
      },
    }),
    // On retire renderTopToolbarCustomActions car les boutons sont dans le header
    ...getSharedTableProps<UserDto>(),
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <PageLayout
      title="List of users"
      crumb="List of users / Evaluation Admins"
      toast={toast}
      icon={<span style={{ fontSize: 20 }}>⚙️</span>}
      actions={
        <>
          <HeaderButton label="Nouveau" icon={IconPlus} onClick={handleCreate} />
          <HeaderButton
            label="Editer"
            icon={IconEdit}
            onClick={handleEdit}
          />
          <HeaderButton
            label="Supprimer"
            icon={IconDelete}
            onClick={handleDelete}
          />
        </>
      }
    >
      <div style={{ padding: '16px' }}>
        <MantineReactTable {...tableProps} />
      </div>

      {modal !== 'none' && (
        <UserModal
          mode={modal}
          user={editTarget}
          sites={sites}
          saving={saving}
          onSave={handleSave}
          onClose={() => setModal('none')}
        />
      )}
    </PageLayout>
  )
}

export default UsersPage