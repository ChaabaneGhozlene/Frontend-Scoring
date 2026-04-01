
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Group, NumberInput, ActionIcon, Text, Tooltip, Button,
  MultiSelect, Alert, Stack,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import {
  IconRefresh, IconDeviceTv, IconHeadphones,
  IconDownload, IconClipboardCheck, IconAlertCircle,
} from '@tabler/icons-react'
import {
  setStartDate, setEndDate,
  setSelectedAgentOid, setNbEnregistrements,
  clearMessages,
} from '../Evalslice'
import {
  FETCH_RECORDS_REQUEST,
  OPEN_EVAL_REQUEST,
} from '../Evalsaga'
import type { RootState } from '../../../app/store'

const parseDateDDMMYYYY = (value: string): Date => {
  const parts = value.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  return new Date(value)
}

const toDate   = (s: string | null): Date | null => s ? new Date(s) : null
const fromDate = (d: Date | null): string | null => d ? d.toISOString().split('T')[0] : null

interface Props {
  selectedRecordId: number | null
   onOpenReport:     () => void
}

const EvaluationToolbar = ({ selectedRecordId }: Props) => {
  const dispatch = useDispatch()
  const {
    startDate, endDate,
    selectedAgentOid, agents,
    nbEnregistrements,
    loadingEval,
    errorEval,       // ← ajouter
  } = useSelector((s: RootState) => s.eval)

  const [localStart, setLocalStart] = useState<Date | null>(toDate(startDate))
  const [localEnd,   setLocalEnd]   = useState<Date | null>(toDate(endDate))

  useEffect(() => { setLocalStart(toDate(startDate)) }, [startDate])
  useEffect(() => { setLocalEnd(toDate(endDate))     }, [endDate])

  const handleStartChange = (d: Date | null) => {
    setLocalStart(d)
    dispatch(setStartDate(fromDate(d)))
  }
  const handleEndChange = (d: Date | null) => {
    setLocalEnd(d)
    dispatch(setEndDate(fromDate(d)))
  }

  const handleRefresh = () => {
    dispatch({ type: FETCH_RECORDS_REQUEST })
  }

  const handleEvaluer = () => {
    if (!selectedRecordId) return
    dispatch(clearMessages())   // ← reset erreur avant chaque tentative
    dispatch({ type: OPEN_EVAL_REQUEST, payload: selectedRecordId })
  }

  const agentOptions = agents.map(a => ({ value: a.oid, label: a.label }))

  return (
    <Stack spacing={0}>
      <Group
        spacing="xs"
        px="xs"
        py={6}
        style={{ borderBottom: errorEval ? undefined : '1px solid #dee2e6', flexWrap: 'wrap' }}
      >
        {/* Agent selector */}
        <Group spacing={4} align="center">
          <Text size="sm" weight={500}>Agents:</Text>
          <MultiSelect
            data={agentOptions}
            value={selectedAgentOid}
            onChange={(v) => dispatch(setSelectedAgentOid(v))}
            placeholder="Sélectionner un agent"
            clearable
            searchable
            size="xs"
            w={220}
          />
        </Group>

        {/* Start date */}
        <Group spacing={4} align="center">
          <Text size="sm" weight={500}>Début:</Text>
          <DateInput
            value={localStart}
            onChange={handleStartChange}
            dateParser={parseDateDDMMYYYY}
            valueFormat="DD/MM/YYYY"
            placeholder="JJ/MM/AAAA"
            size="xs"
            w={130}
          />
        </Group>

        {/* End date */}
        <Group spacing={4} align="center">
          <Text size="sm" weight={500}>Fin:</Text>
          <DateInput
            value={localEnd}
            onChange={handleEndChange}
            dateParser={parseDateDDMMYYYY}
            valueFormat="DD/MM/YYYY"
            placeholder="JJ/MM/AAAA"
            size="xs"
            w={130}
          />
        </Group>

        {/* Refresh */}
        <Tooltip label="Actualiser">
          <ActionIcon
            variant="transparent"
            color="blue"
            onClick={handleRefresh}
            size="sm"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>

        {/* Nb enregistrements */}
        <Group spacing={4} align="center">
          <Text size="sm" weight={500}>Enregistrements:</Text>
          <NumberInput
            value={nbEnregistrements}
            onChange={(v) => dispatch(setNbEnregistrements(Number(v) || 10))}
            min={1}
            max={500}
            size="xs"
            w={70}
            hideControls={false}
          />
        </Group>

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <Group spacing={6}>
          <Tooltip label="Screen">
            <Button
              size="xs" variant="subtle" color="red"
              leftIcon={<IconDeviceTv size={14} />}
              disabled={!selectedRecordId}
            >
              Screen
            </Button>
          </Tooltip>

          <Tooltip label="Écouter l'enregistrement">
            <Button
              size="xs" variant="subtle" color="red"
              leftIcon={<IconHeadphones size={14} />}
              disabled={!selectedRecordId}
            >
              Ecouter
            </Button>
          </Tooltip>

          <Tooltip label="Télécharger l'enregistrement">
            <Button
              size="xs" variant="subtle" color="red"
              leftIcon={<IconDownload size={14} />}
              disabled={!selectedRecordId}
            >
              Télécharger
            </Button>
          </Tooltip>

          <Tooltip label="Évaluer l'enregistrement sélectionné">
            <Button
              size="xs" variant="subtle" color="red"
              leftIcon={<IconClipboardCheck size={14} />}
              disabled={!selectedRecordId}
              loading={loadingEval}
              onClick={handleEvaluer}
            >
              Evaluer
            </Button>
          </Tooltip>
        </Group>
      </Group>

      {/* ── Erreur évaluation ── */}
      {errorEval && (
        <Alert
          icon={<IconAlertCircle size={14} />}
          color="red"
          withCloseButton
          onClose={() => dispatch(clearMessages())}
          py={6}
          px="xs"
          style={{ borderRadius: 0, borderBottom: '1px solid #dee2e6', fontSize: 12 }}
        >
          {errorEval}
        </Alert>
      )}
    </Stack>
  )
}

export default EvaluationToolbar