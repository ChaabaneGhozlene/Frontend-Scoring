import _ from "lodash";
import type {
    StatistiqueRowViewModel,
    MeasureKey,
    PivotResult,
    PivotZones,
} from "./StatiTypes";

// ─── Field metadata ───────────────────────────────────────────────────────────

export interface FieldMeta {
  key: string;
  label: string;
  type: "dim" | "measure";
  agg?: "avg" | "sum" | "count";
}

export const ALL_FIELDS: FieldMeta[] = [
  { key: "agent",     label: "Agent",       type: "dim" },
  { key: "auditor",   label: "Auditeur",    type: "dim" },
  { key: "campaign",  label: "Campagne",    type: "dim" },
  { key: "monthYear", label: "Mois/Année",  type: "dim" },
  { key: "year",      label: "Année",       type: "dim" },
  { key: "weekYear",  label: "Semaine",     type: "dim" },
  { key: "section",   label: "Section",     type: "dim" },
  { key: "question",  label: "Question",    type: "dim" },
  { key: "score",     label: "Score (%)",   type: "measure", agg: "avg" },
  { key: "itemValue", label: "Valeur item", type: "measure", agg: "avg" },
  { key: "surveyId",  label: "Nb évaluations", type: "measure", agg: "count" },
];

export const MEASURE_LABELS: Record<MeasureKey, string> = {
  score:     "Score (%)",
  count:     "Nb évaluations",
  itemValue: "Valeur item",
};

export function fieldMeta(key: string): FieldMeta {
  return ALL_FIELDS.find((f) => f.key === key) ?? { key, label: key, type: "dim" };
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggValue(
  rows: StatistiqueRowViewModel[],
  measure: MeasureKey
): number | null {
  if (!rows.length) return null;

  if (measure === "count") {
    return new Set(rows.map((r) => r.surveyId)).size;
  }

  const vals = rows
    .map((r) => (measure === "score" ? r.score : r.itemValue))
    .filter((v): v is number => v != null);

  if (!vals.length) return null;
  return _.mean(vals);
}

export function fmtValue(val: number | null, measure: MeasureKey): string {
  if (val == null) return "—";
  if (measure === "count") return Math.round(val).toLocaleString("fr-FR");
  return `${val.toFixed(1)} %`;
}

// ─── Pivot builder ────────────────────────────────────────────────────────────

export function buildPivot(
  data: StatistiqueRowViewModel[],
  zones: PivotZones,
  measure: MeasureKey
): PivotResult {
  const rowFields = zones.rows.length ? zones.rows : ["(tous)"];
  const colFields = zones.cols.length ? zones.cols : ["(tous)"];

  const rowKeys = _.uniqWith(
    data.map((r) => rowFields.map((f) => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  const colKeys = _.uniqWith(
    data.map((r) => colFields.map((f) => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  const cells: Record<string, StatistiqueRowViewModel[]> = {};

  data.forEach((row) => {
    const rk = rowFields.map((f) => String((row as any)[f] ?? "")).join("|");
    const ck = colFields.map((f) => String((row as any)[f] ?? "")).join("|");
    const key = `${rk}||${ck}`;
    if (!cells[key]) cells[key] = [];
    cells[key].push(row);
  });

  return { rowKeys, colKeys, cells, measure };
}

// ─── CSV export (client-side fallback) ───────────────────────────────────────

export function pivotToCSV(pivot: PivotResult): string {
  const { rowKeys, colKeys, cells, measure } = pivot;
  const sep = ";";
  const lines: string[] = [];

  const header = ["Ligne", ...colKeys.map((ck) => ck.join(" / ")), "Total"].join(sep);
  lines.push(header);

  rowKeys.forEach((rk) => {
    const rkey = rk.join("|");
    const cols = colKeys.map((ck) => {
      const key = `${rkey}||${ck.join("|")}`;
      return fmtValue(aggValue(cells[key] ?? [], measure), measure);
    });

    const allInRow = colKeys.flatMap((ck) => cells[`${rkey}||${ck.join("|")}`] ?? []);
    const total = fmtValue(aggValue(allInRow, measure), measure);

    lines.push([rk.join(" / "), ...cols, total].join(sep));
  });

  return "\uFEFF" + lines.join("\n");
}