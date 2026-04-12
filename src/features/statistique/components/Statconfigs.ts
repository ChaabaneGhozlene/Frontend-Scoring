import type { ColumnConfig, ReportType } from "../Statistiquetypes";

export interface StatConfig {
  title: string;
  needsAgentFilter: boolean;
  hasSupervisorFilter: boolean;
  hasSortFilter: boolean;
  hasChart: boolean;
  chartXKey: string;
  chartYKey: string;
  columns: ColumnConfig[];
}

const fmtScore = (v: number) => v != null ? `${v.toFixed(2)}%` : '-';
const fmtDate  = (v: string) => v ? new Date(v).toLocaleDateString('fr-FR') : '-';

export const STAT_CONFIGS: Record<ReportType, StatConfig> = {

  'section-stats': {
    title:              'Section Statistics',
    needsAgentFilter:   false,
    hasSupervisorFilter:false,
    hasSortFilter:      false,
    hasChart:           true,
    chartXKey:          'section',
    chartYKey:          'scoreGroup',
    columns: [
      { key: 'sectionId', header: 'Section ID' },
      { key: 'section',   header: 'Section' },
      { key: 'agent',     header: 'Agent' },
      { key: 'agentId',   header: 'Agent ID' },
      { key: 'campaign',  header: 'Campaign' },
      { key: 'scoreGroup',header: 'Score (%)', format: fmtScore },
    ],
  },

  'agent-scores': {
    title:              'Agent Scoring Statistics',
    needsAgentFilter:   false,
    hasSupervisorFilter:false,
    hasSortFilter:      true,
    hasChart:           true,
    chartXKey:          'agent',
    chartYKey:          'score',
    columns: [
      { key: 'agent', header: 'Agent' },
      { key: 'score', header: 'Score (%)', format: fmtScore },
    ],
  },

  'program-level': {
    title:              'Program Level Report',
    needsAgentFilter:   false,
    hasSupervisorFilter:true,
    hasSortFilter:      false,
    hasChart:           true,
    chartXKey:          'agent',
    chartYKey:          'score',
    columns: [
      { key: 'agent',      header: 'Agent' },
      { key: 'createDate', header: 'Date',     format: fmtDate },
      { key: 'score',      header: 'Score (%)', format: fmtScore },
    ],
  },

  'coaching-sheet': {
    title:              'Coaching Sheet',
    needsAgentFilter:   true,
    hasSupervisorFilter:true,
    hasSortFilter:      false,
    hasChart:           false,
    chartXKey:          '',
    chartYKey:          '',
    columns: [
      { key: 'callIndex',       header: 'Call Index' },
      { key: 'evaluationScore', header: 'Evaluation Score', format: fmtScore },
      { key: 'question',        header: 'Question' },
      { key: 'itemScore',       header: 'Item Score',       format: fmtScore },
      { key: 'comment',         header: 'Comment' },
    ],
  },

  'coaching-analysis': {
    title:              'Coaching Sheet — Analysis',
    needsAgentFilter:   true,
    hasSupervisorFilter:true,
    hasSortFilter:      false,
    hasChart:           false,
    chartXKey:          '',
    chartYKey:          '',
    columns: [
      { key: 'sectionId',      header: 'Section ID' },
      { key: 'section',        header: 'Section' },
      { key: 'errorType',      header: 'Error Type' },
      { key: 'occurrence',     header: 'Occurrence' },
      { key: 'positiveAnswers',header: 'Positive Answers' },
      { key: 'loseRate',       header: 'Lose Rate (%)', format: fmtScore },
    ],
  },

  'coaching-summary': {
    title:              'Coaching Sheet Summary',
    needsAgentFilter:   true,
    hasSupervisorFilter:true,
    hasSortFilter:      false,
    hasChart:           false,
    chartXKey:          '',
    chartYKey:          '',
    columns: [
      { key: 'callIndex', header: 'Call Index' },
      { key: 'score',     header: 'Score (%)', format: fmtScore },
      { key: 'comment',   header: 'Comment' },
    ],
  },
};