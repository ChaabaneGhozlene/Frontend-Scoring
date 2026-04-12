import { useEffect, useState, useMemo, useCallback } from 'react'
import type { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import {
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate, changeModel,
  fetchCampaigns, createCampaign, updateCampaign, deleteCampaign,
  fetchPeriodes, fetchCustomers, setSelectedTemplate, clearError,
} from '../ConfigurationCampagnesslice'

import type {
  LsCalledCampaignDto,
  CreateLsTemplateDto, UpdateLsTemplateDto, ChangeModelDto,
  CreateCalledCampaignDto, UpdateCalledCampaignDto,
} from '../ConfigurationCampagnestypes'
import TemplateModal    from '../components/TemplateModal'
import CampaignModal    from '../components/CampaignModal'
import ConfirmModal     from '../components/ConfirmModal'
import ChangeModelModal from '../components/ChangeModelModal'
import type { AppDispatch, RootState } from '../../../../app/store'

// ── Shared ────────────────────────────────────────────────────────────────────

import { badgeLbl, infoBadge, pillActive, pillInactive, selBadge, tableWrap, toolbarBar, toolbarBtn, toolbarBtnsWrap, toolbarLbl, toolbarSelect } from '../../../Pagestyles'
import HeaderButton, { IconDelete, IconEdit, IconPlus } from '../../Headerbutton'
import { getSharedTableProps, singleSelect, tableGroupingHint } from '../../../Tableconfig'
import PageLayout from '../../../Pagelayout'
import { useSettingsPage } from '../../Usesettingspage'


const useAppDispatch = () => useDispatch<AppDispatch>()
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

type ModalType =
  | 'newTemplate' | 'editTemplate' | 'changeModel' | 'confirmDeleteTemplate'
  | 'newCampaign'  | 'editCampaign'  | 'confirmDeleteCampaign'
  | null

const ConfigurationCampagnesPage: FC = () => {
  const dispatch = useAppDispatch()
  const { templates, selectedTemplate, campaigns, periodes, customers, loading, error } =
    useAppSelector((s: RootState) => s.configuration)

  const { toast, setToast, notify } = useSettingsPage()
  const [modal,          setModal]   = useState<ModalType>(null)
  const [activeCampaign, setActive]  = useState<LsCalledCampaignDto | null>(null)
  const [rowSelection,   setRowSel]  = useState<Record<string, boolean>>({})
  const [filterCamp,     setFilterCamp] = useState('')
  const [filterStat,     setFilterStat] = useState('')

  useEffect(() => {
    dispatch(fetchTemplates())
    dispatch(fetchPeriodes())
    dispatch(fetchCustomers())
  }, [dispatch])

  useEffect(() => {
    if (selectedTemplate) { dispatch(fetchCampaigns(selectedTemplate.id)); setRowSel({}) }
  }, [selectedTemplate, dispatch])

  // Erreurs Redux → toast
  useEffect(() => {
    if (error) {
      setToast({ msg: error, type: 'error' })
      const t = setTimeout(() => { setToast(null); dispatch(clearError()) }, 3500)
      return () => clearTimeout(t)
    }
  }, [error, dispatch, setToast])

  const filtered = useMemo(() =>
    campaigns.filter((c: LsCalledCampaignDto) =>
      c.campagneDescription.toLowerCase().includes(filterCamp.toLowerCase()) &&
      (filterStat === '' || String(c.status) === filterStat)
    ), [campaigns, filterCamp, filterStat])

  const selectedRows = useMemo(() =>
    filtered.filter((_, i) => rowSelection[i]), [filtered, rowSelection])

  // ── Guards ────────────────────────────────────────────────────────────────
  const needTemplate = useCallback((fn: () => void) => {
    if (!selectedTemplate) { notify('Sélectionnez un modèle', 'error'); return }
    fn()
  }, [selectedTemplate, notify])

  const needOne = useCallback((fn: (c: LsCalledCampaignDto) => void) => {
    if (selectedRows.length !== 1) { notify('Sélectionnez exactement une ligne', 'error'); return }
    fn(selectedRows[0])
  }, [selectedRows, notify])

  const needAny = useCallback((fn: (rows: LsCalledCampaignDto[]) => void) => {
    if (selectedRows.length === 0) { notify('Sélectionnez au moins une ligne', 'error'); return }
    fn(selectedRows)
  }, [selectedRows, notify])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateTemplate = async (dto: CreateLsTemplateDto | UpdateLsTemplateDto) => {
    await dispatch(createTemplate(dto as CreateLsTemplateDto)); setModal(null); notify('Modèle créé')
  }
  const handleUpdateTemplate = async (dto: CreateLsTemplateDto | UpdateLsTemplateDto) => {
    if (!selectedTemplate) return
    await dispatch(updateTemplate({ id: selectedTemplate.id, dto: dto as UpdateLsTemplateDto }))
    setModal(null); notify('Modèle mis à jour')
  }
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return
    await dispatch(deleteTemplate(selectedTemplate.id)); setModal(null); notify('Modèle supprimé')
  }
  const handleChangeModel = async (dto: ChangeModelDto) => {
    if (!selectedTemplate) return
    await dispatch(changeModel({ id: selectedTemplate.id, dto })); setModal(null); notify('Nouvelle version créée')
  }
  const handleCreateCampaign = async (dto: CreateCalledCampaignDto | UpdateCalledCampaignDto) => {
    await dispatch(createCampaign(dto as CreateCalledCampaignDto)); setModal(null); notify('Campagne ajoutée')
  }
  const handleUpdateCampaign = async (dto: CreateCalledCampaignDto | UpdateCalledCampaignDto) => {
    if (!activeCampaign) return
    await dispatch(updateCampaign({ id: activeCampaign.id, dto: dto as UpdateCalledCampaignDto }))
    setModal(null); notify('Campagne mise à jour')
  }
  const handleDeleteCampaign = async () => {
    if (!selectedTemplate || selectedRows.length === 0) return
    await Promise.all(selectedRows.map((c: LsCalledCampaignDto) =>
      dispatch(deleteCampaign({ id: c.id, templateId: selectedTemplate.id }))
    ))
    setModal(null); setRowSel({}); setActive(null)
    notify(selectedRows.length > 1 ? `${selectedRows.length} campagnes supprimées` : 'Campagne supprimée')
  }

  // ── Colonnes ──────────────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<LsCalledCampaignDto>[]>(() => [
    { accessorKey: 'campagneDescription', header: 'Campagne' },
    {
      accessorKey: 'status',
      header: 'Statut',
      size: 120,
      Cell: ({ cell }) => (
        <span style={cell.getValue<number>() === 1 ? pillActive : pillInactive}>
          {cell.getValue<number>() === 1 ? 'Actif' : 'Inactif'}
        </span>
      ),
      filterVariant: 'select',
      mantineFilterSelectProps: {
        data: [{ value:'', label:'Tous' }, { value:'1', label:'Actif' }, { value:'0', label:'Inactif' }],
      },
    },
  ], [])

  const table = useMantineReactTable<LsCalledCampaignDto>({
  ...getSharedTableProps<LsCalledCampaignDto>(campaigns.length),
  columns,
  data: filtered,
  state: { isLoading: loading, rowSelection },
  onRowSelectionChange: (updater) =>
    setRowSel(prev => singleSelect(updater, prev)),
  renderTopToolbarCustomActions: () => tableGroupingHint,
})
  return (
    <PageLayout
      title="Campaings Settings"
      crumb="Settings / Campaings Settings"
      toast={toast}
      actions={<>
        <HeaderButton label="Nouveau"    icon={IconPlus}   onClick={() => needTemplate(() => setModal('newCampaign'))} />
        <HeaderButton label="Editer"     icon={IconEdit}   onClick={() => needTemplate(() => needOne(c => { setActive(c); setModal('editCampaign') }))} />
        <HeaderButton label="Supprimer"  icon={IconDelete} onClick={() => needTemplate(() => needAny(rows => { setActive(rows[0]); setModal('confirmDeleteCampaign') }))} />
      </>}
      toolbar={
        <div style={toolbarBar}>
          <label style={toolbarLbl}>Model :</label>
          <select style={toolbarSelect} value={selectedTemplate?.id ?? ''}
            onChange={e => dispatch(setSelectedTemplate(templates.find(t => t.id === Number(e.target.value)) ?? null))}>
            <option value="">-- Sélectionner --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.description}{t.version > 1 ? ` (V${t.version})` : ''}{t.status === 0 ? ' [Inactif]' : ''}
              </option>
            ))}
          </select>

          <div style={toolbarBtnsWrap}>
            <button style={toolbarBtn} title="Nouveau modèle"   onClick={() => setModal('newTemplate')}>＋</button>
            <button style={toolbarBtn} title="Modifier modèle"  onClick={() => needTemplate(() => setModal('editTemplate'))}>✏</button>
            <button style={toolbarBtn} title="Nouvelle version" onClick={() => needTemplate(() => setModal('changeModel'))}>⇄</button>
            <button style={{ ...toolbarBtn, color:'#DC2626', fontWeight:700 }} title="Supprimer modèle"
              onClick={() => needTemplate(() => setModal('confirmDeleteTemplate'))}>—</button>
          </div>

          {selectedTemplate && (
            <div style={infoBadge}>
              <span style={badgeLbl}>Min:</span><strong>{selectedTemplate.min}</strong>
              <span style={badgeLbl}>Max:</span><strong>{selectedTemplate.max}</strong>
              {selectedTemplate.periodeDescription && (
                <><span style={badgeLbl}>Période:</span><strong>{selectedTemplate.periodeDescription}</strong></>
              )}
              <span style={selectedTemplate.status === 1 ? pillActive : pillInactive}>
                {selectedTemplate.status === 1 ? 'Actif' : 'Inactif'}
              </span>
            </div>
          )}

          {selectedRows.length > 0 && (
            <div style={selBadge}>
              {selectedRows.length} ligne{selectedRows.length > 1 ? 's' : ''} sélectionnée{selectedRows.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      }
    >
      <div style={tableWrap}><MantineReactTable table={table} /></div>

      {modal === 'newTemplate'  && <TemplateModal mode="create" periodes={periodes} onConfirm={handleCreateTemplate} onClose={() => setModal(null)} />}
      {modal === 'editTemplate' && selectedTemplate && <TemplateModal mode="edit" template={selectedTemplate} periodes={periodes} onConfirm={handleUpdateTemplate} onClose={() => setModal(null)} />}
      {modal === 'changeModel'  && selectedTemplate && <ChangeModelModal template={selectedTemplate} periodes={periodes} onConfirm={handleChangeModel} onClose={() => setModal(null)} />}
      {modal === 'confirmDeleteTemplate' && <ConfirmModal message={`Supprimer le modèle "${selectedTemplate?.description}" ?`} onConfirm={handleDeleteTemplate} onClose={() => setModal(null)} />}
      {modal === 'newCampaign'  && selectedTemplate && <CampaignModal mode="create" templateId={selectedTemplate.id} customers={customers} onConfirm={handleCreateCampaign} onClose={() => setModal(null)} />}
      {modal === 'editCampaign' && selectedTemplate && activeCampaign && <CampaignModal mode="edit" campaign={activeCampaign} templateId={selectedTemplate.id} customers={customers} onConfirm={handleUpdateCampaign} onClose={() => setModal(null)} />}
      {modal === 'confirmDeleteCampaign' && (
        <ConfirmModal
          message={selectedRows.length > 1 ? `Supprimer les ${selectedRows.length} campagnes sélectionnées ?` : `Supprimer la campagne "${activeCampaign?.campagneDescription}" ?`}
          onConfirm={handleDeleteCampaign} onClose={() => setModal(null)} />
      )}
    </PageLayout>
  )
}

export default ConfigurationCampagnesPage