import React, { useMemo, useState } from 'react'
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'mantine-react-table'
import { getSharedTableProps } from '../../Tableconfig'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  questionId: number
  questionOrder: number
  description: string
  groupId: number
}

interface SectionStatRow {
  sectionId: number
  sectionOrder: number
  section: string
  agent: string
  agentId: number
  campaign: string
  scoreGroup: number
  reference: number
  questions: Question[]
}

interface Props {
  data: SectionStatRow[]
  loading?: boolean
}

interface FlatRow {
  rowKey: string
  rowType: 'question' | 'subtotal'
  agent: string
  agentId: number
  sectionId: number
  sectionOrder: number
  section: string
  questionId: number
  description: string
  reference: number
  scoreGroup: number
  pct: number
  subtotalLabel: string
  campaign: string
}

interface PageSpan {
  agentSpan: number
  sectionSpan: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPct = (v: number) => `${v.toFixed(2).replace('.', ',')}%`

const ScoreBadge = ({ value }: { value: number }) => (
  <span style={{ fontWeight: 600, color: value >= 90 ? '#1D9E75' : '#D85A30' }}>
    {fmtPct(value)}
  </span>
)

const subFont: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 12,
  color: '#374151',
}

// ─── Build flat rows ───────────────────────────────────────────────────────────
function buildFlatRows(data: SectionStatRow[]): FlatRow[] {
  const agentMap = new Map<string, SectionStatRow[]>()
  for (const row of data) {
    if (!agentMap.has(row.agent)) agentMap.set(row.agent, [])
    agentMap.get(row.agent)!.push(row)
  }

  const result: FlatRow[] = []
  for (const [agent, sections] of agentMap) {
    const sorted = [...sections].sort((a, b) => a.sectionOrder - b.sectionOrder)
    for (const sec of sorted) {
      const pct = sec.reference === 0 ? 0 : (sec.scoreGroup / sec.reference) 
      for (const q of sec.questions) {
        result.push({
          rowKey:        `${agent}-${sec.sectionId}-${q.questionId}`,
          rowType:       'question',
          agent,
          agentId:       sec.agentId,
          sectionId:     sec.sectionId,
          sectionOrder:  sec.sectionOrder,
          section:       sec.section,
          questionId:    q.questionId,
          description:   q.description,
          reference:     sec.reference,
          scoreGroup:    sec.scoreGroup,
          pct,
          subtotalLabel: '',
          campaign:      sec.campaign,
        })
      }
      result.push({
        rowKey:        `${agent}-${sec.sectionId}-subtotal`,
        rowType:       'subtotal',
        agent,
        agentId:       sec.agentId,
        sectionId:     sec.sectionId,
        sectionOrder:  sec.sectionOrder,
        section:       sec.section,
        questionId:    -1,
        description:   '',
        reference:     sec.reference,
        scoreGroup:    sec.scoreGroup,
        pct,
        subtotalLabel: `${sec.section} Total`,
        campaign:      sec.campaign,
      })
    }
  }
  return result
}

// ─── Calcul des spans sur la page courante ────────────────────────────────────
function computePageSpans(pageRows: FlatRow[]): Map<string, PageSpan> {
  const map = new Map<string, PageSpan>()
  for (let i = 0; i < pageRows.length; i++) {
    const row  = pageRows[i]
    const prev = pageRows[i - 1]
    const isNewAgent   = !prev || prev.agent !== row.agent
    const isNewSection = !prev || prev.agent !== row.agent || prev.sectionId !== row.sectionId

    let agentSpan = 0
    let sectionSpan = 0

    if (isNewAgent) {
      for (
        let j = i;
        j < pageRows.length && pageRows[j].agent === row.agent;
        j++
      ) agentSpan++
    }

    if (isNewSection) {
      for (
        let j = i;
        j < pageRows.length &&
        pageRows[j].agent === row.agent &&
        pageRows[j].sectionId === row.sectionId;
        j++
      ) sectionSpan++
    }

    map.set(row.rowKey, { agentSpan, sectionSpan })
  }
  return map
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SectionStatsTable({ data, loading }: Props) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize:  25,
  })

  const allRows = useMemo(() => buildFlatRows(data), [data])

  // Slice de la page courante — calculé AVANT le render des colonnes
  const pageRows = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return allRows.slice(start, start + pagination.pageSize)
  }, [allRows, pagination])

  // Spans calculés sur la page courante uniquement
  const spans = useMemo(() => computePageSpans(pageRows), [pageRows])

  const grandRef   = useMemo(() => data.reduce((s, r) => s + r.reference,  0), [data])
  const grandScore = useMemo(() => data.reduce((s, r) => s + r.scoreGroup, 0), [data])
  const grandPct   = grandRef === 0 ? 0 : grandScore / grandRef

  const columns = useMemo<MRT_ColumnDef<FlatRow>[]>(() => [
    {
      accessorKey: 'agent',
      header:      'Agent',
      size:        170,
      mantineTableBodyCellProps: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return {}
        const s = spans.get(r.rowKey)
        if (!s || s.agentSpan === 0) return { style: { display: 'none' } }
        return {
          rowSpan: s.agentSpan,
          style:   { verticalAlign: 'top', paddingTop: 10 },
        }
      },
      Cell: ({ row }) => {
        const r = row.original
        // Ligne subtotal : affiche le label dans cette première colonne
        if (r.rowType === 'subtotal') {
          return <span style={subFont}>{r.subtotalLabel}</span>
        }
        const s = spans.get(r.rowKey)
        if (!s || s.agentSpan === 0) return null
        return <strong>{r.agent}</strong>
      },
      Footer: () => <strong style={{ color: '#312e81' }}>Grand Total</strong>,
    },
    {
      accessorKey: 'agentId',
      header:      'AgentId',
      size:        100,
      mantineTableBodyCellProps: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return {}
        const s = spans.get(r.rowKey)
        if (!s || s.agentSpan === 0) return { style: { display: 'none' } }
        return {
          rowSpan: s.agentSpan,
          style:   { verticalAlign: 'top', paddingTop: 10, color: '#6b7280' },
        }
      },
      Cell: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return null
        const s = spans.get(r.rowKey)
        if (!s || s.agentSpan === 0) return null
        return <>{r.agentId}</>
      },
      Footer: () => null,
    },
    {
      accessorKey: 'sectionOrder',
      header:      'Section Order',
      size:        110,
      mantineTableBodyCellProps: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return {}
        const s = spans.get(r.rowKey)
        if (!s || s.sectionSpan === 0) return { style: { display: 'none' } }
        return {
          rowSpan: s.sectionSpan,
          style:   { verticalAlign: 'top', paddingTop: 10, color: '#6b7280' },
        }
      },
      Cell: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return null
        const s = spans.get(r.rowKey)
        if (!s || s.sectionSpan === 0) return null
        return <>{r.sectionOrder}</>
      },
      Footer: () => null,
    },
    {
      accessorKey: 'section',
      header:      'Section',
      size:        180,
      mantineTableBodyCellProps: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return {}
        const s = spans.get(r.rowKey)
        if (!s || s.sectionSpan === 0) return { style: { display: 'none' } }
        return {
          rowSpan: s.sectionSpan,
          style:   { verticalAlign: 'top', paddingTop: 10 },
        }
      },
      Cell: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') return null
        const s = spans.get(r.rowKey)
        if (!s || s.sectionSpan === 0) return null
        return <>{r.section}</>
      },
      Footer: () => null,
    },
    {
      accessorKey: 'description',
      header:      'Question',
      size:        220,
      mantineTableBodyCellProps: ({ row }) => {
        if (row.original.rowType === 'subtotal') return {}
        return {}
      },
      Cell: ({ row }) => {
        if (row.original.rowType === 'subtotal') return null
        return <>{row.original.description}</>
      },
      Footer: () => null,
    },
    {
      accessorKey: 'reference',
      header:      'Référence',
      size:        110,
      mantineTableHeadCellProps: { align: 'center' },
      mantineTableBodyCellProps: { align: 'center' },
      Cell: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') {
          return <span style={subFont}>{r.reference}</span>
        }
        return <>{r.reference}</>
      },
      Footer: () => (
        <strong style={{ color: '#312e81' }}>{grandRef.toLocaleString()}</strong>
      ),
    },
    {
      accessorKey: 'scoreGroup',
      header:      'Résumer par section',
      size:        160,
      mantineTableHeadCellProps: { align: 'center' },
      mantineTableBodyCellProps: { align: 'center' },
      Cell: ({ row }) => {
        const r = row.original
        if (r.rowType === 'subtotal') {
          return <span style={subFont}>{r.scoreGroup}</span>
        }
        return <>{r.scoreGroup}</>
      },
      Footer: () => (
        <strong style={{ color: '#312e81' }}>{grandScore.toLocaleString()}</strong>
      ),
    },
    {
      accessorKey: 'pct',
      header:      '%',
      size:        90,
      mantineTableHeadCellProps: { align: 'center' },
      mantineTableBodyCellProps: { align: 'center' },
      Cell: ({ row }) => <ScoreBadge value={row.original.pct} />,
      Footer: () => <ScoreBadge value={grandPct} />,
    },
  ], [spans, grandRef, grandScore, grandPct])

  const table = useMantineReactTable({
    columns,
    data:     allRows,
    getRowId: (row) => row.rowKey,
    state: {
      isLoading: loading ?? false,
      pagination,
    },
    onPaginationChange: setPagination,

    // Checkbox uniquement sur les lignes question, pas subtotal
    // Cela évite le décalage de colonnes sur les lignes subtotal
    enableRowSelection: (row) => row.original.rowType === 'question',

    enableGrouping:       false,
    enableSorting:        false,
    enableColumnFilters:  false,
    enableGlobalFilter:   false,
    enableColumnDragging: false,
    enableColumnOrdering: false,

    ...getSharedTableProps<FlatRow>(
      data.reduce((s, r) => s + r.questions.length, 0),
      { filename: 'section-stats', records: allRows }
    ),

    manualPagination: false,
    manualFiltering:  false,

    // Style de la ligne entière pour les subtotals
    mantineTableBodyRowProps: ({ row }) => {
      if (row.original.rowType !== 'subtotal') return {}
      return {
        style: {
          background:   '#f9fafb',
          borderTop:    '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
        },
      }
    },

    mantineTableFooterProps: {
      style: {
        background: '#eef2ff',
        borderTop:  '2px solid #c7d2fe',
        color:      '#312e81',
        fontWeight: 700,
      },
    },
  })

  return <MantineReactTable table={table} />
}