// features/eval/page/Evalpage.tsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Stack, Paper, Group, Text, Breadcrumbs, Anchor,
  Notification, LoadingOverlay,
} from '@mantine/core'
import { IconCheck, IconClipboardList } from '@tabler/icons-react'
import SurveyEditModal        from '../componentsEval/Evalsurveymodal'
import EvaluationTable        from '../componentsEval/Evaltable'
import EvaluationToolbar      from '../componentsEval/Evaltoolbar'
import { clearMessages, closeEval } from '../Evalslice'
import { clearAgentReport, fetchAgentReportRequest } from '../../evaluation/Evaluationslice'
import { FETCH_RECORDS_REQUEST, LOAD_REFERENCE_DATA, OPEN_EVAL_REQUEST, SAVE_EVAL_REQUEST } from '../Evalsaga'
import type { RootState } from '../../../app/store'

const EvalPage = () => {
  const dispatch = useDispatch()

  // ── Store s.eval ──────────────────────────────────────────
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

  const [reportOpen, setReportOpen] = useState(false)

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    dispatch({ type: LOAD_REFERENCE_DATA })
    dispatch({ type: FETCH_RECORDS_REQUEST })
  }, [dispatch])

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
      />

      {/* Table */}
      <Paper radius={0} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LoadingOverlay visible={loadingEval} overlayBlur={1} />
        <EvaluationTable onRowDoubleClick={handleRowDoubleClick} />
      </Paper>

      {/* Modal évaluation */}
      <SurveyEditModal
        opened={isSurveyOpen}
        onClose={() => dispatch(closeEval())}
        onSave={(dto) => {
  const mappedItems = dto.items.map(item => {
    const gridRow = openEval?.gridRows.find(r => r.id === item.id)
    
    // ✅ LOG TEMPORAIRE — à retirer après correction
    console.log('item.id=', item.id, 
                'gridRow?.templateItemId=', gridRow?.templateItemId,
                'value=', item.value)
    
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
      />

    </Stack>
  )
}

export default EvalPage