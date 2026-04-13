import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import SectionStatGrid  from './Sectionstatgrid';
import SectionStatPivot from './Sectionstatpivot';
import SectionStatChart from './Sectionstatchart';

import { useAppDispatch, useAppSelector } from '../../app/hooks';

// ✅ Importer depuis features/stat/ — correspond à s.stat dans le store
import { exportStatsCsv } from './Statistiqueslice';
import type { SectionStatFilter, SectionStatRow } from './StatiTypes';
import StatToolbar from './Stattoolbar ';

type Tab = 'grid' | 'pivot' | 'chart';

const SectionStatPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const rows      = useAppSelector(s => s.stat.rows);
  const loading   = useAppSelector(s => s.stat.loading);
  const error     = useAppSelector(s => s.stat.error);
  const filter    = useAppSelector(s => s.stat.filter) as SectionStatFilter;
  const chartType = useAppSelector(s => s.stat.chartType);

  const [activeTab, setActiveTab] = useState<Tab>('grid');
  const chartRef = useRef<any>(null);

  const handleExportXls = () => {
    const wsData = [
      ['Section ID', 'Section', 'Agent', 'Agent ID', 'Campaign', 'Score (%)'],
      ...rows.map((r: SectionStatRow) => [
        r.sectionId, r.section, r.agent, r.agentId, r.campaign, r.scorePercent,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SectionStats');
    XLSX.writeFile(wb, 'SectionStats.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(`Section Statistics — ${filter.dateDebut} to ${filter.dateFin}`, 14, 16);
    autoTable(doc, {
      startY: 24,
      head:   [['Section ID', 'Section', 'Agent', 'Agent ID', 'Campaign', 'Score (%)']],
      body:   rows.map((r: SectionStatRow) => [
        r.sectionId, r.section, r.agent, r.agentId, r.campaign, `${r.scorePercent} %`,
      ]),
      styles: { fontSize: 9 },
    });
    const eInstance = chartRef.current?.getEchartsInstance?.();
    if (eInstance) {
      const imgData = eInstance.getDataURL({ type: 'png', pixelRatio: 1.5, backgroundColor: '#fff' });
      doc.addPage();
      doc.addImage(imgData, 'PNG', 10, 10, 270, 130);
    }
    doc.save('SectionStats.pdf');
  };

  const handleExportChartPng = () => {
    const eInstance = chartRef.current?.getEchartsInstance?.();
    if (!eInstance) return;
    const url  = eInstance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'SectionChart.png';
    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <img
          src="/images/Header/stats.png"
          alt="stats"
          style={{ width: 24, marginRight: 8 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={styles.headerTitle}>Section Statistics</span>
        <span style={styles.headerPath}>Stats / Section Statistics</span>
      </div>

      <StatToolbar />

      <div style={styles.exportBar}>
        <button style={styles.btn} onClick={() => dispatch(exportStatsCsv(filter))}>⬇ CSV</button>
        <button style={styles.btn} onClick={handleExportXls}>⬇ XLS</button>
        <button style={styles.btn} onClick={handleExportPdf}>⬇ PDF</button>
        <button style={styles.btn} onClick={handleExportChartPng}>⬇ Chart PNG</button>
      </div>

      {error   && <div style={styles.error}>⚠ {error}</div>}
      {loading && <div style={styles.loading}>Chargement…</div>}

      <div style={styles.tabBar}>
        {(['grid', 'pivot', 'chart'] as Tab[]).map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t)}
          >
            {t === 'grid'  && 'Grille'}
            {t === 'pivot' && 'Tableau croisé'}
            {t === 'chart' && 'Graphique'}
          </button>
        ))}
        <span style={styles.total}>{rows.length > 0 ? `${rows.length} ligne(s)` : ''}</span>
      </div>

      <div style={styles.body}>
        {activeTab === 'grid'  && <SectionStatGrid  rows={rows} />}
        {activeTab === 'pivot' && <SectionStatPivot rows={rows} />}
        {activeTab === 'chart' && (
          <SectionStatChart
            rows={rows}
            chartType={chartType}
            onRef={(r: any) => { chartRef.current = r; }}
          />
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'sans-serif' },
  header:      { display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#2c3e50', color: '#fff', fontSize: 15, fontWeight: 500 },
  headerTitle: { flexGrow: 1 },
  headerPath:  { fontSize: 12, opacity: 0.7 },
  exportBar:   { display: 'flex', gap: 6, padding: '6px 14px', background: '#fafafa', borderBottom: '1px solid #eee' },
  btn:         { padding: '4px 12px', borderRadius: 5, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: 12 },
  error:       { margin: '8px 14px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, color: '#b91c1c', fontSize: 13 },
  loading:     { padding: '8px 14px', color: '#666', fontSize: 13 },
  tabBar:      { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderBottom: '1px solid #ddd' },
  tab:         { padding: '5px 16px', borderRadius: 5, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 13, color: '#444' },
  tabActive:   { background: '#2c3e50', color: '#fff', border: '1px solid #2c3e50', fontWeight: 500 },
  total:       { marginLeft: 'auto', fontSize: 12, color: '#888' },
  body:        { flex: 1, padding: '12px 14px', overflow: 'auto' },
};

export default SectionStatPage;