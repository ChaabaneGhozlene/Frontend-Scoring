import { useState, useEffect, useCallback } from 'react'
import { streamAudioUrl } from '../Evalservice'
import { useDispatch, useSelector } from 'react-redux'
import {
  Group, Text, Tooltip, Button,
  MultiSelect, Alert, Stack, Modal, Divider,
} from '@mantine/core'
import {
  IconDeviceTv, IconHeadphones,
  IconClipboardCheck, IconAlertCircle,
} from '@tabler/icons-react'
import {
  setStartDate, setEndDate,
  setSelectedAgentOid,
  clearMessages,
} from '../Evalslice'
import {
  FETCH_RECORDS_REQUEST,
  OPEN_EVAL_REQUEST,
} from '../Evalsaga'
import type { RootState } from '../../../app/store'
import FlvPlayer from './FlvPlayer'
import Toolbar from '../../Toolbar'   // ← adapter le chemin si nécessaire

// ── Conversion locale (sans décalage UTC) ─────────────────
const toDate = (s: string | null): Date | null =>
  s ? new Date(s + 'T00:00:00') : null

const fromDate = (d: Date | null): string | null => {
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const j = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${j}`
}

interface Props {
  selectedRecordId:   number | null
  onOpenReport:       () => void
  onListen:           () => void
  onRegisterListen?:  (fn: () => void) => void
}

const EvaluationToolbar = ({ selectedRecordId,  onRegisterListen }: Props) => {
  const dispatch = useDispatch()
  const {
    startDate, endDate,
    selectedAgentOid, agents,
    loadingEval, errorEval, records,
  } = useSelector((s: RootState) => s.eval)

  // ── Audio ──────────────────────────────────────────────────
  const [audioOpen, setAudioOpen] = useState(false)
  const [audioUrl,  setAudioUrl]  = useState<string | null>(null)

  // ── Screen ─────────────────────────────────────────────────
  const [screenOpen,  setScreenOpen]  = useState(false)
  const [screenUrl,   setScreenUrl]   = useState<string | null>(null)
  const [screenToken, setScreenToken] = useState<string>('')

  const selectedRecord = records.find(r => r.id === selectedRecordId) ?? null

  // ── Handlers ───────────────────────────────────────────────
  const handleListen = useCallback(async () => {
    if (!selectedRecordId) return
    try {
      const blobUrl = await streamAudioUrl(selectedRecordId)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(blobUrl)
      setAudioOpen(true)
    } catch (err: any) {
      console.error('💥 [Audio] Erreur:', err?.response?.status, err?.message)
    }
  }, [selectedRecordId, audioUrl])

  const handleScreen = () => {
    if (!selectedRecordId) return
    const token   = localStorage.getItem('token') ?? ''
    const httpUrl = `http://localhost:5164/api/evaluation/records/${selectedRecordId}/stream-screen`
    setScreenUrl(httpUrl)
    setScreenToken(token)
    setScreenOpen(true)
  }

  useEffect(() => {
    onRegisterListen?.(handleListen)
  }, [handleListen])

  const handleStartChange = (d: Date | null) => {
    dispatch(setStartDate(fromDate(d)))
  }

  const handleEndChange = (d: Date | null) => {
    dispatch(setEndDate(fromDate(d)))
  }

  const handleRefresh = () => dispatch({ type: FETCH_RECORDS_REQUEST })

  const handleEvaluer = () => {
    if (!selectedRecordId) return
    dispatch(clearMessages())
    dispatch({ type: OPEN_EVAL_REQUEST, payload: selectedRecordId })
  }

  const agentOptions = agents.map(a => ({ value: a.oid, label: a.label }))

  // ── Cards métriques ────────────────────────────────────────
  const MetricCards = () => {
    if (!selectedRecord) return null
    return (
      <>
        <Group spacing={12} mb={16} style={{
          background: '#fff', borderRadius: 10,
          padding: '12px 14px', border: '1px solid #ebebeb',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#FAECE7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#993C1D', flexShrink: 0,
          }}>
            {[selectedRecord.prenomAgent?.[0], selectedRecord.nomAgent?.[0]]
              .filter(Boolean).join('').toUpperCase() || '?'}
          </div>
          <div>
            <Text size="sm" weight={600} style={{ color: '#222' }}>
              {[selectedRecord.prenomAgent, selectedRecord.nomAgent]
                .filter(Boolean).join(' ') || '—'}
            </Text>
            <Text size="xs" style={{ color: '#aaa' }}>Agent</Text>
          </div>
        </Group>

        <Group grow spacing={8} mb={16}>
          {[
            { label: 'Indice', value: selectedRecord.recIdLink ?? '—' },
            {
              label: "Date d'appel",
              value: (selectedRecord.callLocalTime ?? selectedRecord.recordDate)
                ?.split('T')[0].split('-').reverse().join('/') ?? '—',
            },
            {
              label: 'Heure',
              value: selectedRecord.callLocalTime?.split('T')[1]?.substring(0, 5)
                ?? selectedRecord.heureAppel ?? '—',
            },
            {
              label: 'Statut',
              value: selectedRecord.statusDescription
                ?? selectedRecord.statut
                ?? selectedRecord.callTypeDescription
                ?? '—',
            },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#fff', borderRadius: 8,
              padding: '8px 10px', border: '1px solid #ebebeb',
              borderTop: '2px solid #f28b70',
            }}>
              <Text size="xs" style={{
                color: '#bbb', fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.04em', marginBottom: 2,
              }}>
                {label}
              </Text>
              <Text size="xs" weight={600} style={{ color: '#333', fontSize: 12 }}>
                {value}
              </Text>
            </div>
          ))}
        </Group>
        <Divider mb={16} style={{ borderColor: '#ebebeb' }} />
      </>
    )
  }

  return (
    <Stack spacing={0}>

      {/* ── Modal Audio ── */}
      <Modal
        opened={audioOpen}
        onClose={() => {
          setAudioOpen(false)
          if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null) }
        }}
        title="Écouter" centered size="md"
        styles={{
          header: { background: '#f7f7f8', borderBottom: '1px solid #f0f0f0', padding: '16px 20px' },
          title:  { color: '#222', fontWeight: 600, fontSize: 15 },
          body:   { padding: '20px', background: '#f7f7f8' },
        }}
      >
        <MetricCards />
        {audioUrl ? (
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #ebebeb' }}>
            <audio controls autoPlay style={{ width: '100%', height: 36 }}
              onError={(e) => console.error('❌ Audio error:', e.currentTarget.error?.message)}>
              <source src={audioUrl} />
            </audio>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px', textAlign: 'center', border: '1px solid #ebebeb' }}>
            <Text size="sm" color="dimmed" align="center" py="md">Chargement de l'audio...</Text>
          </div>
        )}
      </Modal>

      {/* ── Modal Screen ── */}
      <Modal
        opened={screenOpen}
        onClose={() => { setScreenOpen(false); setScreenUrl(null); setScreenToken('') }}
        title="Screen" centered size="xl"
        styles={{
          header: { background: '#f7f7f8', borderBottom: '1px solid #f0f0f0', padding: '16px 20px' },
          title:  { color: '#222', fontWeight: 600, fontSize: 15 },
          body:   { padding: '20px', background: '#f7f7f8' },
        }}
      >
        <MetricCards />
        {screenUrl && screenToken ? (
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #ebebeb' }}>
            <FlvPlayer
              url={screenUrl}
              token={screenToken}
              recordId={selectedRecordId!}
              fileName={selectedRecord?.screenFileName ?? screenUrl}
            />
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px', textAlign: 'center', border: '1px solid #ebebeb' }}>
            <Text size="sm" color="dimmed" align="center" py="md">Chargement de la vidéo...</Text>
          </div>
        )}
      </Modal>

      {/* ── Toolbar partagée ── */}
      <Toolbar
        startDate={toDate(startDate)}
        endDate={toDate(endDate)}
        onStartDateChange={handleStartChange}
        onEndDateChange={handleEndChange}
        onRefresh={handleRefresh}
        extra={
          <Group spacing={6}>
            <Group spacing={4} align="center">
              <Text size="sm" weight={500}>Agents:</Text>
              <MultiSelect
                data={agentOptions}
                value={selectedAgentOid}
                onChange={(v) => dispatch(setSelectedAgentOid(v))}
                placeholder="Sélectionner un agent"
                clearable searchable size="xs" w={220}
              />
            </Group>

            <Tooltip label="Visionner l'enregistrement écran">
              <Button size="xs" variant="subtle" color="red"
                leftIcon={<IconDeviceTv size={14} />}
                disabled={!selectedRecordId} onClick={handleScreen}>
                Screen
              </Button>
            </Tooltip>

            <Tooltip label="Écouter l'enregistrement">
              <Button size="xs" variant="subtle" color="red"
                leftIcon={<IconHeadphones size={14} />}
                disabled={!selectedRecordId} onClick={handleListen}>
                Ecouter
              </Button>
            </Tooltip>

            <Tooltip label="Évaluer l'enregistrement sélectionné">
              <Button size="xs" variant="subtle" color="red"
                leftIcon={<IconClipboardCheck size={14} />}
                disabled={!selectedRecordId} loading={loadingEval}
                onClick={handleEvaluer}>
                Evaluer
              </Button>
            </Tooltip>
          </Group>
        }
      />

      {errorEval && (
        <Alert
          icon={<IconAlertCircle size={14} />}
          color="red" withCloseButton
          onClose={() => dispatch(clearMessages())}
          py={6} px="xs"
          style={{ borderRadius: 0, borderBottom: '1px solid #dee2e6', fontSize: 12 }}
        >
          {errorEval}
        </Alert>
      )}

    </Stack>
  )
}

export default EvaluationToolbar