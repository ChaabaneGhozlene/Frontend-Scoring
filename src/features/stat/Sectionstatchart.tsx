// src/features/statistique/pages/Sectionstatchart.tsx

import React from 'react';
import type { SectionStatRow, ChartType } from './StatiTypes'; // ← importer depuis StatiTypes

interface Props {
  rows:      SectionStatRow[];
  chartType: ChartType;          // ✅ 'bar' | 'line' | 'pie' — minuscule, source unique
  onRef?:    (ref: any) => void;
}

const SectionStatChart: React.FC<Props> = ({ rows, chartType, onRef }) => {
  // ... votre logique ECharts existante

  // ✅ Si ECharts attend des valeurs capitalisées, convertir ici localement :
  const echartsType = chartType.charAt(0).toUpperCase() + chartType.slice(1) as 'Bar' | 'Line' | 'Pie';

  return (
    <div ref={onRef} style={{ width: '100%', height: 400 }}>
      {/* Votre composant ECharts ici, en utilisant echartsType si nécessaire */}
    </div>
  );
};

export default SectionStatChart;