import type { StatisticRecord, StatisticsFilters } from './statisticsTypes'

type ChartRow = {
  label: string
  value: number
}

export function buildChartData(
  rows: StatisticRecord[],
  groupBy: StatisticsFilters['groupBy'],
  summaryType: StatisticsFilters['summaryType']
): ChartRow[] {
  const grouped = new Map<string, number[]>()

  rows.forEach((row) => {
    let key = ''

    if (groupBy === 'campaign') key = row.campaign
    if (groupBy === 'agent') key = `${row.nomAgent} ${row.prenomAgent}`
    if (groupBy === 'date') key = row.createDate
    if (groupBy === 'status') key = row.status

    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(row.score)
  })

  return Array.from(grouped.entries()).map(([label, values]) => {
    let value = 0

    switch (summaryType) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0)
        break
      case 'count':
        value = values.length
        break
      case 'min':
        value = Math.min(...values)
        break
      case 'max':
        value = Math.max(...values)
        break
      case 'avg':
      default:
        value = values.reduce((a, b) => a + b, 0) / values.length
        break
    }

    return {
      label,
      value: Number(value.toFixed(2)),
    }
  })
}