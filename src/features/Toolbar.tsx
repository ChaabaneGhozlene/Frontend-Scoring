import { useState, useEffect } from 'react'
import { Group, Select, ActionIcon, Text, Tooltip } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import {
  IconRefresh, 
  IconDeviceFloppy, IconSquarePlus, IconSquareMinus,
} from '@tabler/icons-react'

export interface SelectOption {
  value: string
  label: string
}

export interface ViewConfig {
  options:            SelectOption[]
  selectedId:         number | null
  onSelect:           (id: number | null) => void
  onSave:             () => void
  onNew:              () => void
  onDelete:           () => void
}

interface Props {
  startDate:         Date | null
  endDate:           Date | null
  onStartDateChange: (d: Date | null) => void
  onEndDateChange:   (d: Date | null) => void
  onRefresh:         () => void
  viewConfig?:       ViewConfig
  extra?:            React.ReactNode
}

const parseDateDDMMYYYY = (value: string): Date => {
  const parts = value.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  return new Date(value)
}

const Toolbar = ({
  startDate, endDate,
  onStartDateChange, onEndDateChange,
  onRefresh,
  viewConfig,
  extra,
}: Props) => {
  const [localStart, setLocalStart] = useState<Date | null>(startDate)
  const [localEnd,   setLocalEnd]   = useState<Date | null>(endDate)

  // ← CORRECTION : synchroniser l'état local quand les props changent
  // (ex: sélection/suppression d'une vue qui modifie les dates Redux)
  useEffect(() => {
    setLocalStart(startDate)
  }, [startDate])

  useEffect(() => {
    setLocalEnd(endDate)
  }, [endDate])

  const handleStartChange = (d: Date | null) => {
    setLocalStart(d)
    onStartDateChange(d)
  }

  const handleEndChange = (d: Date | null) => {
    setLocalEnd(d)
    onEndDateChange(d)
  }

  return (
    <Group spacing="xs" px="xs" py={6} style={{ borderBottom: '1px solid #dee2e6' }}>

      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Début:</Text>
        <DateInput
          value={localStart}
          onChange={handleStartChange}
          dateParser={parseDateDDMMYYYY}
          valueFormat="DD/MM/YYYY"
          placeholder="JJ/MM/AAAA"
          size="xs" w={130}
        />
      </Group>

      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Fin:</Text>
        <DateInput
          value={localEnd}
          onChange={handleEndChange}
          dateParser={parseDateDDMMYYYY}
          valueFormat="DD/MM/YYYY"
          placeholder="JJ/MM/AAAA"
          size="xs" w={130}
        />
      </Group>

      <Tooltip label="Actualiser">
        <ActionIcon variant="transparent" color="blue" onClick={onRefresh} size="sm">
          <IconRefresh size={16} />
        </ActionIcon>
      </Tooltip>

      {extra && <>{extra}</>}

      <div style={{ flex: 1 }} />

      {viewConfig && (
        <Group spacing={4} align="center">
          <Text size="sm" weight={500}>Vue:</Text>
          <Select
            data={viewConfig.options}
            value={viewConfig.selectedId ? String(viewConfig.selectedId) : null}
            onChange={(v) => {
              const id = v ? parseInt(v, 10) : null
              viewConfig.onSelect(isNaN(id as number) ? null : id)
            }}
            placeholder="-- Aucune --"
            clearable size="xs" w={160}
          />
          <Tooltip label="Sauvegarder la vue courante">
            <ActionIcon variant="transparent" color="blue"
              onClick={viewConfig.onSave} size="sm">
              <IconDeviceFloppy size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Nouvelle vue">
            <ActionIcon variant="transparent" color="green"
              onClick={viewConfig.onNew} size="sm">
              <IconSquarePlus size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Supprimer la vue sélectionnée">
            <ActionIcon variant="transparent" color="red"
              onClick={viewConfig.onDelete} size="sm"
              disabled={!viewConfig.selectedId}>
              <IconSquareMinus size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}

    </Group>
  )
}

export default Toolbar