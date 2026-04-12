import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { getSharedTableProps } from '../../Tableconfig';

interface Props<T extends object> {
  data: T[];
  columns: Array<{ key: string; header: string; format?: (v: any) => string }>;
  loading: boolean;
  chart?: React.ReactNode;
  
}

// ─── Divider ──────────────────────────────────────────────────────────────────
interface DividerProps {
  onResize: (deltaX: number) => void;
}

const Divider: React.FC<DividerProps> = ({ onResize }) => {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    startX.current = e.clientX;
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(delta);
    },
    [dragging, onResize]
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  return (
    <div
      onMouseDown={onMouseDown}
      title="Glisser pour redimensionner"
      style={{
        width: dragging ? 6 : 4,
        flexShrink: 0,
        cursor: 'col-resize',
        background: dragging
          ? '#534AB7'
          : 'linear-gradient(to bottom, #e5e7eb 0%, #c7d2fe 50%, #e5e7eb 100%)',
        borderRadius: 4,
        transition: 'background 0.15s ease, width 0.1s ease',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          pointerEvents: 'none',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: dragging ? '#fff' : '#9ca3af',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── TableCore ────────────────────────────────────────────────────────────────
interface TableCoreProps<T extends object> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  loading: boolean;
  totalCount: number;
}

function TableCore<T extends object>({ data, columns, loading, totalCount }: TableCoreProps<T>) {
  const exportConfigRef = useRef({ filename: 'export-stats', records: data });

  useEffect(() => {
    exportConfigRef.current = { filename: 'export-stats', records: data };
  }, [data]);

  const sharedProps = useMemo(
    () => getSharedTableProps<T>(totalCount, exportConfigRef.current),
    [totalCount]
  );

  const state = useMemo(() => ({ isLoading: loading }), [loading]);

  const table = useMantineReactTable({
    data,
    columns,
    state,
    ...sharedProps,
    // ── Style overrides pour un look plus soigné ──────────────────────────
    mantineTableProps: {
      style: {
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: 13,
        borderCollapse: 'collapse',
      },
    },
    mantineTableHeadRowProps: {
      style: {
        background: '#f8f9fb',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        fontWeight: 600,
        fontSize: 11,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '10px 14px',
        borderRight: 'none',
        background: 'transparent',
      },
    },
    mantineTableBodyRowProps: {
      style: { transition: 'background 0.1s' },
    },
    mantineTableBodyCellProps: {
      style: {
        padding: '9px 14px',
        fontSize: 13,
        color: '#111827',
        borderBottom: '1px solid #f3f4f6',
        borderRight: 'none',
      },
    },
  });

  return <MantineReactTable table={table} />;
}

const MemoTableCore = React.memo(TableCore) as typeof TableCore;

// ─── Score Cell ───────────────────────────────────────────────────────────────
const SCORE_THRESHOLD = 90; // en dessous = rouge

function ScoreCell({ value, formatted }: { value: number | null; formatted: string }) {
  if (value == null) return <span style={{ color: '#9ca3af' }}>—</span>;
  const isLow = typeof value === 'number' && value < SCORE_THRESHOLD;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
        color: isLow ? '#D85A30' : '#1D9E75',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isLow ? '#D85A30' : '#1D9E75',
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {formatted}
    </span>
  );
}

// ─── Eval Badge ───────────────────────────────────────────────────────────────
function EvalBadge({ value }: { value: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 20,
        background: '#EEEDFE',
        color: '#534AB7',
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        padding: '0 7px',
      }}
    >
      {value}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function StatsTable<T extends object>({ data, columns, loading, chart }: Props<T>) {
  const [tablePct, setTablePct] = useState(55);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convertir colonnes WidgetRegistry → MRT_ColumnDef avec rendu enrichi
  const mrtColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
    return columns.map((col) => ({
      accessorKey: col.key,
      header: col.header,
      Cell: ({ cell }: { cell: any }) => {
        const raw = cell.getValue();
        const formatted = col.format ? col.format(raw) : String(raw ?? '—');

        // Score : colonne dont le header contient "score", "%" ou "référence"
        const isScoreCol =
          /score|%|référence|ref/i.test(col.header) ||
          /score|ref/i.test(col.key);

        if (isScoreCol && col.format) {
          return <ScoreCell value={typeof raw === 'number' ? raw : null} formatted={formatted} />;
        }

        // Évaluations : colonne contenant un count numérique simple
        const isEvalCol = /eval|count|nb|nbre/i.test(col.header) || /eval|count/i.test(col.key);
        if (isEvalCol && typeof raw === 'number') {
          return <EvalBadge value={raw} />;
        }

        return <span>{formatted}</span>;
      },
    })) as MRT_ColumnDef<T>[];
  }, [columns]);

  const handleResize = useCallback((deltaX: number) => {
    if (!containerRef.current) return;
    const totalW = containerRef.current.getBoundingClientRect().width;
    const deltaPct = (deltaX / totalW) * 100;
    setTablePct((prev) => Math.min(75, Math.max(25, prev + deltaPct)));
  }, []);

  const tableNode = (
    <MemoTableCore
      data={data}
      columns={mrtColumns}
      loading={loading}
      totalCount={data.length}
    />
  );

  if (chart) {
    return (
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
          alignItems: 'stretch',
          width: '100%',
          minHeight: 500,
        }}
      >
        <div
          style={{
            width: `${tablePct}%`,
            flexShrink: 0,
            background: '#fff',
            borderRight: '1px solid #f3f4f6',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {tableNode}
        </div>
        <div style={{ padding: '0 4px', display: 'flex', alignItems: 'stretch' }}>
          <Divider onResize={handleResize} />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: '#fff',
            padding: 20,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {chart}
        </div>
      </div>
    );
  }

  return <div style={{ background: '#fff', overflow: 'hidden' }}>{tableNode}</div>;
}

export default StatsTable;