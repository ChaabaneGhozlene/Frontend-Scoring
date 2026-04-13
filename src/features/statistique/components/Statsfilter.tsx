import React, { useState } from 'react';
import type { AgentListItem, ChartType, ExportFormat, SortDirection, StatFilter, SupervisorItem } from '../Statistiquetypes';
import type { WidgetDefinition } from '../WidgetRegistry';
import ExportMenu from './Exportmenu';

interface StatsFilterProps {
  filter:                StatFilter;
  config:                WidgetDefinition;
  agentList:             AgentListItem[];
  supervisorList:        SupervisorItem[];
  selectedAgentId:       number | null;
  selectedSupervisorId:  number | null;
  allSupervisors:        boolean;
  sortDirection:         SortDirection;
  chartType:             ChartType;
  onFilterChange:        (f: StatFilter) => void;
  onAgentChange:         (id: number | null) => void;
  onSupervisorChange:    (id: number | null) => void;
  onAllSupervisorsChange:(v: boolean) => void;
  onSortChange:          (v: SortDirection) => void;
  onChartTypeChange:     (v: ChartType) => void;
  onRefresh:             () => void;
                       // ✅ ajouter

}

const CHART_OPTIONS: { type: ChartType; icon: string; label: string }[] = [
  { type: 'Bar',   icon: '▬', label: 'Bar'   },
  { type: 'Line',  icon: '〰', label: 'Line'  },
  { type: 'Pie',   icon: '◔', label: 'Pie'   },
  { type: 'Area',  icon: '▲', label: 'Area'  },
  { type: 'Radar', icon: '⬡', label: 'Radar' },
];

const inputBase: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: 8,
  color: '#1e293b',
  fontSize: 12,
  padding: '7px 10px',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  appearance: 'none' as any,
  WebkitAppearance: 'none' as any,
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    display: 'block', marginBottom: 4,
  }}>
    {children}
  </span>
);

const Field: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
    {children}
  </div>
);

const useFocus = () => {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    focusProps: {
      onFocus: () => setFocused(true),
      onBlur:  () => setFocused(false),
    },
    style: focused
      ? { ...inputBase, borderColor: 'rgba(220,38,38,0.7)', boxShadow: '0 0 0 3px rgba(220,38,38,0.1)' }
      : inputBase,
  };
};

const RefreshBtn: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const [spinning, setSpinning] = useState(false);
  const handle = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 900);
  };
  return (
    <button
      onClick={handle}
      title="Actualiser"
      style={{
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.3)',
        borderRadius: 8,
        color: '#dc2626',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'background 0.2s ease, transform 0.2s ease',
        transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
        alignSelf: 'flex-end',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
    >
      ↻
    </button>
  );
};

const Divider = () => (
  <div style={{ width: 1, background: 'rgba(220,38,38,0.12)', alignSelf: 'stretch', margin: '0 4px' }} />
);

const StatsFilter: React.FC<StatsFilterProps> = ({
  filter, config, agentList, supervisorList,
  selectedAgentId, selectedSupervisorId,
  allSupervisors, sortDirection, chartType,
  onFilterChange, onAgentChange, onSupervisorChange,
  onAllSupervisorsChange, onSortChange, onChartTypeChange,  onRefresh, 
}) => {
  const agent = useFocus();

  const handleAllSupervisorsChange = (v: boolean) => {
    onAllSupervisorsChange(v);
    onFilterChange({ ...filter, allSupervisors: v });
  };

  const handleSortChange = (v: SortDirection) => {
    onSortChange(v);
    onFilterChange({ ...filter, sortDirection: v });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 12,
      flexWrap: 'wrap',
      padding: '14px 16px',
      background: '#fff',
      border: '1px solid rgba(220,38,38,0.15)',
      borderRadius: 12,
      marginBottom: 16,
    }}>

      {/* ── 1. Agent selector ─────────────────────────────────────────── */}
      {config.needsAgentFilter && (
        <>
          <Field>
            <Label>Agent</Label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedAgentId ?? ''}
                onChange={e => onAgentChange(e.target.value ? Number(e.target.value) : null)}
                style={{ ...agent.style, paddingRight: 28, minWidth: 150 }}
                {...agent.focusProps}
              >
                <option value="">— Tous —</option>
                {agentList.map((a: AgentListItem) => (
                  <option key={a.id} value={a.id}>{a.agent}</option>
                ))}
              </select>
              <span style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8', fontSize: 10, pointerEvents: 'none',
              }}>▾</span>
            </div>
          </Field>
          <Divider />
        </>
      )}

      {/* ── 2. Supervisor selector ────────────────────────────────────── */}
      {config.hasSupervisorFilter && (
        <>
          <Field>
            <Label>Superviseur</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => {
                  const next = !allSupervisors;
                  handleAllSupervisorsChange(next);
                  if (next) onSupervisorChange(null);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 10px',
                  background: allSupervisors ? 'rgba(220,38,38,0.08)' : '#f8fafc',
                  border: `1px solid ${allSupervisors ? 'rgba(220,38,38,0.45)' : 'rgba(220,38,38,0.2)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  color: allSupervisors ? '#dc2626' : '#64748b',
                  fontSize: 12, fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: allSupervisors ? '#dc2626' : 'transparent',
                  border: `1.5px solid ${allSupervisors ? '#dc2626' : '#cbd5e1'}`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#fff', transition: 'all 0.2s ease',
                }}>
                  {allSupervisors ? '✓' : ''}
                </span>
                Tous
              </button>

              {!allSupervisors && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedSupervisorId ?? ''}
                    onChange={e => onSupervisorChange(e.target.value ? Number(e.target.value) : null)}
                    style={{ ...inputBase, paddingRight: 28, minWidth: 150 }}
                  >
                    <option value="">— Choisir —</option>
                    {supervisorList.map((s: SupervisorItem) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <span style={{
                    position: 'absolute', right: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8', fontSize: 10, pointerEvents: 'none',
                  }}>▾</span>
                </div>
              )}
            </div>
          </Field>
          <Divider />
        </>
      )}

      

      {/* ── 4. Chart type pills ───────────────────────────────────────── */}
      {config.hasChart && (
        <>
          
          <Field>
            <Label>Graphique</Label>
            <div style={{ display: 'flex', gap: 4 }}>
              {CHART_OPTIONS.map(({ type, icon, label }) => {
                const active = chartType === type;
                return (
                  <button
                    key={type}
                    onClick={() => onChartTypeChange(type)}
                    title={label}
                    style={{
                      width: 34, height: 34,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? 'rgba(220,38,38,0.1)' : '#f8fafc',
                      border: `1px solid ${active ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.18)'}`,
                      borderRadius: 8, cursor: 'pointer',
                      color: active ? '#dc2626' : '#94a3b8',
                      fontSize: 14,
                      transition: 'all 0.2s ease',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: active ? '0 0 8px rgba(220,38,38,0.2)' : 'none',
                    }}
                    onMouseEnter={e => !active && (e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)')}
                    onMouseLeave={e => !active && (e.currentTarget.style.borderColor = 'rgba(220,38,38,0.18)')}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </Field>
        </>
      )}


      {/* ── 5. Refresh ────────────────────────────────────────────────── */}
      <div style={{ marginLeft: 'auto' }}>
        <RefreshBtn onRefresh={onRefresh} />
      </div>

    </div>
  );
};

export default StatsFilter;