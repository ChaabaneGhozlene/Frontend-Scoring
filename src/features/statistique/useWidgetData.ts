import { useCallback, useEffect, useRef, useState } from 'react'
import type { SectionStatRow, WidgetInstance } from './Statistiquetypes'
import {
  fetchSectionStatsApi,
  fetchAgentScoresApi,
  fetchProgramLevelApi,
  fetchCoachingSheetApi,
  fetchCoachingAnalysisApi,
  fetchCoachingSummaryApi,
} from './Statistiqueservice'

// ─── Fix date anti-UTC bug ────────────────────────────────────────────────────
function fixFiltersDates(filters: WidgetInstance['filters']) {
  const fix = (d: unknown): string => {
    if (!d) return ''
    if (typeof d === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
      return d.split('T')[0]
    }
    if (d instanceof Date) {
      return (
        d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
      )
    }
    return String(d)
  }

  return {
    ...filters,
    dateFrom: fix(filters.dateFrom),
    dateTo:   fix(filters.dateTo),
  }
}

// ─── Return type ──────────────────────────────────────────────────────────────
export interface UseWidgetDataResult {
  data:        Record<string, unknown>[]  // pour chart + table générique
  sectionRows: SectionStatRow[]           // pour SectionStatsTable uniquement
  loading:     boolean
  refresh:     () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWidgetData(widget: WidgetInstance): UseWidgetDataResult {
  const [data,         setData]         = useState<Record<string, unknown>[]>([])
  const [sectionRows,  setSectionRows]  = useState<SectionStatRow[]>([])
  const [loading,      setLoading]      = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  const widgetRef = useRef(widget)
  widgetRef.current = widget

  // ← Clé stable qui change quand n'importe quel filtre "actif" change
  const filterKey = [
    widget.filters.dateFrom,
    widget.filters.dateTo,
    widget.filters.allSupervisors,
    widget.filters.supervisorId  ?? 'none',
    widget.filters.agentId       ?? 'none',
    widget.filters.sortDirection ?? 'Descending',
    widget.widgetType,
  ].join('|')

  const fetchData = useCallback(async () => {
    const w       = widgetRef.current
    const filters = fixFiltersDates(w.filters)

    const agentId       = filters.agentId       ?? 0
    const sortDirection = filters.sortDirection ?? 'Descending'

    setLoading(true)

    try {
      switch (w.widgetType) {
        case 'section-stats': {
          const rows = await fetchSectionStatsApi(filters)
          setSectionRows(rows as unknown as SectionStatRow[])
          setData(rows as unknown as Record<string, unknown>[])
          break
        }
        case 'agent-scores': {
          const rows = await fetchAgentScoresApi(filters, sortDirection)
          setData(rows as unknown as Record<string, unknown>[])
          setSectionRows([])
          break
        }
        case 'program-level': {
          const rows = await fetchProgramLevelApi(filters)
          setData(rows as unknown as Record<string, unknown>[])
          setSectionRows([])
          break
        }
        case 'coaching-sheet': {
          const rows = await fetchCoachingSheetApi(filters, agentId)
          setData(rows as unknown as Record<string, unknown>[])
          setSectionRows([])
          break
        }
        case 'coaching-analysis': {
          const rows = await fetchCoachingAnalysisApi(filters, agentId)
          setData(rows as unknown as Record<string, unknown>[])
          setSectionRows([])
          break
        }
        case 'coaching-summary': {
          const rows = await fetchCoachingSummaryApi(filters, agentId)
          setData(rows as unknown as Record<string, unknown>[])
          setSectionRows([])
          break
        }
        default:
          setData([])
          setSectionRows([])
      }
    } catch (e) {
      console.error('useWidgetData error:', e)
      setData([])
      setSectionRows([])
    } finally {
      setLoading(false)
    }
  }, [filterKey, refreshToken]) // ← filterKey + refreshToken

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(() => setRefreshToken(t => t + 1), [])

  return { data, sectionRows, loading, refresh }
}