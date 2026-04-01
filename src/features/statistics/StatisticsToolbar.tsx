import type { StatisticsFilters } from './statisticsTypes'

type Props = {
  filters: StatisticsFilters
  onChange: (filters: StatisticsFilters) => void
  onRefresh: () => void
  onExportCsv: () => void
}

export default function StatisticsToolbar({
  filters,
  onChange,
  onRefresh,
  onExportCsv,
}: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'end',
      }}
    >
      <div>
        <label>From</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label>To</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label>Type Opérateur</label>
        <select
          value={filters.summaryType}
          onChange={(e) =>
            onChange({
              ...filters,
              summaryType: e.target.value as StatisticsFilters['summaryType'],
            })
          }
          style={{ width: '100%' }}
        >
          <option value="avg">Average</option>
          <option value="sum">Sum</option>
          <option value="count">Count</option>
          <option value="min">Min</option>
          <option value="max">Max</option>
        </select>
      </div>

      <div>
        <label>Graph Type</label>
        <select
          value={filters.chartType}
          onChange={(e) =>
            onChange({
              ...filters,
              chartType: e.target.value as StatisticsFilters['chartType'],
            })
          }
          style={{ width: '100%' }}
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
        </select>
      </div>

      <div>
        <label>Group By</label>
        <select
          value={filters.groupBy}
          onChange={(e) =>
            onChange({
              ...filters,
              groupBy: e.target.value as StatisticsFilters['groupBy'],
            })
          }
          style={{ width: '100%' }}
        >
          <option value="campaign">Campaign</option>
          <option value="agent">Agent</option>
          <option value="date">Date</option>
          <option value="status">Status</option>
        </select>
      </div>

      <button onClick={onRefresh}>Refresh</button>
      <button onClick={onExportCsv}>Export CSV</button>
    </div>
  )
}