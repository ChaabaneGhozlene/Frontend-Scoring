import type { ReportType, ColumnConfig } from './Statistiquetypes';

export interface WidgetDefinition {
  type:                ReportType;
  label:               string;
  description:         string;
  icon:                string;
  needsAgentFilter:    boolean;
  hasSupervisorFilter: boolean;
  hasSortFilter:       boolean;
    hasCustomTable?:     boolean;   

  hasChart:            boolean;
  chartXKey:           string;
  chartYKey:           string;
  columns:             ColumnConfig[];
  
}

const fmtScore = (v: number) => v != null ? `${v.toFixed(2)}%` : '-';
const fmtDate  = (v: string) => v ? new Date(v).toLocaleDateString('fr-FR') : '-';

export const WIDGET_REGISTRY: Record<ReportType, WidgetDefinition> = {
 'section-stats': {
    type:                'section-stats',
    label:               'Section Statistics',
    description:         'Score moyen par section et agent',
    icon:                '📊',
    needsAgentFilter:    false,
    hasSupervisorFilter: false,
    hasSortFilter:       false,
    hasChart:            true,
      hasCustomTable:      true,   // ← ajouter

    chartXKey:           'section',
    chartYKey:           'scoreGroup',
    
    columns: [
      { key: 'agent',      header: 'Agent'      },
      { key: 'agentId',    header: 'Agent ID'   },
      { key: 'section',    header: 'Section'    },
      { key: 'campaign',   header: 'Campaign'   },
      { key: 'scoreGroup', header: 'Score (%)', format: fmtScore },
    ],
  },
  'agent-scores': {
    type:                'agent-scores',
    label:               'Agent Scores',
    description:         'Classement des agents',
    icon:                '🏆',
    needsAgentFilter:    false,
    hasSupervisorFilter: true,
    hasSortFilter:       true,
    hasChart:            true,
    chartXKey:           'agent',
    chartYKey:           'score',
    columns: [
      { key: 'agent', header: 'Agent'      },
      { key: 'score', header: 'Score (%)', format: fmtScore },
    ],
  },
  'program-level': {
    type:                'program-level',
    label:               'Program Level',
    description:         'Évolution par programme',
    icon:                '📈',
    needsAgentFilter:    false,
    hasSupervisorFilter: true,
    hasSortFilter:       false,
    hasChart:            true,
    chartXKey:           'agent',
    chartYKey:           'score',
    columns: [
      { key: 'agent',      header: 'Agent'      },
      { key: 'score',      header: 'Score (%)',  format: fmtScore },
    ],
  },
  'coaching-sheet': {
    type:                'coaching-sheet',
    label:               'Coaching Sheet',
    description:         'Fiche de coaching par agent',
    icon:                '📋',
    needsAgentFilter:    true,
    hasSupervisorFilter: true,
    hasSortFilter:       false,
    hasChart:            false,
    chartXKey:           '',
    chartYKey:           '',
    columns: [
      { key: 'callIndex',       header: 'Call'            },
      { key: 'evaluationScore', header: 'Score',    format: fmtScore },
      { key: 'question',        header: 'Question'        },
      { key: 'itemScore',       header: 'Item',    format: fmtScore },
      { key: 'comment',         header: 'Commentaire'     },
    ],
  },
  'coaching-analysis': {
    type:                'coaching-analysis',
    label:               'Coaching Analysis',
    description:         "Taux d'erreur par section",
    icon:                '🔍',
    needsAgentFilter:    true,
    hasSupervisorFilter: true,
    hasSortFilter:       false,
    hasChart:            false,
    chartXKey:           '',
    chartYKey:           '',
    columns: [
      { key: 'section',         header: 'Section'         },
      { key: 'errorType',       header: 'Type erreur'     },
      { key: 'occurrence',      header: 'Occurrences'     },
      { key: 'loseRate',        header: 'Taux (%)', format: fmtScore },
    ],
  },
  'coaching-summary': {
    type:                'coaching-summary',
    label:               'Coaching Summary',
    description:         'Résumé des évaluations',
    icon:                '📝',
    needsAgentFilter:    true,
    hasSupervisorFilter: true,
    hasSortFilter:       false,
    hasChart:            false,
    chartXKey:           '',
    chartYKey:           '',
    columns: [
      { key: 'callIndex', header: 'Call'           },
      { key: 'score',     header: 'Score', format: fmtScore },
      { key: 'comment',   header: 'Commentaire'    },
    ],
  },
};