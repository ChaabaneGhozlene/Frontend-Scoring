import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  MonitorUp,
  Plus,
  RotateCcw,
  Save,
  X,
} from 'lucide-react'
import { fetchDashboard, type DashboardResponse } from './dashboardApi'
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
  
  tableStyle,
  thStyle,
  tdStyle,
  errorStyle,
  loadingStyle,
} from '../Style/ComponentsStyles'

type WidgetKey =
  | 'indicators'
  | 'evalDistribution'
  | 'listeningDistribution'
  | 'auditorEvaluation'
  | 'averageEvolution'
  | 'evaluationsByAuditor'
  | 'listeningsBySupervisor'
  | 'supervisorListenings'
  | 'top5Agents'
  | 'customerConcerns'

type WidgetState = Record<WidgetKey, boolean>

const defaultWidgets: WidgetState = {
  indicators: true,
  evalDistribution: true,
  listeningDistribution: true,
  auditorEvaluation: true,
  averageEvolution: true,
  evaluationsByAuditor: true,
  listeningsBySupervisor: true,
  supervisorListenings: true,
  top5Agents: false,
  customerConcerns: false,
}

const DEFAULT_START_DATE = '2022-12-16'
const DEFAULT_END_DATE = '2022-12-16'

const STORAGE_KEYS = {
  widgets: 'dashboard_widgets',
  startDate: 'dashboard_start_date',
  endDate: 'dashboard_end_date',
}

function getSavedWidgets(): WidgetState {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.widgets)
    if (!saved) return defaultWidgets

    const parsed = JSON.parse(saved) as Partial<WidgetState>

    return {
      ...defaultWidgets,
      ...parsed,
    }
  } catch {
    return defaultWidgets
  }
}

function getSavedStartDate(): string {
  return localStorage.getItem(STORAGE_KEYS.startDate) || DEFAULT_START_DATE
}

function getSavedEndDate(): string {
  return localStorage.getItem(STORAGE_KEYS.endDate) || DEFAULT_END_DATE
}

function Panel({
  title,
  onClose,
  children,
}: {
  title: string
  onClose?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        ...mainCard,
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          ...sectionHeader,
          padding: '12px 16px',
        }}
      >
        <span style={{ fontSize: 15, color: '#5f6772', fontWeight: 600 }}>
          {title}
        </span>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#8a9099',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

function TableWidget({
  rows,
  firstColumn,
  secondColumn,
}: {
  rows: { label: string; value: number }[]
  firstColumn: string
  secondColumn: string
}) {
  return (
    <div style={{ maxHeight: 265, overflowY: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>{firstColumn}</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>{secondColumn}</th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={`${row.label}-${index}`}>
                <td style={tdStyle}>{row.label}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{row.value}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan={2}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ChartPlaceholder({ loading = false }: { loading?: boolean }) {
  return (
    <div
      style={{
        height: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 22,
        lineHeight: '32px',
        color: '#555',
      }}
    >
      <p>{loading ? 'Loading...' : 'Chart area'}</p>
    </div>
  )
}

function AverageEvolutionChart({
  averageScore,
}: {
  averageScore: number
}) {
  const safeScore = Math.max(0, Math.min(100, averageScore || 0))
  const y = 225 - (safeScore / 100) * 180

  return (
    <div style={{ height: 260 }}>
      <svg viewBox="0 0 400 260" style={{ height: '100%', width: '100%' }}>
        <line x1="45" y1="25" x2="45" y2="225" stroke="#d1d5db" strokeWidth="1" />
        <line x1="45" y1="225" x2="360" y2="225" stroke="#d1d5db" strokeWidth="1" />

        <line x1="45" y1="180" x2="360" y2="180" stroke="#edf0f3" strokeWidth="1" />
        <line x1="45" y1="135" x2="360" y2="135" stroke="#edf0f3" strokeWidth="1" />
        <line x1="45" y1="90" x2="360" y2="90" stroke="#edf0f3" strokeWidth="1" />
        <line x1="45" y1="45" x2="360" y2="45" stroke="#edf0f3" strokeWidth="1" />

        <circle cx="205" cy={y} r="7" fill="#6fa7d8" />

        <text x="8" y="228" fontSize="13" fill="#9ca3af">0</text>
        <text x="8" y="183" fontSize="13" fill="#9ca3af">25</text>
        <text x="8" y="138" fontSize="13" fill="#9ca3af">50</text>
        <text x="8" y="93" fontSize="13" fill="#9ca3af">75</text>
        <text x="8" y="48" fontSize="13" fill="#9ca3af">100</text>

        <text x="178" y="248" fontSize="16" fill="#9ca3af">Average</text>
        <text x="220" y={y - 10} fontSize="14" fill="#4b5563">
          {safeScore.toFixed(2)}%
        </text>
      </svg>
    </div>
  )
}

function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetState>(() => getSavedWidgets())
  const [draftWidgets, setDraftWidgets] = useState<WidgetState>(() => getSavedWidgets())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startDate, setStartDate] = useState(() => getSavedStartDate())
  const [endDate, setEndDate] = useState(() => getSavedEndDate())
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const widgetOptions = useMemo(
    () => [
      { key: 'indicators' as WidgetKey, label: 'Indicateurs' },
      {
        key: 'evalDistribution' as WidgetKey,
        label: "Distribution d'évaluations par campagne",
      },
      {
        key: 'listeningDistribution' as WidgetKey,
        label: "Distribution d'écoutes par campagne",
      },
      { key: 'auditorEvaluation' as WidgetKey, label: 'Evaluation des auditeurs' },
      { key: 'averageEvolution' as WidgetKey, label: 'Evolution moyenne' },
      { key: 'evaluationsByAuditor' as WidgetKey, label: 'Evaluations par auditeur' },
      { key: 'listeningsBySupervisor' as WidgetKey, label: 'Ecoutes par superviseur' },
      { key: 'supervisorListenings' as WidgetKey, label: 'Ecoutes de superviseurs' },
      {
        key: 'top5Agents' as WidgetKey,
        label: "Top 5 agents qui ont besoin d'amélioration",
      },
      { key: 'customerConcerns' as WidgetKey, label: 'Soucis clientèle' },
    ],
    []
  )

  const hideWidget = (key: WidgetKey) => {
    setWidgets((prev) => ({ ...prev, [key]: false }))
  }

  const openModal = () => {
    setDraftWidgets(widgets)
    setIsModalOpen(true)
  }

  const saveDashboard = () => {
    localStorage.setItem(STORAGE_KEYS.widgets, JSON.stringify(widgets))
    localStorage.setItem(STORAGE_KEYS.startDate, startDate)
    localStorage.setItem(STORAGE_KEYS.endDate, endDate)
    alert('Dashboard saved successfully')
  }

  const resetDashboard = () => {
    setWidgets(defaultWidgets)
    setDraftWidgets(defaultWidgets)
    setStartDate(DEFAULT_START_DATE)
    setEndDate(DEFAULT_END_DATE)

    localStorage.removeItem(STORAGE_KEYS.widgets)
    localStorage.removeItem(STORAGE_KEYS.startDate)
    localStorage.removeItem(STORAGE_KEYS.endDate)
  }

  const refreshDates = () => {
    setStartDate(DEFAULT_START_DATE)
    setEndDate(DEFAULT_END_DATE)
  }

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetchDashboard({
        startDate,
        endDate,
      })
      setDashboardData(res)
    } catch (err) {
      console.error('dashboard load error', err)
      setError('Erreur lors du chargement du dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [startDate, endDate])

  const totalRecordings = dashboardData?.stats.totalRecordings ?? 0
  const totalEvaluations = dashboardData?.stats.totalEvaluations ?? 0
  const averageScore = Number(dashboardData?.stats.averageScore ?? 0)

  return (
    <div style={pageWrap}>
      <div style={mainCard}>
        <div style={sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: '#7a7f87', display: 'flex', alignItems: 'center' }}>
              <MonitorUp size={34} strokeWidth={1.6} />
            </div>

            <div>
              <h1 style={sectionTitle}>Tableau de Bord</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={openModal}
              style={{
                ...btnPrimaryRed,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Plus size={16} />
              Ajouter
            </button>

            <button
              onClick={saveDashboard}
              style={{
                ...btnLight,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Save size={16} />
              Enregistrer
            </button>

            <button
              onClick={resetDashboard}
              style={{
                ...btnLight,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>
          </div>
        </div>

        <div style={filtersWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 16, color: '#555' }}>Début:</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...fieldInput, paddingRight: 34 }}
              />
              <CalendarDays
                size={14}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 16, color: '#555' }}>Fin:</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ ...fieldInput, paddingRight: 34 }}
              />
              <CalendarDays
                size={14}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={refreshDates}
            style={{
              ...btnLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 42,
            }}
          >
            <RotateCcw size={16} />
          </button>

          <button onClick={loadDashboard} style={btnPrimaryRed}>
            Rechercher
          </button>
        </div>

        {error ? <div style={errorStyle}>{error}</div> : null}

        <div style={summaryWrap}>
          <div style={summaryCard}>
            <div style={summaryLabel}>ECOUTES</div>
            <div style={summaryValue}>{loading ? '...' : totalRecordings}</div>
          </div>

          <div style={summaryCard}>
            <div style={summaryLabel}>EVALUATIONS</div>
            <div style={summaryValue}>{loading ? '...' : totalEvaluations}</div>
          </div>

          <div style={summaryCard}>
            <div style={summaryLabel}>AVERAGE SCORE</div>
            <div style={summaryValue}>
              {loading ? '...' : `${averageScore.toFixed(2)}%`}
            </div>
          </div>
        </div>

        {loading && !dashboardData ? (
          <div style={loadingStyle}>Loading...</div>
        ) : null}

        <div
          style={{
            padding: '0 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {widgets.indicators && (
            <Panel title="Indicateurs" onClose={() => hideWidget('indicators')}>
              <div
                style={{
                  minHeight: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 30,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 20,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 48,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: '#1d2340',
                        margin: 0,
                      }}
                    >
                      {loading ? '...' : totalRecordings}
                    </p>
                    <p style={{ marginTop: 8, fontSize: 18, color: '#5f6772' }}>
                      Ecoutes
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontSize: 48,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: '#1d2340',
                        margin: 0,
                      }}
                    >
                      {loading ? '...' : totalEvaluations}
                    </p>
                    <p style={{ marginTop: 8, fontSize: 18, color: '#5f6772' }}>
                      Evaluations
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: 48,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: '#1d2340',
                      margin: 0,
                    }}
                  >
                    {loading ? '...' : `${averageScore.toFixed(2)}%`}
                  </p>
                  <p style={{ marginTop: 8, fontSize: 18, color: '#5f6772' }}>
                    Average score
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {widgets.evalDistribution && (
            <Panel
              title="Distribution d'évaluations par campagne"
              onClose={() => hideWidget('evalDistribution')}
            >
              <ChartPlaceholder loading={loading} />
            </Panel>
          )}

          {widgets.listeningDistribution && (
            <Panel
              title="Distribution d'écoutes par campagne"
              onClose={() => hideWidget('listeningDistribution')}
            >
              <ChartPlaceholder loading={loading} />
            </Panel>
          )}

          {widgets.auditorEvaluation && (
            <Panel
              title="Evaluation des auditeurs"
              onClose={() => hideWidget('auditorEvaluation')}
            >
              <ChartPlaceholder loading={loading} />
            </Panel>
          )}

          {widgets.averageEvolution && (
            <Panel
              title="Evolution moyenne"
              onClose={() => hideWidget('averageEvolution')}
            >
              {loading ? (
                <ChartPlaceholder loading />
              ) : (
                <AverageEvolutionChart averageScore={averageScore} />
              )}
            </Panel>
          )}

          {widgets.evaluationsByAuditor && (
            <Panel
              title="Evaluations par auditeur"
              onClose={() => hideWidget('evaluationsByAuditor')}
            >
              <TableWidget
                rows={dashboardData?.evaluationsByAuditor ?? []}
                firstColumn="Auditeur"
                secondColumn={"Nombre d'Evaluations"}
              />
            </Panel>
          )}

          {widgets.listeningsBySupervisor && (
            <Panel
              title="Ecoutes par superviseur"
              onClose={() => hideWidget('listeningsBySupervisor')}
            >
              <TableWidget
                rows={dashboardData?.listeningsBySupervisor ?? []}
                firstColumn="Superviseur"
                secondColumn={"Nombre d'Ecoutes"}
              />
            </Panel>
          )}

          {widgets.supervisorListenings && (
            <Panel
              title="Ecoutes de superviseurs"
              onClose={() => hideWidget('supervisorListenings')}
            >
              <ChartPlaceholder loading={loading} />
            </Panel>
          )}

          {widgets.top5Agents && (
            <Panel
              title="Top 5 agents qui ont besoin d'amélioration"
              onClose={() => hideWidget('top5Agents')}
            >
              <TableWidget
                rows={dashboardData?.top5Agents ?? []}
                firstColumn="Agent"
                secondColumn="Score"
              />
            </Panel>
          )}

          {widgets.customerConcerns && (
            <Panel
              title="Soucis clientèle"
              onClose={() => hideWidget('customerConcerns')}
            >
              <TableWidget
                rows={dashboardData?.customerConcerns ?? []}
                firstColumn="Description"
                secondColumn="Number"
              />
            </Panel>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 900,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 24px 64px rgba(0,0,0,.22)',
              overflow: 'hidden',
            }}
          >
            <div style={sectionHeader}>
              <span style={{ fontSize: 14, color: '#5f6772', fontWeight: 600 }}>
                Ajouter widget
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#8a9099',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                padding: 20,
              }}
            >
              {widgetOptions.map((option) => (
                <label
                  key={option.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 15,
                    color: '#374151',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={draftWidgets[option.key]}
                    onChange={() =>
                      setDraftWidgets((prev) => ({
                        ...prev,
                        [option.key]: !prev[option.key],
                      }))
                    }
                    style={{ marginTop: 2 }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                padding: 16,
                borderTop: '1px solid #e5e7eb',
                background: '#fafafa',
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={btnLight}
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  setWidgets(draftWidgets)
                  setIsModalOpen(false)
                }}
                style={btnPrimaryRed}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage