import { useState, useCallback } from 'react';
import {
  Modal, TextInput, Button, Group, Stack, Select,
  ActionIcon, Box, Divider, Badge,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { createFilterRequest, fetchRecordingsRequest } from '../Recordingslice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Condition {
  id:        number;
  logic:     'And' | 'Or';   // opérateur avant cette condition
  field:     string;
  operator:  string;
  value:     string;
}

interface Props {
  opened:  boolean;
  onClose: () => void;
}

// ─── Options ──────────────────────────────────────────────────────────────────

// Type supprimé de l'interface — toujours 1 (filtre personnel de l'utilisateur)
// Groupe = 1 = filtres enregistrements (vs groupe 2 = autres modules)

const FIELD_OPTIONS = [
  { value: 'nomAgent',            label: 'Nom Agent'         },
  { value: 'prenomAgent',         label: 'Prénom Agent'      },
  { value: 'agentOid',            label: 'Agent OID'         },
  { value: 'campaignDescription', label: 'Campagne'          },
  { value: 'callTypeDescription', label: 'Action'            },
  { value: 'numeroTel',           label: 'Numéro'            },
  { value: 'statusRequal',        label: 'Statut Requalif'   },
];

const OPERATOR_OPTIONS = [
  { value: 'contains',    label: 'contient'          },
  { value: 'equals',      label: 'est égal à'        },
  { value: 'startsWith',  label: 'commence par'      },
  { value: 'endsWith',    label: 'se termine par'    },
  { value: 'notContains', label: 'ne contient pas'   },
];

let nextId = 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Construit la chaîne d'expression lisible (ex: "nomAgent contains Dupont And campagne equals OUTBOUND") */
const buildExpression = (conditions: Condition[]): string =>
  conditions
    .map((c, i) =>
      (i === 0 ? '' : `${c.logic} `) +
      `${c.field} ${c.operator} ${c.value}`
    )
    .join(' ');

/** Construit la clause SQL WHERE correspondante */
const buildSqlWhere = (conditions: Condition[]): string => {
  if (!conditions.length) return '';

  const parts = conditions.map((c, i) => {
    const col = fieldToColumn(c.field);
    const val = c.value.replace(/'/g, "''");
    let clause = '';

    switch (c.operator) {
      case 'contains':    clause = `${col} LIKE '%${val}%'`;        break;
      case 'equals':      clause = `${col} = '${val}'`;             break;
      case 'startsWith':  clause = `${col} LIKE '${val}%'`;         break;
      case 'endsWith':    clause = `${col} LIKE '%${val}'`;         break;
      case 'notContains': clause = `${col} NOT LIKE '%${val}%'`;    break;
      default:            clause = `${col} LIKE '%${val}%'`;
    }

    return i === 0 ? clause : `${c.logic.toUpperCase()} ${clause}`;
  });

  return parts.join(' ');
};

const fieldToColumn = (field: string): string => ({
  nomAgent:            'NomAgent',
  prenomAgent:         'PrenomAgent',
  agentOid:            'AgentOid',
  campaignDescription: 'CampaignDescription',
  callTypeDescription: 'CallTypeDescription',
  numeroTel:           'NumeroTel',
  statusRequal:        'StatusRequal',
} as Record<string, string>)[field] ?? field;

// ─── Component ────────────────────────────────────────────────────────────────

const CreateFilterModal = ({ opened, onClose }: Props) => {
  const dispatch = useDispatch();
  const { dateDebut, dateFin, selectedFilterId, pageSize} =
    useSelector((s: RootState) => s.recordings);

  const [name,       setName]       = useState('');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: nextId++, logic: 'And', field: 'nomAgent', operator: 'contains', value: '' },
  ]);

  // ── Ajouter une condition ──────────────────────────────────────────────────
  const addCondition = useCallback(() => {
    setConditions((prev) => [
      ...prev,
      { id: nextId++, logic: 'And', field: 'nomAgent', operator: 'contains', value: '' },
    ]);
  }, []);

  // ── Supprimer une condition ────────────────────────────────────────────────
  const removeCondition = useCallback((id: number) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Modifier une condition ─────────────────────────────────────────────────
  const updateCondition = useCallback(
    (id: number, key: keyof Condition, value: string) => {
      setConditions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
      );
    },
    []
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setName('');
    setConditions([
      { id: nextId++, logic: 'And', field: 'nomAgent', operator: 'contains', value: '' },
    ]);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // ── Enregistrer ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    const filled = conditions.filter((c) => c.value.trim() !== '');
    dispatch(
      createFilterRequest({
        name:       name.trim(),
        expression: buildExpression(filled),
        sqlWhere:   buildSqlWhere(filled),
        type:       1,   // toujours 1 = filtre personnel
      })
    );
    handleClose();
  }, [name, conditions, dispatch, handleClose]);

  // ── Appliquer (enregistre + déclenche le fetch immédiatement) ─────────────
  const handleApply = useCallback(() => {
    if (!name.trim()) return;
    const filled = conditions.filter((c) => c.value.trim() !== '');
    dispatch(
      createFilterRequest({
        name:       name.trim(),
        expression: buildExpression(filled),
        sqlWhere:   buildSqlWhere(filled),
        type:       1,   // toujours 1 = filtre personnel
      })
    );
    const nextColumnFilters = filled.map((c) => ({ id: c.field, value: c.value }));
    dispatch(
      fetchRecordingsRequest({
        dateDebut,
        dateFin,
        filterId:      selectedFilterId,
        page:          1,
        pageSize,
        columnFilters: nextColumnFilters,
      })
    );
    handleClose();
  }, [name, conditions, dispatch, handleClose,
      dateDebut, dateFin, selectedFilterId, pageSize]);

  const isValid = name.trim() !== '' &&
    conditions.every((c) => c.value.trim() !== '');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Filtre"
      size="lg"
      centered
    >
      <Stack spacing="sm">

        {/* Nom */}
        <Group spacing="sm" align="flex-end">
          <TextInput
            label="Nom :"
            placeholder="Nom du filtre"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            style={{ flex: 1 }}
            size="xs"
          />
        </Group>

        <Divider label="Expression :" labelPosition="left" />

        {/* Conditions */}
        <Stack spacing="xs">
          {conditions.map((cond, idx) => (
            <Box key={cond.id}>
              {/* Opérateur logique (And / Or) — sauf pour la 1ère condition */}
              {idx > 0 && (
                <Group spacing={4} mb={4}>
                  <Select
                    data={[
                      { value: 'And', label: 'And' },
                      { value: 'Or',  label: 'Or'  },
                    ]}
                    value={cond.logic}
                    onChange={(v) => updateCondition(cond.id, 'logic', v ?? 'And')}
                    size="xs"
                    w={80}
                  />
                  <ActionIcon
                    size="xs"
                    color="blue"
                    variant="transparent"
                    onClick={addCondition}
                    title="Ajouter une condition"
                  >
                    <IconPlus size={12} />
                  </ActionIcon>
                </Group>
              )}

              {/* Ligne de condition */}
              <Group spacing={6} align="flex-end" noWrap>
                {/* Champ */}
                <Select
                  data={FIELD_OPTIONS}
                  value={cond.field}
                  onChange={(v) => updateCondition(cond.id, 'field', v ?? 'nomAgent')}
                  size="xs"
                  style={{ flex: 1 }}
                />
                {/* Opérateur */}
                <Select
                  data={OPERATOR_OPTIONS}
                  value={cond.operator}
                  onChange={(v) => updateCondition(cond.id, 'operator', v ?? 'contains')}
                  size="xs"
                  w={140}
                />
                {/* Valeur */}
                <TextInput
                  placeholder="Valeur…"
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.currentTarget.value)}
                  size="xs"
                  style={{ flex: 1 }}
                />
                {/* Supprimer (sauf si unique) */}
                {conditions.length > 1 && (
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="transparent"
                    onClick={() => removeCondition(cond.id)}
                  >
                    <IconTrash size={12} />
                  </ActionIcon>
                )}
              </Group>
            </Box>
          ))}

          {/* Bouton "And +" pour la première condition */}
          {conditions.length === 1 && (
            <Group spacing={4}>
              <Badge
                size="xs"
                color="blue"
                variant="outline"
                style={{ cursor: 'pointer' }}
                onClick={addCondition}
              >
                And
              </Badge>
              <ActionIcon size="xs" color="blue" variant="transparent" onClick={addCondition}>
                <IconPlus size={12} />
              </ActionIcon>
            </Group>
          )}
        </Stack>

        <Divider />

        {/* Boutons — identiques à l'ancien système */}
        <Group position="center" spacing="xs" mt="xs">
          <Button
            size="xs"
            onClick={handleSave}
            disabled={!isValid}
          >
            Enregistrer
          </Button>
          <Button
            size="xs"
            variant="filled"
            color="blue"
            onClick={handleApply}
            disabled={!isValid}
          >
            Appliquer
          </Button>
          <Button
            size="xs"
            variant="default"
            onClick={handleClose}
          >
            Quitter
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
};

export default CreateFilterModal;