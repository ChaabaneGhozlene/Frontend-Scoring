// components/evaluation/AgentReportModal.tsx
import React from 'react'
import type { AgentReportDto } from '../Evaluationtypes'
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
  exportBtn: {
    padding: '6px 16px', borderRadius: 5, border: '1px solid #16a34a',
    background: '#16a34a', color: '#fff', fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
  },
}

// ─── Helper : échapper une valeur CSV ───────────────────────
const csvCell = (val: string | number | null | undefined): string => {
  const s = String(val ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

// ─── Génération du CSV ───────────────────────────────────────
const generateCSV = (report: AgentReportDto): string => {
  const lines: string[] = []

  lines.push('FICHE AGENT — RAPPORT DÉVALUATION')
  lines.push(`Agent,${csvCell(report.agentName)}`)
  lines.push(`Auditeur,${csvCell(report.auditorName)}`)
  lines.push(`Date,${csvCell(report.createDate)}`)
  lines.push(`Période,${csvCell(report.periodLabel)}`)
  lines.push(`Score total,${csvCell(report.totalScore + '%')}`)
  lines.push('')

  lines.push('SCORES PAR ÉVALUATION')
  lines.push(report.surveys.map(sv => csvCell(sv.surveyLabel)).join(',') + ',Total')
  lines.push(
    report.surveys.map(sv => csvCell(sv.score + '%')).join(',') +
    `,${csvCell(report.totalScore + '%')}`
  )
  lines.push('')

  if (report.sectionScores.length > 0) {
    lines.push('SCORES PAR SECTION')
    lines.push('Section,Évaluation,Score')
    report.sectionScores.forEach(sc => {
      lines.push(`${csvCell(sc.sectionName)},${csvCell(sc.surveyLabel)},${csvCell(sc.score + '%')}`)
    })
    lines.push('')
  }

  if (report.surveys.length > 0) {
    lines.push('GRILLE DÉTAILLÉE')
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
    const valueMap = new Map<number, Map<number, number>>()
    report.surveys.forEach(sv => {
      const m = new Map<number, number>()
      sv.items.forEach(it => m.set(it.templateItemId, it.value))
      valueMap.set(sv.surveyId, m)
    })
    lines.push('Section,Question,' + report.surveys.map(sv => csvCell(sv.surveyLabel)).join(','))
    sortedQuestions.forEach(([itemId, meta]) => {
      const vals = report.surveys
        .map(sv => {
          const val = valueMap.get(sv.surveyId)?.get(itemId)
          return csvCell(val !== undefined ? val : '—')
        })
        .join(',')
      lines.push(`${csvCell(meta.section)},${csvCell(meta.question)},${vals}`)
    })
    lines.push('')
  }

  const surveysWithMemo = report.surveys.filter(sv => sv.memo)
  if (surveysWithMemo.length > 0) {
    lines.push('COMMENTAIRES')
    lines.push('Évaluation,Commentaire')
    surveysWithMemo.forEach(sv => {
      lines.push(`${csvCell(sv.surveyLabel)},${csvCell(sv.memo)}`)
    })
  }

  return lines.join('\n')
}

// ─── Téléchargement CSV ──────────────────────────────────────
const downloadCSV = (report: AgentReportDto) => {
  const csv  = generateCSV(report)
  const BOM  = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `rapport_${report.agentName.replace(/\s+/g, '_')}_${report.createDate}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Helper : inline badge style string pour le HTML exporté ─
const htmlBadgeStyle = (score: number): string => {
  const bg    = score >= 80 ? '#d1fae5' : score >= 60 ? '#fef9c3' : '#fee2e2'
  const color = score >= 80 ? '#065f46' : score >= 60 ? '#92400e' : '#991b1b'
  return `display:inline-block;padding:2px 10px;border-radius:10px;` +
         `font-size:11px;font-weight:700;background:${bg};color:${color}`
}

// ─── Helper : échapper les caractères HTML ───────────────────
const esc = (val: string | number | null | undefined): string =>
  String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// ─── Génération du HTML coloré ───────────────────────────────
const generateHTML = (report: AgentReportDto): string => {
  // ── Construire le pivot ──
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
  const valueMap = new Map<number, Map<number, number>>()
  report.surveys.forEach(sv => {
    const m = new Map<number, number>()
    sv.items.forEach(it => m.set(it.templateItemId, it.value))
    valueMap.set(sv.surveyId, m)
  })

  const css = `
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 32px; }
    h1   { font-size: 16px; color: #DC2626; margin-bottom: 18px; }
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 6px 24px; background: #f8f9fa; border-radius: 6px;
      padding: 12px 16px; margin-bottom: 18px;
    }
    .info-row  { display: flex; gap: 6px; }
    .info-label{ color: #6b7280; font-weight: 500; min-width: 90px; }
    .info-value{ color: #111; font-weight: 600; }
    .section-title {
      font-size: 11px; font-weight: 700; color: #555;
      text-transform: uppercase; letter-spacing: .6px;
      border-bottom: 2px solid #DC2626; padding-bottom: 4px;
      margin: 20px 0 10px;
    }
    table  { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th     { background: #f3f4f6; padding: 6px 10px; text-align: left;
             font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;
             font-size: 11px; white-space: nowrap; }
    th.c   { text-align: center; }
    td     { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
    td.c   { text-align: center; }
    tr.even{ background: #fafafa; }
    .memo  { background: #f8f9fa; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
    .memo strong { color: #DC2626; }
    @media print { body { margin: 16px; } }
  `

  // ── Info grid ──
  const infoGrid = `
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Agent :</span>
        <span class="info-value">${esc(report.agentName)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Auditeur :</span>
        <span class="info-value">${esc(report.auditorName)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date :</span>
        <span class="info-value">${esc(report.createDate)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Période :</span>
        <span class="info-value">${esc(report.periodLabel)}</span>
      </div>
      <div class="info-row" style="grid-column:1/-1">
        <span class="info-label">Score total :</span>
        <span style="${htmlBadgeStyle(report.totalScore)}">${report.totalScore}%</span>
      </div>
    </div>`

  // ── Scores par évaluation ──
  const evalHeaders = report.surveys
    .map(sv => `<th class="c">${esc(sv.surveyLabel)}</th>`).join('') +
    '<th class="c">Total</th>'
  const evalScores = report.surveys
    .map(sv =>
      `<td class="c"><span style="${htmlBadgeStyle(sv.score)}">${sv.score}%</span></td>`
    ).join('') +
    `<td class="c"><span style="${htmlBadgeStyle(report.totalScore)}">${report.totalScore}%</span></td>`

  const evalTable = `
    <div class="section-title">Scores par évaluation</div>
    <table>
      <thead><tr>${evalHeaders}</tr></thead>
      <tbody><tr>${evalScores}</tr></tbody>
    </table>`

  // ── Scores par section ──
  const sectionTable = report.sectionScores.length > 0 ? `
    <div class="section-title">Scores par section</div>
    <table>
      <thead>
        <tr>
          <th>Section</th>
          <th class="c">Évaluation</th>
          <th class="c">Score</th>
        </tr>
      </thead>
      <tbody>
        ${report.sectionScores.map((sc, i) => `
          <tr class="${i % 2 === 1 ? 'even' : ''}">
            <td>${esc(sc.sectionName)}</td>
            <td class="c">${esc(sc.surveyLabel)}</td>
            <td class="c"><span style="${htmlBadgeStyle(sc.score)}">${sc.score}%</span></td>
          </tr>`).join('')}
      </tbody>
    </table>` : ''

  // ── Grille détaillée ──
  const pivotHeaders = report.surveys
    .map(sv => `<th class="c">${esc(sv.surveyLabel)}</th>`).join('')
  const pivotRows = sortedQuestions.map(([itemId, meta], i) => {
    const vals = report.surveys.map(sv => {
      const val = valueMap.get(sv.surveyId)?.get(itemId)
      return `<td class="c">${val !== undefined ? val : '—'}</td>`
    }).join('')
    return `
      <tr class="${i % 2 === 1 ? 'even' : ''}">
        <td style="color:#6b7280;font-size:11px">${esc(meta.section)}</td>
        <td>${esc(meta.question)}</td>
        ${vals}
      </tr>`
  }).join('')

  const pivotTable = sortedQuestions.length > 0 ? `
    <div class="section-title">Grille détaillée</div>
    <table>
      <thead>
        <tr>
          <th>Section</th>
          <th>Question</th>
          ${pivotHeaders}
        </tr>
      </thead>
      <tbody>${pivotRows}</tbody>
    </table>` : ''

  // ── Commentaires ──
  const memos = report.surveys.filter(sv => sv.memo)
  const memosBlock = memos.length > 0 ? `
    <div class="section-title">Commentaires</div>
    ${memos.map(sv => `
      <div class="memo">
        <strong>${esc(sv.surveyLabel)} :</strong> ${esc(sv.memo)}
      </div>`).join('')}` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport — ${esc(report.agentName)}</title>
  <style>${css}</style>
</head>
<body>
  <h1>📋 Fiche Agent — Rapport d'évaluation</h1>
  ${infoGrid}
  ${evalTable}
  ${sectionTable}
  ${pivotTable}
  ${memosBlock}
</body>
</html>`
}

// ─── Téléchargement HTML ─────────────────────────────────────
const downloadHTML = (report: AgentReportDto) => {
  const html = generateHTML(report)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `rapport_${report.agentName.replace(/\s+/g, '_')}_${report.createDate}.html`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Composant ───────────────────────────────────────────────
const AgentReportModal: React.FC<Props> = ({ opened, onClose, report, loading, error }) => {
  if (!opened) return null

  const buildPivot = () => {
    if (!report || !report.surveys.length) return null
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
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {loading && <div style={S.spinner}>Chargement du rapport…</div>}
          {error   && <div style={S.error}>{error}</div>}

          {report && !loading && (
            <>
              <div style={S.infoGrid}>
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
          {/* ✅ Bouton export HTML coloré */}
          {report && !loading && (
            <>
              <button style={S.exportBtn} onClick={() => downloadHTML(report)}>
                ⬇ Exporter HTML
              </button>
              <button
                style={{ ...S.exportBtn, background: '#2563eb', border: '1px solid #2563eb' }}
                onClick={() => downloadCSV(report)}
              >
                ⬇ Exporter CSV
              </button>
            </>
          )}
          <button style={btnCancel} onClick={onClose}>Fermer</button>
        </div>

      </div>
    </div>
  )
}

export default AgentReportModal