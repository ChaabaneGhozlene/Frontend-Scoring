import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { ChartType, SectionStatFilter } from '../stat/StatiTypes';

// ✅ CORRECTION CLEF — importer depuis features/stat/ qui correspond à s.stat
import {
  exportStatsCsv,
  fetchSectionStats,
  setChartType,
  setFilter,
} from '../stat/Statistiqueslice';

const CHART_TYPES: ChartType[] = ['bar', 'line', 'pie'];

const StatToolbar: React.FC = () => {
  const dispatch = useAppDispatch();   // ✅ AppDispatch — thunks acceptés

  const filter    = useAppSelector(s => s.stat.filter) as SectionStatFilter;
  const chartType = useAppSelector(s => s.stat.chartType);
  const loading   = useAppSelector(s => s.stat.loading);

  const handleRefresh = () => {
    if (filter.dateFin < filter.dateDebut) {
      alert('La date de fin doit être ≥ à la date de début.');
      return;
    }
    dispatch(fetchSectionStats(filter));
  };

  const handleExport = (fmt: 'csv' | 'xlsx' | 'pdf') => {
    if (fmt === 'csv') dispatch(exportStatsCsv(filter));
  };

  return (
    <div style={styles.bar}>
      <label style={styles.label}>From :</label>
      <input
        type="date"
        style={styles.input}
        value={filter.dateDebut}
        onChange={e => dispatch(setFilter({ dateDebut: e.target.value }))}
      />

      <label style={styles.label}>To :</label>
      <input
        type="date"
        style={styles.input}
        value={filter.dateFin}
        min={filter.dateDebut}
        onChange={e => dispatch(setFilter({ dateFin: e.target.value }))}
      />

      <label style={styles.label}>Graph Type :</label>
      <select
        style={styles.input}
        value={chartType}
        onChange={e => dispatch(setChartType(e.target.value as ChartType))}
      >
        {CHART_TYPES.map(t => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      <button
        style={{ ...styles.btn, marginLeft: 8 }}
        onClick={handleRefresh}
        disabled={loading}
      >
        {loading ? '⏳' : '🔄'} Refresh
      </button>

      <div style={styles.exportGroup}>
        <span style={styles.label}>Export :</span>
        <button style={styles.btn} onClick={() => handleExport('csv')}>CSV</button>
        <button style={styles.btn} id="exportXlsxBtn">XLS</button>
        <button style={styles.btn} id="exportPdfBtn">PDF</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  bar:         { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f5f5f5', borderBottom: '1px solid #ddd' },
  label:       { fontSize: 13, color: '#555', whiteSpace: 'nowrap' },
  input:       { padding: '4px 8px', borderRadius: 5, border: '1px solid #ccc', fontSize: 13, height: 30 },
  btn:         { padding: '4px 12px', borderRadius: 5, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: 13, height: 30 },
  exportGroup: { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' },
};

export default StatToolbar;