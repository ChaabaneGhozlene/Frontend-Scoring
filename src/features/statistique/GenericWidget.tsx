import React, { useState, useEffect } from 'react'; // ✅ ajouter useEffect
import { useDispatch, useSelector } from 'react-redux';
import { WIDGET_REGISTRY } from './WidgetRegistry';
import type { WidgetInstance, SupervisorItem } from './Statistiquetypes';
import type { RootState } from '../../app/store';
import { removeWidget, updateWidgetChartType, updateWidgetFilter } from './DashboardSlice';
import StatsFilter from './components/Statsfilter';
import StatsTable from './components/Statstable';
import StatsChart from './components/Statschart';
import { useWidgetData } from './useWidgetData';
import SectionStatsTable from './components/Sectionstatstable';
import { fetchSupervisorListApi } from './Statistiqueservice'; // ✅ ajouter import

interface Props {
  widget:           WidgetInstance;
  editMode:         boolean;
  globalStartDate?: Date | null;
  globalEndDate?:   Date | null;
}

const GenericWidget: React.FC<Props> = ({
  widget,
  editMode,
  globalStartDate,
  globalEndDate,
}) => {
  const dispatch   = useDispatch();
  const definition = WIDGET_REGISTRY[widget.widgetType];
  const agentList  = useSelector((s: RootState) => s.statistique.agentList);

  const [showFilters,          setShowFilters]          = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null);
  const [supervisorList,       setSupervisorList]       = useState<SupervisorItem[]>([]);

  // ✅ Charger les superviseurs au montage du widget
  useEffect(() => {
    if (definition.hasSupervisorFilter) { // ✅ uniquement si le widget en a besoin
      fetchSupervisorListApi()
        .then(setSupervisorList)
        .catch(err => console.error('Erreur chargement superviseurs:', err));
    }
  }, [definition.hasSupervisorFilter]);

  const effectiveFilters = {
    ...widget.filters,
    dateFrom: globalStartDate?.toISOString() || widget.filters.dateFrom,
    dateTo:   globalEndDate?.toISOString()   || widget.filters.dateTo,
  };

  const { data, sectionRows, loading, refresh } = useWidgetData({
    ...widget,
    filters: effectiveFilters,
  });

const handleSupervisorChange = (id: number | null) => {
  setSelectedSupervisorId(id);
  dispatch(updateWidgetFilter({
    id:      widget.id,
    filters: { 
      ...effectiveFilters, 
      supervisorId: id ?? undefined,  // ← ajouter ici
    },
  }));
};

  const handleAllSupervisorsChange = (v: boolean) => {
    dispatch(updateWidgetFilter({
      id:      widget.id,
      filters: { ...effectiveFilters, allSupervisors: v },
    }));
    if (v) setSelectedSupervisorId(null);
  };

  const chart = definition.hasChart && !definition.hasCustomTable && data.length > 0 ? (
    <StatsChart
      data={data as Record<string, unknown>[]}
      chartType={widget.chartType}
      xKey={definition.chartXKey}
      yKey={definition.chartYKey}
      title={widget.title ?? definition.label}
    />
  ) : undefined;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      transition: 'box-shadow 0.2s',
    }}>

      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f3f4f6', background: '#fafafa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, background: '#EEEDFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>
            {definition.icon}
          </span>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
              {widget.title ?? definition.label}
            </h3>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, marginTop: 1 }}>
              {definition.description}
            </p>
            <p style={{ fontSize: 10, color: '#534AB7', margin: '4px 0 0 0' }}>
              📅 {effectiveFilters.dateFrom?.split('T')[0]} → {effectiveFilters.dateTo?.split('T')[0]}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!loading && data.length > 0 && (
            <span style={{
              background: '#f0fdf4', color: '#1D9E75',
              border: '1px solid #bbf7d0', borderRadius: 10,
              fontSize: 11, fontWeight: 600, padding: '2px 8px', marginRight: 4,
            }}>
              {data.length} lignes
            </span>
          )}

          <button
            onClick={() => setShowFilters(v => !v)}
            title={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            style={{
              width: 30, height: 30,
              border: `1px solid ${showFilters ? '#534AB7' : '#e5e7eb'}`,
              borderRadius: 6,
              background: showFilters ? '#EEEDFE' : '#fff',
              color: showFilters ? '#534AB7' : '#6b7280',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ⚙
          </button>

          <button
            onClick={refresh}
            title="Rafraîchir"
            style={{
              width: 30, height: 30,
              border: '1px solid #e5e7eb', borderRadius: 6,
              background: '#fff', color: '#6b7280',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ↻
          </button>

          {editMode && (
            <button
              onClick={() => dispatch(removeWidget(widget.id))}
              title="Supprimer ce widget"
              style={{
                width: 30, height: 30,
                border: '1px solid #fecaca', borderRadius: 6,
                background: '#fff', color: '#ef4444',
                cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────── */}
      {showFilters && (
        <StatsFilter
          filter={effectiveFilters}
          config={definition}
          agentList={agentList}
          supervisorList={supervisorList}
          selectedAgentId={null}
          selectedSupervisorId={selectedSupervisorId}
          allSupervisors={effectiveFilters.allSupervisors}
          sortDirection={effectiveFilters.sortDirection ?? 'Descending'}
          chartType={widget.chartType}
          onFilterChange={(f) => dispatch(updateWidgetFilter({ id: widget.id, filters: f }))}
          onAgentChange={() => {}}
          onSupervisorChange={handleSupervisorChange}
          onAllSupervisorsChange={handleAllSupervisorsChange}
          onSortChange={(v) => dispatch(updateWidgetFilter({
            id:      widget.id,
            filters: { ...effectiveFilters, sortDirection: v },
          }))}
          onChartTypeChange={(ct) => dispatch(updateWidgetChartType({ id: widget.id, chartType: ct }))}
          onRefresh={refresh}
        />
      )}

      {/* ── Chargement ──────────────────────────────────────────────── */}
      {loading && (
        <div style={{
          height: 2,
          background: 'linear-gradient(to right, #534AB7 0%, #B07FEF 50%, #534AB7 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.2s infinite linear',
        }} />
      )}

      {/* ── Contenu ─────────────────────────────────────────────────── */}
      {definition.hasCustomTable ? (
        <SectionStatsTable data={sectionRows} loading={loading} />
      ) : (
        <StatsTable
          data={data as Record<string, unknown>[]}
          columns={definition.columns}
          loading={loading}
          chart={chart}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
};

export default GenericWidget;