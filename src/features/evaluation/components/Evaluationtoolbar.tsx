import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import {
  setStartDate, setEndDate,
  fetchFichesRequest,
  clearPendingApplyFilter,
  deleteViewConfigRequest,      
} from '../Evaluationslice'
import Toolbar from '../../Toolbar'
import type { EvalViewConfig } from '../Evaluationtypes'

interface Props {
  onOpenSaveView:     () => void   
  onOpenUpdateView:   () => void   
  onSelectViewConfig: (id: number | null) => void  
}

const toStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const EvaluationToolbar = ({
  onOpenSaveView,
  onOpenUpdateView,
  onSelectViewConfig,
}: Props) => {
  const dispatch = useDispatch()
  const {
    dateDebut,
    dateFin,
    pageSize,
    columnFilters,
    pendingApplyFilter,
    // ── Vues ──
    viewConfigs,
    selectedViewConfigId,
  } = useSelector((s: RootState) => s.evaluation)

  useEffect(() => {
    if (!pendingApplyFilter) return
    dispatch(fetchFichesRequest({
      dateDebut, dateFin,
      page: 1, pageSize, columnFilters,
    }))
    dispatch(clearPendingApplyFilter())
  }, [pendingApplyFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Toolbar
      startDate={dateDebut ? new Date(dateDebut) : null}
      endDate={dateFin     ? new Date(dateFin)   : null}
      onStartDateChange={(d) => dispatch(setStartDate(d ? toStr(d) : ''))}
      onEndDateChange={(d)   => dispatch(setEndDate(d   ? toStr(d) : ''))}
      onRefresh={() => dispatch(fetchFichesRequest({
        dateDebut, dateFin,
        page: 1, pageSize, columnFilters,
      }))}
      viewConfig={{
        options:    viewConfigs.map((v: EvalViewConfig) => ({ value: String(v.id), label: v.name })),
        selectedId: selectedViewConfigId,
        onSelect:   onSelectViewConfig,
        onSave:     onOpenUpdateView,
        onNew:      onOpenSaveView,
        onDelete: () => {
  if (!selectedViewConfigId) return
  dispatch(deleteViewConfigRequest(selectedViewConfigId))
  onSelectViewConfig(null)  // ← AJOUTER : reset complet comme si on déselectionne
},
      }}
    />
  )
}

export default EvaluationToolbar