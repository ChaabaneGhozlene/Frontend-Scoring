import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { buildPivot, aggValue, fmtValue, fieldMeta } from "./Pivotutils";
import type { RootState } from "../../app/store";
import type { SectionStatState } from "./StatiTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a tree structure from flat colKey arrays for multi-level column headers.
 * e.g. [["Camp A","Jan 25"],["Camp A","Fév 25"],["Camp B","Jan 25"]]
 * → Camp A (span 2) | Camp B (span 1)
 *     Jan 25 | Fév 25  | Jan 25
 */
interface HeaderNode {
  label: string;
  span: number;
  children?: HeaderNode[];
  leafIndex?: number; // index into colKeys for leaf nodes
}

function buildHeaderTree(colKeys: string[][]): HeaderNode[][] {
  if (!colKeys.length) return [];
  const depth = colKeys[0]?.length ?? 1;
  if (depth === 0) return [];

  // For depth=1, simple flat list
  if (depth === 1) {
    return [
      colKeys.map((ck, i) => ({ label: ck[0] ?? "—", span: 1, leafIndex: i })),
    ];
  }

  // Build level-by-level groups
  const rows: HeaderNode[][] = [];
  for (let level = 0; level < depth; level++) {
    const row: HeaderNode[] = [];
    let i = 0;
    while (i < colKeys.length) {
      // Group contiguous columns that share the same prefix up to `level`
      const prefix = colKeys[i].slice(0, level + 1).join("|");
      let span = 0;
      while (
        i + span < colKeys.length &&
        colKeys[i + span].slice(0, level + 1).join("|") === prefix
      ) {
        span++;
      }
      row.push({
        label: colKeys[i][level] ?? "—",
        span,
        leafIndex: level === depth - 1 ? i : undefined,
      });
      i += span;
    }
    rows.push(row);
  }
  return rows;
}

// ─── Score colour helper ───────────────────────────────────────────────────────

function scoreStyle(val: number): React.CSSProperties {
  if (val >= 90) return { color: "#52c41a", fontWeight: 500 };
  if (val >= 70) return { color: "#faad14", fontWeight: 500 };
  return { color: "#ff4d4f", fontWeight: 500 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CellProps {
  val: number | null;
  measure: string;
}
const ValueCell: React.FC<CellProps> = ({ val, measure }) => {
  const formatted = fmtValue(val, measure as any);
  const style: React.CSSProperties =
    measure !== "count" && val != null ? scoreStyle(val) : {};
  return <span style={style}>{formatted}</span>;
};

// ─── Main component ───────────────────────────────────────────────────────────

const PivotTable: React.FC = () => {
  const { data, zones, measure, filters } = useSelector(
    (s: RootState) => s.sectionStat as SectionStatState
  );

  // Client-side filter (mirrors PivotCharts)
  const filtered = useMemo(() => {
    let rows = data;
    if (filters.agentId) rows = rows.filter((r) => r.agentId === filters.agentId);
    if (filters.campaignId) rows = rows.filter((r) => r.campaignId === filters.campaignId);
    return rows;
  }, [data, filters.agentId, filters.campaignId]);

  const pivot = useMemo(
    () => buildPivot(filtered, zones, measure),
    [filtered, zones, measure]
  );

  const { rowKeys, colKeys, cells } = pivot;

  // Column header levels
  const headerRows = useMemo(() => buildHeaderTree(colKeys), [colKeys]);
  const colDepth = headerRows.length;

  // Row label columns
  const rowLabels = zones.rows.map((k) => fieldMeta(k).label);
  const rowDepth = Math.max(rowLabels.length, 1);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!rowKeys.length) {
    return (
      <div style={emptyStyle}>
        Aucune donnée — modifiez les filtres ou actualisez.
      </div>
    );
  }

  // ── Grand total (all cells) ───────────────────────────────────────────────
  const grandTotal = aggValue(Object.values(cells).flat(), measure);

  return (
    <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid #f0f0f0" }}>
      <table style={tableStyle}>
        {/* ── COLGROUP for fixed-width row-label columns ── */}
        <colgroup>
          {Array.from({ length: rowDepth }).map((_, i) => (
            <col key={`rc-${i}`} style={{ minWidth: 140 }} />
          ))}
          {colKeys.map((_, i) => (
            <col key={`cc-${i}`} style={{ minWidth: 100 }} />
          ))}
          <col style={{ minWidth: 100, background: "rgba(230,247,255,0.25)" }} />
        </colgroup>

        <thead>
          {/* ── Multi-level column headers ── */}
          {headerRows.map((headerRow, level) => (
            <tr key={`header-${level}`}>
              {/* Row-label axis cells (only render on first header row, spanning all header rows) */}
              {level === 0 &&
                rowLabels.map((label, ri) => (
                  <th
                    key={`rl-${ri}`}
                    rowSpan={colDepth}
                    style={{ ...thStyle, textAlign: "left", verticalAlign: "bottom" }}
                  >
                    {label}
                  </th>
                ))}

              {/* Column header cells */}
              {headerRow.map((node, ni) => (
                <th
                  key={`h-${level}-${ni}`}
                  colSpan={node.span}
                  style={{
                    ...thStyle,
                    borderBottom:
                      level < colDepth - 1
                        ? "1px solid #e8e8e8"
                        : "2px solid #d9d9d9",
                    background:
                      level === 0 ? "#f0f5ff" : "#fafafa",
                    color: level === 0 ? "#1890ff" : "#555",
                    fontSize: level === 0 ? 12 : 11,
                  }}
                >
                  {node.label}
                </th>
              ))}

              {/* "Total" column header only on last row */}
              {level === 0 && (
                <th
                  rowSpan={colDepth}
                  style={{
                    ...thStyle,
                    background: "#e6f7ff",
                    color: "#1890ff",
                    verticalAlign: "bottom",
                    borderLeft: "2px solid #bae7ff",
                  }}
                >
                  Total
                </th>
              )}
            </tr>
          ))}
        </thead>

        <tbody>
          {rowKeys.map((rk, i) => {
            const rkey = rk.join("|");
            const allInRow = colKeys.flatMap(
              (ck) => cells[`${rkey}||${ck.join("|")}`] ?? []
            );
            const rowTotal = aggValue(allInRow, measure);

            return (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "#f0f5ff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    i % 2 === 0 ? "#fff" : "#fafafa")
                }
              >
                {/* Row label cells — one per row field */}
                {rk.map((label, ri) => (
                  <td
                    key={`rlv-${ri}`}
                    style={{
                      ...tdStyle,
                      textAlign: "left",
                      fontWeight: ri === rk.length - 1 ? 500 : 400,
                      color: ri === 0 ? "#262626" : "#595959",
                      borderRight: ri < rk.length - 1 ? "1px dashed #f0f0f0" : undefined,
                      paddingLeft: ri > 0 ? 24 : 12,
                    }}
                  >
                    {label}
                  </td>
                ))}

                {/* Data cells — one per leaf column */}
                {colKeys.map((ck, j) => {
                  const key = `${rkey}||${ck.join("|")}`;
                  const val = aggValue(cells[key] ?? [], measure);
                  return (
                    <td key={j} style={tdStyle}>
                      <ValueCell val={val} measure={measure} />
                    </td>
                  );
                })}

                {/* Row total */}
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 600,
                    borderLeft: "2px solid #bae7ff",
                    background: "rgba(230,247,255,0.18)",
                  }}
                >
                  <ValueCell val={rowTotal} measure={measure} />
                </td>
              </tr>
            );
          })}

          {/* ── Column totals row ── */}
          {rowKeys.length > 1 && (
            <tr style={{ background: "#f0f0f0", fontWeight: 600 }}>
              {/* Span all row-label columns */}
              <td
                colSpan={rowDepth}
                style={{ ...tdStyle, textAlign: "left", color: "#262626" }}
              >
                Total
              </td>
              {colKeys.map((ck, j) => {
                const colRows = rowKeys.flatMap(
                  (rk) => cells[`${rk.join("|")}||${ck.join("|")}`] ?? []
                );
                return (
                  <td key={j} style={{ ...tdStyle, fontWeight: 600 }}>
                    <ValueCell val={aggValue(colRows, measure)} measure={measure} />
                  </td>
                );
              })}
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  borderLeft: "2px solid #bae7ff",
                  background: "rgba(230,247,255,0.35)",
                  color: "#1890ff",
                }}
              >
                <ValueCell val={grandTotal} measure={measure} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#fafafa",
  borderBottom: "2px solid #f0f0f0",
  textAlign: "center",
  fontWeight: 600,
  fontSize: 12,
  color: "#555",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const tdStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderBottom: "1px solid #f0f0f0",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const emptyStyle: React.CSSProperties = {
  padding: "2rem",
  textAlign: "center",
  color: "#999",
  fontSize: 13,
  border: "1px dashed #d9d9d9",
  borderRadius: 6,
};

export default PivotTable;