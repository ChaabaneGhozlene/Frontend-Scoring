import type { StatisticRow } from './statisticsTypes'

type Props = {
  rows: StatisticRow[]
}

export default function StatisticsTable({ rows }: Props) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Record ID</th>
            <th>Survey ID</th>
            <th>Record Data ID</th>
            <th>Campaign</th>
            <th>Agent OID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Phone</th>
            <th>Score</th>
            <th>Team</th>
            <th>Team ID</th>
            <th>Call Local Time</th>
            <th>Date Eval</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.recordId}-${row.agentOid}-${row.callLocalTime}-${index}`}>
              <td>{row.recordId}</td>
              <td>{row.surveyId}</td>
              <td>{row.recordDataId ?? '—'}</td>
              <td>{row.campaign}</td>
              <td>{row.agentOid}</td>
              <td>{row.nomAgent}</td>
              <td>{row.prenomAgent}</td>
              <td>{row.phoneNumber}</td>
              <td>{row.score ?? '—'}</td>
              <td>{row.teamName || '—'}</td>
              <td>{row.teamId ?? '—'}</td>
              <td>{row.callLocalTime ?? '—'}</td>
              <td>{row.dateEval ?? '—'}</td>
              <td>{row.comment || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}