import { useState } from 'react';
import { Group, Select, ActionIcon, Text, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconRefresh, IconPlus, IconMinus,
  IconDeviceFloppy, IconSquarePlus, IconSquareMinus,
} from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import {
  setStartDate, setEndDate, setSelectedFilterId,
  setSelectedViewConfigId, fetchRecordingsRequest,
  deleteFilterRequest, deleteViewConfigRequest,
} from '../Recordingslice';

interface Props {
  onOpenCreateFilter: () => void;
  onOpenSaveView:     () => void;  // ← nouvelle vue (modal)
  onOpenUpdateView:   () => void;  // ← NOUVEAU : sauvegarder vue existante
}

const toLocalDateString = (d: Date): string => {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateDDMMYYYY = (value: string): Date => {
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(value);
};

const RecordingsToolbar = ({ onOpenCreateFilter, onOpenSaveView, onOpenUpdateView }: Props) => {
  const dispatch = useDispatch();
  const {
    dateDebut, dateFin,
    filters, selectedFilterId,
    viewConfigs, selectedViewConfigId,
    pageSize, columnFilters,
  } = useSelector((s: RootState) => s.recordings);

  const filterOptions = filters.map((f) => ({ value: String(f.id), label: f.name }));
  const viewOptions   = viewConfigs.map((v) => ({ value: String(v.id), label: v.name }));

  const [localDateDebut, setLocalDateDebut] = useState<Date | null>(
    dateDebut ? new Date(dateDebut) : null
  );
  const [localDateFin, setLocalDateFin] = useState<Date | null>(
    dateFin ? new Date(dateFin) : null
  );

  const handleRefresh = () => {
    dispatch(fetchRecordingsRequest({
      dateDebut, dateFin, filterId: selectedFilterId,
      page: 1, pageSize, columnFilters,
    }));
  };

  const handleFilterChange = (v: string | null) => {
    dispatch(setSelectedFilterId(v ? parseInt(v) : null));
  };

  const handleDeleteFilter = () => {
    if (selectedFilterId) dispatch(deleteFilterRequest(selectedFilterId));
  };

  const handleDeleteView = () => {
    if (selectedViewConfigId) dispatch(deleteViewConfigRequest(selectedViewConfigId));
  };

  return (
    <Group spacing="xs" px="xs" py={6} style={{ borderBottom: '1px solid #dee2e6' }}>

      {/* Dates */}
      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Début:</Text>
        <DateInput
          value={localDateDebut}
          onChange={(d) => {
            setLocalDateDebut(d);
            if (d && !isNaN(d.getTime())) dispatch(setStartDate(toLocalDateString(d)));
            else if (d === null)           dispatch(setStartDate(''));
          }}
          dateParser={parseDateDDMMYYYY}
          valueFormat="DD/MM/YYYY"
          placeholder="JJ/MM/AAAA"
          size="xs" w={130}
        />
      </Group>

      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Fin:</Text>
        <DateInput
          value={localDateFin}
          onChange={(d) => {
            setLocalDateFin(d);
            if (d && !isNaN(d.getTime())) dispatch(setEndDate(toLocalDateString(d)));
            else if (d === null)           dispatch(setEndDate(''));
          }}
          dateParser={parseDateDDMMYYYY}
          valueFormat="DD/MM/YYYY"
          placeholder="JJ/MM/AAAA"
          size="xs" w={130}
        />
      </Group>

      <Tooltip label="Actualiser">
        <ActionIcon variant="transparent" color="blue" onClick={handleRefresh} size="sm">
          <IconRefresh size={16} />
        </ActionIcon>
      </Tooltip>

      {/* Filtre utilisateur */}
      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Filtre utilisateur:</Text>
        <Select
          data={filterOptions}
          value={selectedFilterId ? String(selectedFilterId) : null}
          onChange={handleFilterChange}
          placeholder="-- Aucun --"
          clearable size="xs" w={160}
        />
        <Tooltip label="Créer un filtre">
          <ActionIcon variant="transparent" color="green"
            onClick={onOpenCreateFilter} size="sm">
            <IconPlus size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Supprimer le filtre sélectionné">
          <ActionIcon variant="transparent" color="red"
            onClick={handleDeleteFilter} size="sm"
            disabled={!selectedFilterId}>
            <IconMinus size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <div style={{ flex: 1 }} />

      {/* Vue */}
      <Group spacing={4} align="center">
        <Text size="sm" weight={500}>Vue:</Text>
        <Select
          data={viewOptions}
          value={selectedViewConfigId ? String(selectedViewConfigId) : null}
          onChange={(v) => {
  const id = v ? parseInt(v, 10) : null;
  dispatch(setSelectedViewConfigId(isNaN(id as number) ? null : id));
}}
        />

        {/* 💾 Sauvegarder la vue EXISTANTE sélectionnée */}
        <Tooltip label="Sauvegarder la vue courante">
          <ActionIcon
    variant="transparent"
    color="blue"
    onClick={onOpenUpdateView}
    size="sm"
    // ← plus de disabled ici
  >
    <IconDeviceFloppy size={14} />
  </ActionIcon>
  
        </Tooltip>

        {/* ➕ Créer une NOUVELLE vue */}
        <Tooltip label="Nouvelle vue">
          <ActionIcon variant="transparent" color="green"
            onClick={onOpenSaveView}                      // ← ouvre modal
            size="sm">
            <IconSquarePlus size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Supprimer la vue sélectionnée">
          <ActionIcon variant="transparent" color="red"
            onClick={handleDeleteView} size="sm"
            disabled={!selectedViewConfigId}>
            <IconSquareMinus size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

    </Group>
  );
};

export default RecordingsToolbar;