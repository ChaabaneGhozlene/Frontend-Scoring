import { useEffect, useMemo, useState } from 'react'
import {
  fetchStatistics,
  fetchStatisticsFilters,
  exportStatisticsCsv,
} from './statisticsApi'
import type {
  StatisticsFilters,
  StatisticsFilterOptions,
  StatisticsResponse,
} from './statisticsTypes'
import {
  fieldInput,
  btnPrimaryRed,
  btnLight,
  pageWrap,
  mainCard,
  sectionHeader,
  sectionTitle,
  filtersWrap,
  summaryWrap,
  summaryCard,
  summaryLabel,
  summaryValue,
  tableWrap,
  tableStyle,
  thStyle,
  tdStyle,
  errorStyle,
  loadingStyle,
} from '../Style/ComponentsStyles'

const initialFilters: StatisticsFilters = {
  from: '2022-10-01',
  to: '2022-10-31',
  teamId: null,
  campaign: '',
  agentOid: '',
  summaryType: 'avg',
  groupBy: 'campaign',
}

const emptyOptions: StatisticsFilterOptions = {
  teams: [],
  campaigns: [],
  agents: [],
}

export default function StatisticsPage() {
  const [filters, setFilters] = useState<StatisticsFilters>(initialFilters)
  const [options, setOptions] = useState<StatisticsFilterOptions>(emptyOptions)
  const [data, setData] = useState<StatisticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadFilters = async () => {
    try {
      const res = await fetchStatisticsFilters()
      setOptions(res)
    } catch (err) {
      console.error(err)
      setError('Erreur lors du chargement des filtres')
    }
  }

  const loadStatistics = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchStatistics(filters)
      setData(res)
    } catch (err) {
      console.error(err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportStatisticsCsv(filters)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de l'export CSV")
    }
  }

useEffect(() => {
  loadFilters()
  loadStatistics()
}, [])
  const averageScore = useMemo(() => {
    if (!data?.rows?.length) return '0'

    const validScores = data.rows
      .map((r) => r.score)
      .filter((v): v is number => typeof v === 'number')

    if (!validScores.length) return '0'

    const avg =
      validScores.reduce((sum, value) => sum + value, 0) / validScores.length

    return avg.toFixed(2)
  }, [data])

  return (
    <div style={pageWrap}>
      <div style={mainCard}>
        <div style={sectionHeader}>
          <h1 style={sectionTitle}>Statistiques</h1>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btnPrimaryRed} onClick={loadStatistics}>
              Search
            </button>
            <button style={btnLight} onClick={handleExport}>
              Export CSV
            </button>
          </div>
        </div>

        {error ? <div style={errorStyle}>{error}</div> : null}

        <div style={filtersWrap}>
          <input
            type="date"
            value={filters.from}
            style={fieldInput}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />

          <input
            type="date"
            value={filters.to}
            style={fieldInput}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />

          <select
            style={fieldInput}
            value={filters.groupBy}
            onChange={(e) =>
              setFilters({
                ...filters,
                groupBy: e.target.value as StatisticsFilters['groupBy'],
              })
            }
          >
            <option value="campaign">Campaign</option>
            <option value="agent">Agent</option>
            <option value="date">Date</option>
            <option value="team">Team</option>
          </select>

          <select
            style={fieldInput}
            value={filters.summaryType}
            onChange={(e) =>
              setFilters({
                ...filters,
                summaryType: e.target.value as StatisticsFilters['summaryType'],
              })
            }
          >
            <option value="avg">Average</option>
            <option value="sum">Sum</option>
            <option value="count">Count</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>

          <select
            style={fieldInput}
            value={filters.teamId ?? ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                teamId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">All Teams</option>
            {options.teams.map((team, index) => (
              <option key={`${team.id}-${index}`} value={team.id}>
                {team.description}
              </option>
            ))}
          </select>

          <select
            style={fieldInput}
            value={filters.agentOid}
            onChange={(e) =>
              setFilters({
                ...filters,
                agentOid: e.target.value,
              })
            }
          >
            <option value="">All Agents</option>
            {options.agents.map((agent, index) => (
              <option key={`${agent.agentOid}-${index}`} value={agent.agentOid}>
                {agent.fullName}
              </option>
            ))}
          </select>

          <select
            style={fieldInput}
            value={filters.campaign}
            onChange={(e) =>
              setFilters({
                ...filters,
                campaign: e.target.value,
              })
            }
          >
            <option value="">All Campaigns</option>
            {options.campaigns.map((campaign, index) => (
              <option key={`${campaign}-${index}`} value={campaign}>
                {campaign}
              </option>
            ))}
          </select>
        </div>

        <div style={summaryWrap}>
          <div style={summaryCard}>
            <div style={summaryLabel}>TOTAL ROWS</div>
            <div style={summaryValue}>{data?.total ?? 0}</div>
          </div>

          <div style={summaryCard}>
            <div style={summaryLabel}>AVERAGE SCORE</div>
            <div style={summaryValue}>{averageScore}</div>
          </div>
        </div>

        {loading ? (
          <div style={loadingStyle}>Loading...</div>
        ) : (
          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Agent</th>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Team</th>
                </tr>
              </thead>
              <tbody>
                {data?.rows?.length ? (
                  data.rows.map((row, index) => (
                    <tr
                      key={`${row.recordId}-${row.agentOid}-${row.callLocalTime}-${index}`}
                    >
                      <td style={tdStyle}>
                        {row.nomAgent} {row.prenomAgent}
                      </td>
                      <td style={tdStyle}>{row.campaign}</td>
                      <td style={tdStyle}>{row.score ?? '—'}</td>
                      <td style={tdStyle}>
                        {row.callLocalTime
                          ? new Date(row.callLocalTime).toLocaleString()
                          : '—'}
                      </td>
                      <td style={tdStyle}>{row.teamName || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={tdStyle} colSpan={5}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}