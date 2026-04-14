import { useState, useCallback, useMemo, useRef } from "react";
import _ from "lodash";

// ─── TYPES ─────────────────────────────────────────────

type Field = {
  key: string;
  label: string;
  type: "dim" | "measure";
  agg?: "avg" | "sum" | "count";
};

type RowData = {
  surveyId: number;
  createDate: string;
  agent: string;
  auditor: string;
  campaign: string;
  monthYear: string;
  year: number;
  weekYear: string;
  score: number;
  section: string;
  question: string;
  itemValue: number;
  agentId?: number;
  campaignId?: number;
};

type Filters = {
  dateDebut: string;
  dateFin: string;
  agentId: number | null;
  campaignId: number | null;
  allSupervisors: boolean;
};

type Pivot = {
  rowKeys: string[][];
  colKeys: string[][];
  cells: Record<string, RowData[]>;
  measure: string;
};

type FilterPanelProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  agents: { id: number; name: string }[];
  campaigns: { id: number; description: string }[];
  onRefresh: () => void;
  loading: boolean;
};

type FieldChipProps = {
  field: string;
  zone: string;
  onDragStart: (field: string, zone: string) => void;
  onRemove?: (field: string) => void;
};

type DropZoneProps = {
  label: string;
  zone: string;
  fields: string[];
  onDragStart: (field: string, zone: string) => void;
  onDrop: (zone: string) => void;
  setZones: React.Dispatch<any>;
};

type PivotTableProps = {
  pivot: Pivot;
};

// ─── CONFIG ─────────────────────────────────────────────

const ALL_FIELDS: Field[] = [
  { key: "agent", label: "Agent", type: "dim" },
  { key: "auditor", label: "Auditeur", type: "dim" },
  { key: "campaign", label: "Campagne", type: "dim" },
  { key: "monthYear", label: "Mois/Année", type: "dim" },
  { key: "year", label: "Année", type: "dim" },
  { key: "weekYear", label: "Semaine", type: "dim" },
  { key: "section", label: "Section", type: "dim" },
  { key: "question", label: "Question", type: "dim" },
  { key: "score", label: "Score (%)", type: "measure", agg: "avg" },
  { key: "itemValue", label: "Valeur item", type: "measure", agg: "avg" },
  { key: "surveyId", label: "Nb évaluations", type: "measure", agg: "count" },
];

const DIMS = ALL_FIELDS.filter(f => f.type === "dim");

// ─── HELPERS ─────────────────────────────────────────────

function aggValue(rows: RowData[], field: string) {
  const f = ALL_FIELDS.find(x => x.key === field);
  if (!f) return null;

  const vals = rows.map(r => (r as any)[field]).filter(v => v != null);

  if (!vals.length) return null;
  if (f.agg === "count") return new Set(rows.map(r => r.surveyId)).size;
  if (f.agg === "avg") return _.mean(vals);
  if (f.agg === "sum") return _.sum(vals);

  return null;
}

function fmt(val: any, key: string) {
  if (val == null) return "—";
  if (key === "surveyId") return Math.round(val).toLocaleString("fr-FR");
  return `${val.toFixed(2)}%`;
}

function buildPivot(data: RowData[], rowFields: string[], colFields: string[], measure: string): Pivot {
  const rowKeys = _.uniqWith(
    data.map(r => rowFields.map(f => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  const colKeys = _.uniqWith(
    data.map(r => colFields.map(f => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  const cells: Record<string, RowData[]> = {};

  data.forEach(row => {
    const rk = rowFields.map(f => String((row as any)[f] ?? "")).join("|");
    const ck = colFields.map(f => String((row as any)[f] ?? "")).join("|");
    const key = `${rk}||${ck}`;
    if (!cells[key]) cells[key] = [];
    cells[key].push(row);
  });

  return { rowKeys, colKeys, cells, measure };
}

// ─── DRAG HOOK ─────────────────────────────────────────────

function useDragZone(zones: any, setZones: any) {
  const dragging = useRef<{ field: string; fromZone: string } | null>(null);

  const onDragStart = useCallback((field: string, fromZone: string) => {
    dragging.current = { field, fromZone };
  }, []);

  const onDrop = useCallback((toZone: string) => {
    if (!dragging.current) return;

    const { field, fromZone } = dragging.current;

    setZones((prev: any) => {
      const next = { ...prev };
      next[fromZone] = prev[fromZone].filter((f: string) => f !== field);
      if (!next[toZone].includes(field)) next[toZone].push(field);
      return next;
    });

    dragging.current = null;
  }, [setZones]);

  return { onDragStart, onDrop };
}

// ─── COMPONENTS ─────────────────────────────────────────────

function FilterPanel({ filters, setFilters,  onRefresh, loading }: FilterPanelProps) {
  return (
    <div>
      <input
        type="date"
        value={filters.dateDebut}
        onChange={(e) => setFilters(f => ({ ...f, dateDebut: e.target.value }))}
      />

      <input
        type="date"
        value={filters.dateFin}
        onChange={(e) => setFilters(f => ({ ...f, dateFin: e.target.value }))}
      />

      <button onClick={onRefresh} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>
    </div>
  );
}

function FieldChip({ field, zone, onDragStart, onRemove }: FieldChipProps) {
  const f = ALL_FIELDS.find(x => x.key === field);

  return (
    <div draggable onDragStart={() => onDragStart(field, zone)}>
      {f?.label ?? field}
      {onRemove && <span onClick={() => onRemove(field)}>×</span>}
    </div>
  );
}

function DropZone({ label, zone, fields, onDragStart, onDrop }: DropZoneProps) {
  return (
    <div onDrop={() => onDrop(zone)} onDragOver={(e) => e.preventDefault()}>
      <strong>{label}</strong>

      {fields.map(f => (
        <FieldChip key={f} field={f} zone={zone} onDragStart={onDragStart} />
      ))}
    </div>
  );
}

function PivotTable({ pivot }: PivotTableProps) {
  const { rowKeys, colKeys, cells, measure } = pivot;

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          {colKeys.map((ck, i) => (
            <th key={i}>{ck.join(" / ")}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rowKeys.map((rk, i) => (
          <tr key={i}>
            <td>{rk.join(" / ")}</td>

            {colKeys.map((ck, j) => {
              const key = `${rk.join("|")}||${ck.join("|")}`;
              const val = aggValue(cells[key] ?? [], measure);
              return <td key={j}>{fmt(val, measure)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export default function StatistiquePivot() {
  const DEMO_DATA: RowData[] = useMemo(() => [], []);

  const [data, setData] = useState<RowData[]>(DEMO_DATA);

  const [filters, setFilters] = useState<Filters>({
    dateDebut: "2024-01-01",
    dateFin: "2024-12-31",
    agentId: null,
    campaignId: null,
    allSupervisors: true,
  });

  const [measure, setMeasure] = useState("score");

  const [zones, setZones] = useState({
    rows: ["agent"],
    cols: ["monthYear"],
    available: DIMS.map(d => d.key),
  });

  const { onDragStart, onDrop } = useDragZone(zones, setZones);

  const pivot = useMemo(() => {
    let filtered = data;

    if (filters.agentId)
      filtered = filtered.filter(r => r.agentId === filters.agentId);

    if (filters.campaignId)
      filtered = filtered.filter(r => r.campaignId === filters.campaignId);

    return buildPivot(filtered, zones.rows, zones.cols, measure);
  }, [data, zones, filters, measure]);

  return (
    <div>
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        agents={[]}
        campaigns={[]}
        onRefresh={() => {}}
        loading={false}
      />

      <DropZone
        label="Rows"
        zone="rows"
        fields={zones.rows}
        onDragStart={onDragStart}
        onDrop={onDrop}
        setZones={setZones}
      />

      <DropZone
        label="Cols"
        zone="cols"
        fields={zones.cols}
        onDragStart={onDragStart}
        onDrop={onDrop}
        setZones={setZones}
      />

      <PivotTable pivot={pivot} />
    </div>
  );
}