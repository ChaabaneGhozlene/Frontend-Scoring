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
  { key: "agent",     label: "Agent",          type: "dim" },
  { key: "auditor",   label: "Auditeur",        type: "dim" },
  { key: "campaign",  label: "Campagne",        type: "dim" },
  { key: "monthYear", label: "Mois/Année",      type: "dim" },
  { key: "year",      label: "Année",           type: "dim" },
  { key: "weekYear",  label: "Semaine",         type: "dim" },
  { key: "section",   label: "Section",         type: "dim" },
  { key: "question",  label: "Question",        type: "dim" },
  { key: "score",     label: "Score (%)",       type: "measure", agg: "avg" },
  { key: "itemValue", label: "Valeur item (%)", type: "measure", agg: "avg" },
  { key: "surveyId",  label: "Nb évaluations",  type: "measure", agg: "count" },
];

export const MEASURE_LABELS: Record<MeasureKey, string> = {
  score:     "Score global (%)",
  count:     "Nb évaluations",
  itemValue: "Valeur item (%)",
};

export function fieldMeta(key: string): FieldMeta {
  return ALL_FIELDS.find((f) => f.key === key) ?? { key, label: key, type: "dim" };
}

// ─── Deduplication ────────────────────────────────────────────────────────────
//
// The backend returns one row PER survey item (one per question answered).
// This means a single evaluation (surveyId) appears N times — once per question.
//
// Deduplication rules by measure:
//
//   score     → keep only the FIRST row per surveyId.
//               The global score is the same on every duplicated row, so
//               averaging duplicates inflates the count and biases weighted averages.
//
//   itemValue → keep ALL rows, because each row carries a DIFFERENT item value
//               (each question has its own score). No deduplication needed.
//
//   count     → deduplicate by surveyId before counting distinct evaluations.
//               (already handled inside aggValue via Set, but cleaner to pre-dedup)
//
// When the pivot is broken down by section or question, the rows passed in are
// already naturally scoped, so deduplication is still safe — the Set handles it.

export function deduplicateRows(
  rows: StatistiqueRowViewModel[],
  measure: MeasureKey
): StatistiqueRowViewModel[] {
  if (measure === "itemValue") {
    // Every row carries a distinct item value — keep all
    return rows;
  }
  // For "score" and "count": one row per evaluation is enough
  return _.uniqBy(rows, (r) => r.surveyId);
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export function aggValue(
  rows: StatistiqueRowViewModel[],
  measure: MeasureKey
): number | null {
  if (!rows.length) return null;

  // Always deduplicate before aggregating
  const deduped = deduplicateRows(rows, measure);

  if (measure === "count") {
    // Count distinct evaluations (belt-and-suspenders after dedup)
    return new Set(deduped.map((r) => r.surveyId)).size;
  }

  const vals = deduped
    .map((r) => (measure === "score" ? r.score : r.itemValue))
    .filter((v): v is number => v != null && !isNaN(v));

  if (!vals.length) return null;
  return _.mean(vals);
}

export function fmtValue(val: number | null, measure: MeasureKey): string {
  if (val == null) return "—";
  if (measure === "count") return Math.round(val).toLocaleString("fr-FR");
  return `${val.toFixed(1)} %`;
}

// ─── Pivot builder ────────────────────────────────────────────────────────────
//
// NOTE: No deduplication here — buildPivot just groups rows into cells.
// Deduplication happens inside aggValue when the cell value is computed.
// This keeps the raw rows available for drill-down if needed.

export function buildPivot(
  data: StatistiqueRowViewModel[],
  zones: PivotZones,
  measure: MeasureKey
): PivotResult {
  const rowFields = zones.rows.length ? zones.rows : ["(tous)"];
  const colFields = zones.cols.length ? zones.cols : ["(tous)"];

  // Build unique row/col key combinations, preserving natural order
  const rowKeys = _.uniqWith(
    data.map((r) => rowFields.map((f) => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  const colKeys = _.uniqWith(
    data.map((r) => colFields.map((f) => String((r as any)[f] ?? ""))),
    _.isEqual
  );

  // Sort colKeys: if the first field is a temporal dim, sort chronologically
  const firstColField = colFields[0];
  const temporalFields = new Set(["monthYear", "weekYear", "year"]);
  const sortedColKeys =
    temporalFields.has(firstColField)
      ? sortTemporalKeys(colKeys, data, colFields)
      : colKeys;

  // Group raw rows into cells
  const cells: Record<string, StatistiqueRowViewModel[]> = {};
  data.forEach((row) => {
    const rk = rowFields.map((f) => String((row as any)[f] ?? "")).join("|");
    const ck = colFields.map((f) => String((row as any)[f] ?? "")).join("|");
    const key = `${rk}||${ck}`;
    if (!cells[key]) cells[key] = [];
    cells[key].push(row);
  });

  return { rowKeys, colKeys: sortedColKeys, cells, measure };
}

// ─── Temporal sort helper ─────────────────────────────────────────────────────
//
// Sort column keys that start with a temporal dimension (monthYear, weekYear, year)
// in chronological order rather than alphabetical order.
//
// monthYear: "Jan 2025" → sort by (year, month index)
// weekYear:  "S03 2025" → sort by (year, week number)
// year:      "2025"     → sort numerically

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function sortTemporalKeys(
  colKeys: string[][],
  data: StatistiqueRowViewModel[],
  colFields: string[]
): string[][] {
  const field = colFields[0];

  return [...colKeys].sort((a, b) => {
    const av = a[0], bv = b[0];
    if (field === "year") {
      return Number(av) - Number(bv);
    }
    if (field === "weekYear") {
      // "S03 2025" → year=2025, week=3
      const [aw, ay] = av.split(" ");
      const [bw, by] = bv.split(" ");
      const yearDiff = Number(ay) - Number(by);
      if (yearDiff !== 0) return yearDiff;
      return Number(aw.replace("S","")) - Number(bw.replace("S",""));
    }
    if (field === "monthYear") {
      // "Jan 2025" → year=2025, month=0
      const [am, ay] = av.split(" ");
      const [bm, by] = bv.split(" ");
      const yearDiff = Number(ay) - Number(by);
      if (yearDiff !== 0) return yearDiff;
      return MONTHS_FR.indexOf(am) - MONTHS_FR.indexOf(bm);
    }
    return av.localeCompare(bv, "fr");
  });
}

// ─── CSV export (client-side fallback) ────────────────────────────────────────

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