// features/eval/page/Evalpage.tsx
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import {
  Stack, Paper, Group, Text, Breadcrumbs, Anchor,
  Notification, LoadingOverlay,
} from '@mantine/core'
import { IconCheck, IconClipboardList } from '@tabler/icons-react'
import EvaluationTable        from '../componentsEval/Evaltable'
import EvaluationToolbar      from '../componentsEval/Evaltoolbar'
import { clearMessages, closeEval, setStartDate, setEndDate } from '../Evalslice'
import { fetchAgentReportRequest } from '../../evaluation/Evaluationslice'
import { FETCH_RECORDS_REQUEST, LOAD_REFERENCE_DATA, OPEN_EVAL_REQUEST, SAVE_EVAL_REQUEST } from '../Evalsaga'
import type { RootState } from '../../../app/store'
import { streamAudioUrl } from '../Evalservice'
import SurveyModalBase from '../componentsEval/Surveymodalbase'
const EvalPage = () => {
  const dispatch = useDispatch()
  const store    = useStore()   // ← lit le state frais au moment du clic, sans closure stale

  const {
    selectedRecordId,
    successMessage,
    loadingEval,
    isSurveyOpen,
    openEval,
    savingEval,
    errorEval,
    categories,
    callReasons,
   
  } = useSelector((s: RootState) => s.eval)

  const [reportOpen,   setReportOpen]   = useState(false)
  const [audioUrl,     setAudioUrl]     = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  const selectedRecord = useSelector((s: RootState) =>
    s.eval.records.find(r => r.id === s.eval.selectedRecordId)
  )

  // ── Init ──────────────────────────────────────────────────
 
useEffect(() => {
  const today = new Date().toISOString().split('T')[0]
  dispatch(setStartDate(today))
  dispatch(setEndDate(today))
  dispatch({ type: LOAD_REFERENCE_DATA })
  dispatch({ type: FETCH_RECORDS_REQUEST })
}, [dispatch])
  // ── Réinitialiser l'audio à la fermeture du modal ─────────
  useEffect(() => {
    if (!isSurveyOpen) {
      setAudioUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setAudioLoading(false)
    }
  }, [isSurveyOpen])

  // ── Auto-hide success ─────────────────────────────────────
  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => dispatch(clearMessages()), 4000)
    return () => clearTimeout(t)
  }, [successMessage, dispatch])

  // ── Handlers ──────────────────────────────────────────────
  const handleRowDoubleClick = (recordId: number) => {
    dispatch({ type: OPEN_EVAL_REQUEST, payload: recordId })
  }

  const handleOpenReport = () => {
    if (!selectedRecordId) return
    dispatch(fetchAgentReportRequest(selectedRecordId))
    setReportOpen(true)
  }

  // Ref vers la fonction interne de la toolbar (popup toolbar)
  const toolbarListenRef = useRef<(() => void) | null>(null)

  // ── handleListen : toolbar uniquement (ouvre le popup) ────
  const handleListen = () => {
    toolbarListenRef.current?.()
  }

  // ── handleListenInModal : audio inline dans le modal ──────
 // ── handleListenInModal : audio inline dans le modal ──────
const handleListenInModal = async () => {
  const freshState = (store.getState() as RootState).eval
  const recordId = freshState.selectedRecordId   // ← variable locale correcte

  console.log('▶️ appelé, recordId:', recordId)

  if (!recordId) {
    console.warn('❌ selectedRecordId null dans le store')
    return
  }

  setAudioLoading(true)
  try {
     console.log('▶️ 1. handleListenInModal appelé')
    const blobUrl = await streamAudioUrl(recordId)  // ← on utilise recordId ici
    console.log('✅ blobUrl:', blobUrl)
    setAudioUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return blobUrl
    })
  } catch (e) {
    console.error('💥', e)
  } finally {
    setAudioLoading(false)
  }
}

  // ── Convertir EvalGridRow[] → SurveyItemDto[] ─────────────
  const surveyItems = openEval?.gridRows.map(r => ({
    id:             r.id,
    surveyId:       openEval.surveyId,
    sectionId:      r.groupId,
    question:       r.question,
    description:    r.definition,
    value:          r.value,
    memo:           r.memo,
    minValue:       r.scaleMin,
    maxValue:       r.scaleMax,
    allowNA:        r.isNA,
    sectionName:    r.groupName,
    sectionOrder:   r.groupOrder,
    itemOrder:      r.itemOrder,
    templateItemId: r.templateItemId,
  })) ?? []

  return (
    <Stack spacing={0} style={{ height: '100%', position: 'relative' }}>

      {/* Header */}
      <Group px="md" py="xs" spacing="sm" style={{ borderBottom: '1px solid #dee2e6' }}>
        <IconClipboardList size={22} color="#c92a2a" />
        <Stack spacing={0}>
          <Text size="lg" weight={700}>Evaluation</Text>
          <Breadcrumbs separator="/">
            <Anchor size="xs" color="dimmed">Evaluation</Anchor>
            <Text size="xs" color="dimmed">Liste des enregistrements</Text>
          </Breadcrumbs>
        </Stack>
      </Group>

      {/* Notification succès */}
      {successMessage && (
        <Notification
          icon={<IconCheck size={14} />}
          color="green"
          title="Évaluation sauvegardée"
          onClose={() => dispatch(clearMessages())}
          style={{ margin: '8px 12px 0' }}
        >
          {successMessage}
        </Notification>
      )}

      {/* Toolbar */}
      <EvaluationToolbar
        selectedRecordId={selectedRecordId}
        onOpenReport={handleOpenReport}
        onListen={handleListen}
        onRegisterListen={(fn) => { toolbarListenRef.current = fn }}
      />

      {/* Table */}
      <Paper radius={0} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LoadingOverlay visible={loadingEval} overlayBlur={1} />
        <EvaluationTable onRowDoubleClick={handleRowDoubleClick} />
      </Paper>

      {/* Modal évaluation */}
      <SurveyModalBase
      resetOnOpen={true} 
        opened={isSurveyOpen}
        onClose={() => dispatch(closeEval())}
        onSave={(dto) => {
          const mappedItems = dto.items.map(item => {
            const gridRow = openEval?.gridRows.find(r => r.id === item.id)
            return {
              itemId: gridRow?.templateItemId ?? item.id,
              value:  item.value,
              memo:   item.memo ?? '',
            }
          })
          dispatch({
            type: SAVE_EVAL_REQUEST,
            payload: {
              surveyId:     openEval?.surveyId,
              items:        mappedItems,
              memo:         dto.memo             ?? '',
              memoAction:   dto.memoActionTaken  ?? '',
              categoryId:   dto.categoryId       ?? null,
              callReasonId: dto.callReasonId     ?? null,
              ccEmail:      dto.ccEmail          ?? null,
            },
          })
        }}
        items={surveyItems}
        loading={loadingEval}
        saveLoading={savingEval}
        error={errorEval}
        surveyScore={0}
        surveyLabel={openEval ? `Survey #${openEval.surveyId}` : ''}
        categories={categories}
        callReasons={callReasons}
        recordDate={openEval?.recordDate ?? selectedRecord?.recordDate ?? undefined}
        indice={openEval?.callIndex ?? selectedRecord?.recIdLink?.toString() ?? undefined}
        date={openEval?.evalDate}
        auditeur={openEval?.auditor}
        audioUrl={audioUrl}
        audioLoading={audioLoading}
        onListen={handleListenInModal}
      />

    </Stack>
  )
}

export default EvalPage