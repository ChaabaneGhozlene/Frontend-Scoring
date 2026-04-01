// components/evaluation/AgentReportModal.tsx
import React from 'react'
import type { AgentReportDto, SurveyReportDto } from '../Evaluationtypes'
import { btnCancel, modalBase, modalCloseBtn, modalFooter, modalHeader, modalHeaderIcon, modalHeaderTitle, modalOverlay } from '../../Style/ComponentsStyles'

interface Props {
  opened:  boolean
  onClose: () => void
  report:  AgentReportDto | null
  loading: boolean
  error:   string | null
}

const S = {
  body: {
    padding: '20px', overflowY: 'auto' as const,
    maxHeight: 'calc(88vh - 110px)', minWidth: 640,
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '6px 24px', marginBottom: 18,
    background: '#f8f9fa', borderRadius: 6,
    padding: '12px 16px', fontSize: 13,
  },
  infoRow: { display: 'flex', gap: 6 },
  infoLabel: { color: '#6b7280', fontWeight: 500, minWidth: 90 },
  infoValue: { color: '#111', fontWeight: 600 },
  scoreCircle: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 64, height: 64, borderRadius: '50%', background: '#DC2626',
    color: '#fff', fontSize: 18, fontWeight: 700,
    marginBottom: 16, alignSelf: 'center' as const,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: 700, color: '#555',
    textTransform: 'uppercase' as const, letterSpacing: 0.6,
    borderBottom: '2px solid #DC2626', paddingBottom: 4, marginBottom: 10, marginTop: 20,
  },
  pivotTable: {
    width: '100%', borderCollapse: 'collapse' as const, fontSize: 12, marginBottom: 16,
  },
  th: {
    background: '#f3f4f6', padding: '6px 10px', textAlign: 'left' as const,
    fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb',
    fontSize: 11, whiteSpace: 'nowrap' as const,
  },
  thCenter: {
    background: '#f3f4f6', padding: '6px 10px', textAlign: 'center' as const,
    fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb',
    fontSize: 11, whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '5px 10px', borderBottom: '1px solid #f0f0f0',
    color: '#333', fontSize: 12,
  },
  tdCenter: {
    padding: '5px 10px', borderBottom: '1px solid #f0f0f0',
    color: '#333', fontSize: 12, textAlign: 'center' as const,
  },
  trEven: { background: '#fafafa' },
  scoreBadge: (score: number) => ({
    display: 'inline-block', padding: '2px 10px',
    borderRadius: 10, fontSize: 11, fontWeight: 700,
    background: score >= 80 ? '#d1fae5' : score >= 60 ? '#fef9c3' : '#fee2e2',
    color: score >= 80 ? '#065f46' : score >= 60 ? '#92400e' : '#991b1b',
  }),
  spinner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 0', fontSize: 13, color: '#6b7280',
  },
  error: {
    padding: '20px', color: '#DC2626', fontSize: 13, textAlign: 'center' as const,
  },
  totalRow: {
    background: '#fef2f2', fontWeight: 700,
  },
}

const AgentReportModal: React.FC<Props> = ({ opened, onClose, report, loading, error }) => {
  if (!opened) return null

  // Build pivot: rows = questions (from first survey), cols = E1, E2 …
  const buildPivot = () => {
    if (!report || !report.surveys.length) return null
    // collect all unique questions across surveys in order
    const allQuestions = new Map<number, { section: string; question: string; order: number }>()
    report.surveys.forEach(sv => {
      sv.items.forEach(it => {
        if (!allQuestions.has(it.templateItemId)) {
          allQuestions.set(it.templateItemId, {
            section:  it.sectionName ?? '',
            question: it.question    ?? '',
            order:    it.sectionOrder * 1000 + it.itemOrder,
          })
        }
      })
    })
    const sortedQuestions = [...allQuestions.entries()].sort((a, b) => a[1].order - b[1].order)
    // value map: surveyId → itemId → value
    const valueMap = new Map<number, Map<number, number>>()
    report.surveys.forEach(sv => {
      const m = new Map<number, number>()
      sv.items.forEach(it => m.set(it.templateItemId, it.value))
      valueMap.set(sv.surveyId, m)
    })
    return { sortedQuestions, valueMap }
  }

  const pivot = buildPivot()

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBase, width: 820, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ ...modalHeaderIcon, background: '#DC2626' }}>📋</div>
          <span style={modalHeaderTitle}>Fiche Agent — Rapport d'évaluation</span>
          <button style={   modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {loading && <div style={S.spinner}>Chargement du rapport…</div>}
          {error   && <div style={S.error}>{error}</div>}

          {report && !loading && (
            <>
              {/* Info header */}
              <div style={{ ...S.infoGrid }}>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Agent :</span>
                  <span style={S.infoValue}>{report.agentName}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Auditeur :</span>
                  <span style={S.infoValue}>{report.auditorName}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Date :</span>
                  <span style={S.infoValue}>{report.createDate}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Période :</span>
                  <span style={S.infoValue}>{report.periodLabel}</span>
                </div>
                <div style={{ ...S.infoRow, gridColumn: '1 / -1', justifyContent: 'flex-start', gap: 12 }}>
                  <span style={S.infoLabel}>Score total :</span>
                  <span style={S.scoreBadge(report.totalScore)}>{report.totalScore}%</span>
                </div>
              </div>

              {/* Scores par évaluation */}
              <div style={S.sectionTitle}>Scores par évaluation</div>
              <table style={S.pivotTable}>
                <thead>
                  <tr>
                    {report.surveys.map(sv => (
                      <th key={sv.surveyId} style={S.thCenter}>{sv.surveyLabel}</th>
                    ))}
                    <th style={S.thCenter}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {report.surveys.map(sv => (
                      <td key={sv.surveyId} style={S.tdCenter}>
                        <span style={S.scoreBadge(sv.score)}>{sv.score}%</span>
                      </td>
                    ))}
                    <td style={S.tdCenter}>
                      <span style={S.scoreBadge(report.totalScore)}>{report.totalScore}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Scores par section */}
              {report.sectionScores.length > 0 && (
                <>
                  <div style={S.sectionTitle}>Scores par section</div>
                  <table style={S.pivotTable}>
                    <thead>
                      <tr>
                        <th style={S.th}>Section</th>
                        <th style={S.thCenter}>Évaluation</th>
                        <th style={S.thCenter}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sectionScores.map((sc, i) => (
                        <tr key={i} style={i % 2 === 1 ? S.trEven : undefined}>
                          <td style={S.td}>{sc.sectionName}</td>
                          <td style={S.tdCenter}>{sc.surveyLabel}</td>
                          <td style={S.tdCenter}>
                            <span style={S.scoreBadge(sc.score)}>{sc.score}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Grille pivot détaillée */}
              {pivot && (
                <>
                  <div style={S.sectionTitle}>Grille détaillée</div>
                  <table style={S.pivotTable}>
                    <thead>
                      <tr>
                        <th style={S.th}>Section</th>
                        <th style={S.th}>Question</th>
                        {report.surveys.map(sv => (
                          <th key={sv.surveyId} style={S.thCenter}>{sv.surveyLabel}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pivot.sortedQuestions.map(([itemId, meta], i) => (
                        <tr key={itemId} style={i % 2 === 1 ? S.trEven : undefined}>
                          <td style={{ ...S.td, color: '#6b7280', fontSize: 11 }}>{meta.section}</td>
                          <td style={S.td}>{meta.question}</td>
                          {report.surveys.map(sv => {
                            const val = pivot.valueMap.get(sv.surveyId)?.get(itemId)
                            return (
                              <td key={sv.surveyId} style={S.tdCenter}>
                                {val !== undefined ? val : '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Mémos */}
              {report.surveys.some(sv => sv.memo) && (
                <>
                  <div style={S.sectionTitle}>Commentaires</div>
                  {report.surveys.filter(sv => sv.memo).map(sv => (
                    <div key={sv.surveyId} style={{
                      background: '#f8f9fa', borderRadius: 6,
                      padding: '10px 14px', marginBottom: 8, fontSize: 13,
                    }}>
                      <strong style={{ color: '#DC2626' }}>{sv.surveyLabel} :</strong>{' '}
                      {sv.memo}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default AgentReportModal