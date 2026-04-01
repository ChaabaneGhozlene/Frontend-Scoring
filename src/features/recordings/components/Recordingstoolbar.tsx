import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import {
  setStartDate, setEndDate, 
   fetchRecordingsRequest,
   deleteViewConfigRequest,
} from '../Recordingslice'
import Toolbar from '../../Toolbar'

interface Props {
  onOpenSaveView:      () => void
  onOpenUpdateView:    () => void
  onSelectViewConfig:  (id: number | null) => void  // ← nouveau
}

const RecordingsToolbar = ({
 
  onOpenSaveView,
  onOpenUpdateView,
  onSelectViewConfig,   // ← destructuré
}: Props) => {
  const dispatch = useDispatch()
  const {
    dateDebut, dateFin,
    selectedFilterId,
    viewConfigs, selectedViewConfigId,
    pageSize, columnFilters,
  } = useSelector((s: RootState) => s.recordings)

  return (
    <Toolbar
      startDate={dateDebut ? new Date(dateDebut) : null}
      endDate={dateFin     ? new Date(dateFin)   : null}
      onStartDateChange={(d) => dispatch(setStartDate(d
        ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        : ''))}
      onEndDateChange={(d) => dispatch(setEndDate(d
        ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        : ''))}
      onRefresh={() => dispatch(fetchRecordingsRequest({
        dateDebut, dateFin, filterId: selectedFilterId,
        page: 1, pageSize, columnFilters,
      }))}
      viewConfig={{
        options:    viewConfigs.map((v) => ({ value: String(v.id), label: v.name })),
        selectedId: selectedViewConfigId,
        onSelect:   onSelectViewConfig,   // ← restauration complète depuis le parent
        onSave:     onOpenUpdateView,
        onNew:      onOpenSaveView,
onDelete: () => {
  if (!selectedViewConfigId) return
  dispatch(deleteViewConfigRequest(selectedViewConfigId))
  onSelectViewConfig(null)  // ← AJOUTER : reset complet comme si on déselectionne
},      }}
    />
  )
}

export default RecordingsToolbar