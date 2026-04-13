// src/features/statistique/components/SectionStatGrid.tsx
// Équivalent ASPxPivotGrid (mode grille plate — les agrégations sont dans le pivot)

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {  ModuleRegistry, ClientSideRowModelModule, type ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { SectionStatRow } from './StatiTypes';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface Props {
  rows: SectionStatRow[];
}

const SectionStatGrid: React.FC<Props> = ({ rows }) => {
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field:       'sectionId',
      headerName:  'Section ID',
      width:       110,
      sortable:    true,
      filter:      'agNumberColumnFilter',
    },
    {
      field:      'section',
      headerName: 'Section',
      flex:       1,
      sortable:   true,
      filter:     true,
    },
    {
      field:      'agent',
      headerName: 'Agent',
      flex:       1,
      sortable:   true,
      filter:     true,
    },
    {
      field:      'agentId',
      headerName: 'Agent ID',
      width:      110,
      sortable:   true,
      filter:     true,
    },
    {
      field:      'campaign',
      headerName: 'Campaign',
      flex:       1,
      sortable:   true,
      filter:     true,
    },
    {
      field:          'scorePercent',
      headerName:     'Score (%)',
      width:          120,
      sortable:       true,
      filter:         'agNumberColumnFilter',
      headerClass:    'ag-header-center',
      cellStyle:      { textAlign: 'center' },
      valueFormatter: p => `${p.value?.toFixed(2)} %`,
      cellClassRules: {
        // vert si ≥ 80, orange si ≥ 60, rouge sinon
        'score-good':   p => p.value >= 80,
        'score-medium': p => p.value >= 60 && p.value < 80,
        'score-bad':    p => p.value < 60,
      },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    minWidth:  80,
  }), []);

  return (
    <>
      <style>{`
        .score-good   { color: #1a7a3a; font-weight: 500; }
        .score-medium { color: #b06000; font-weight: 500; }
        .score-bad    { color: #b91c1c; font-weight: 500; }
        .ag-header-center .ag-header-cell-label { justify-content: center; }
      `}</style>
      <div
        className="ag-theme-alpine"
        style={{ height: 340, width: '100%' }}
      >
        <AgGridReact
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={10}
          animateRows
          modules={[ClientSideRowModelModule]}
        />
      </div>
    </>
  );
};

export default SectionStatGrid;