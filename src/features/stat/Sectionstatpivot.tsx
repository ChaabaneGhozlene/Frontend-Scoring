// src/features/statistique/components/SectionStatPivot.tsx
// Équivalent ASPxPivotGrid (tableau croisé dynamique avec drag & drop)

import React, { useState } from 'react';
import 'react-pivottable/pivottable.css';
import type { SectionStatRow } from './StatiTypes';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';


interface Props {
  rows: SectionStatRow[];
}

// Mapper les clés camelCase vers labels lisibles pour PivotTable.js
const mapRows = (rows: SectionStatRow[]) =>
  rows.map(r => ({
    'Section ID':  r.sectionId,
    'Section':     r.section,
    'Agent':       r.agent,
    'Agent ID':    r.agentId,
    'Campaign':    r.campaign,
    'Score (%)':   r.scorePercent,
  }));

const SectionStatPivot: React.FC<Props> = ({ rows }) => {
  const [pivotState, setPivotState] = useState<any>({
    rows:            ['Section'],
    cols:            ['Campaign'],
    vals:            ['Score (%)'],
    aggregatorName:  'Average',
    rendererName:    'Table',
  });

  if (rows.length === 0) {
    return (
      <div style={{ padding: 20, color: '#888', fontSize: 13 }}>
        Aucune donnée. Cliquez sur Refresh.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <PivotTableUI
        data={mapRows(rows)}
        onChange={(s: any) => setPivotState(s)}
        renderers={TableRenderers}
        {...pivotState}
      />
    </div>
  );
};

export default SectionStatPivot;