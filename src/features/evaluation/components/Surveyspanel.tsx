// components/evaluation/SurveysPanel.tsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionIcon, Tooltip, Group, Box, Loader } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { RootState } from '../../../app/store'
import type { LsSurveyDto, UpdateSurveyDto } from '../Evaluationtypes'
import { deleteSurveyRequest, fetchItemsRequest, selectSurvey, updateSurveyRequest } from '../Evaluationslice'
import EvaluationDeleteConfirmModal from './Evaluationdeleteconfirmmodal'
import { LOAD_REFERENCE_DATA } from '../../eval/Evalsaga'
import { streamAudioUrl } from '../../eval/Evalservice'
import SurveyModalBase from '../../eval/componentsEval/Surveymodalbase'

const S = {
  panel:       { borderTop: '1px solid #dee2e6', background: '#fff' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6' },
  headerTitle: { fontSize: 13, fontWeight: 700, color: '#333' },
  table:       { width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 },
  th:          { background: '#f3f4f6', padding: '6px 10px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', fontSize: 11, whiteSpace: 'nowrap' as const },
  td:          { padding: '5px 10px', borderBottom: '1px solid #f0f0f0', color: '#333', fontSize: 12 },
  trSelected:  { background: '#fef2f2', borderLeft: '3px solid #DC2626' },
  empty:       { padding: '20px', textAlign: 'center' as const, color: '#9ca3af', fontSize: 13 },
}

const scoreBadge = (score: number) => ({
  display: 'inline-block', padding: '2px 10px',
  borderRadius: 10, fontSize: 11, fontWeight: 700 as const,
  background: score >= 80 ? '#d1fae5' : score >= 60 ? '#fef9c3' : '#fee2e2',
  color:      score >= 80 ? '#065f46' : score >= 60 ? '#92400e' : '#991b1b',
})

const SurveysPanel: React.FC = () => {
  const dispatch = useDispatch()
 const [audioUrl,     setAudioUrl]     = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  const {
    surveys, surveysLoading, surveysError,
    selectedFicheId, selectedSurveyId,
    surveyItems, itemsLoading, itemsError,
    updateLoading, updateError,
    deleteLoading,
    selectedRow,
  } = useSelector((s: RootState) => s.evaluation)

  const { categories, callReasons } = useSelector((s: RootState) => s.eval)

  //  Charger les données de référence si pas encore chargées
  useEffect(() => {
    if (categories.length === 0) {
      dispatch({ type: LOAD_REFERENCE_DATA })
    }
  }, [])

  const [deleteTarget, setDeleteTarget] = useState<LsSurveyDto | null>(null)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [editOpen,     setEditOpen]     = useState(false)
  const [editSurvey,   setEditSurvey]   = useState<LsSurveyDto | null>(null)
  useEffect(() => {
    if (categories.length === 0) {
      dispatch({ type: LOAD_REFERENCE_DATA })
    }
  }, [])

  useEffect(() => {
    if (!editOpen) {
      setAudioUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setAudioLoading(false)
    }
  }, [editOpen])

  // ── handleListenInModal ──
  const handleListenInModal = async () => {
    const recordId = editSurvey?.recordDataId ?? null  // ← recordDataId ✅

    console.log('▶️ [SurveysPanel] recordId:', recordId)

    if (!recordId) {
      console.warn('❌ recordId null')
      return
    }

    setAudioLoading(true)
    try {
      const blobUrl = await streamAudioUrl(recordId)
      console.log('✅ blobUrl:', blobUrl)
      setAudioUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return blobUrl
      })
    } catch (e: any) {
      console.error('💥', e?.response?.status, e?.message)
    } finally {
      setAudioLoading(false)
    }
  }
  // Trouver les IDs à partir des libellés de la survey sélectionnée
  const initialCategoryId = categories.find(
    c => c.libelle === editSurvey?.categoryName
  )?.id ?? null

  const initialCallReasonId = callReasons.find(
    c => c.libelle === editSurvey?.callReasonName
  )?.id ?? null

  if (!selectedFicheId) return null

  const handleEdit = (sv: LsSurveyDto) => {
    setEditSurvey(sv)
    dispatch(selectSurvey(sv.id))
    dispatch(fetchItemsRequest(sv.id))
    setEditOpen(true)
  }

  const handleDelete = (sv: LsSurveyDto) => {
    setDeleteTarget(sv)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    dispatch(deleteSurveyRequest(deleteTarget.id))
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  const handleSave = (dto: UpdateSurveyDto) => {
    if (!editSurvey) return
    dispatch(updateSurveyRequest({ surveyId: editSurvey.id, dto }))
    setEditOpen(false)
  }

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <span style={S.headerTitle}>
          Évaluations de la fiche #{selectedFicheId}
        </span>
        {surveysLoading && <Loader size="xs" color="red" />}
      </div>

      {surveysError && (
        <Box p="sm" style={{ color: '#DC2626', fontSize: 12 }}>{surveysError}</Box>
      )}

      {!surveysLoading && surveys.length === 0 && !surveysError && (
        <div style={S.empty}>Aucune évaluation pour cette fiche.</div>
      )}

      {surveys.length > 0 && (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Actions</th>
              <th style={S.th}>ID</th>
              <th style={S.th}>Date enregistrement</th>
              <th style={S.th}>Créé le</th>
              <th style={S.th}>Score</th>
              <th style={S.th}>Catégorie</th>
              <th style={S.th}>Motif appel</th>
              <th style={S.th}>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((sv, i) => (
              <tr
                key={sv.id}
                style={{
                  ...(sv.id === selectedSurveyId
                    ? S.trSelected
                    : i % 2 === 1 ? { background: '#fafafa' } : undefined),
                  cursor: 'pointer',
                }}
                onClick={() => dispatch(selectSurvey(sv.id))}
              >
                <td style={S.td} onClick={e => e.stopPropagation()}>
                  <Group spacing={4} noWrap>
                    <Tooltip label="Modifier" withArrow>
                      <ActionIcon size="sm" variant="light" color="blue"
                        onClick={() => handleEdit(sv)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Supprimer" withArrow>
                      <ActionIcon size="sm" variant="light" color="gray"
                        onClick={() => handleDelete(sv)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
                <td style={S.td}>{sv.id}</td>
                <td style={S.td}>{sv.recordDate || '—'}</td>
                <td style={S.td}>
                  {sv.createDate
                    ? new Date(sv.createDate).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td style={S.td}>
                  <span style={scoreBadge(sv.score)}>{sv.score}%</span>
                </td>
                <td style={S.td}>{sv.categoryName || '—'}</td>
                <td style={S.td}>{sv.callReasonName || '—'}</td>
                <td style={{
                  ...S.td,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {sv.memo || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <EvaluationDeleteConfirmModal
        opened={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        recordLabel={deleteTarget ? `Survey #${deleteTarget.id}` : undefined}
        loading={deleteLoading}
        title="Supprimer l'évaluation"
        message="Voulez-vous vraiment supprimer cette évaluation ?"
      />

      <SurveyModalBase
      resetOnOpen={false} 
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        items={surveyItems}
        loading={itemsLoading}
        saveLoading={updateLoading}
        error={updateError ?? itemsError}
        surveyScore={editSurvey?.score ?? 0}
        surveyLabel={editSurvey ? `Survey #${editSurvey.id}` : ''}
        recordDate={editSurvey?.recordDate ?? null}
        date={editSurvey?.createDate
          ? new Date(editSurvey.createDate).toLocaleDateString('fr-FR')
          : null}
        auditeur={
          selectedRow?.auditorName?.trim()
            ? selectedRow.auditorName
            : selectedRow?.auditor ? `#${selectedRow.auditor}` : null
        }
        indice={selectedRow ? String(selectedRow.id) : null}
        initialMemo={editSurvey?.memo ?? null}
        initialActionTaken={editSurvey?.memoActionTaken ?? null}
        initialCategoryId={initialCategoryId}
        initialCallReasonId={initialCallReasonId}
        categories={categories}
        callReasons={callReasons}
                audioUrl={audioUrl}
        audioLoading={audioLoading}
        onListen={handleListenInModal}
      />
    </div>
  )
}

export default SurveysPanel