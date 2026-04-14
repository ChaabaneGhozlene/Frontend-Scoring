import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { buildPivot, aggValue, fmtValue, fieldMeta } from "./Pivotutils"; // ✅ casse corrigée
import type { RootState } from "../../app/store";
import type { SectionStatState } from "./StatiTypes";

const PivotTable: React.FC = () => {  // ✅ déclaration du composant ajoutée
  const { data, zones, measure, filters } = useSelector(
    (s: RootState) => s.sectionStat as SectionStatState // ✅ sectionStat
  );

  const filtered = useMemo(() => {
    let rows = data;
    if (filters.agentId)    rows = rows.filter((r) => r.agentId    === filters.agentId);
    if (filters.campaignId) rows = rows.filter((r) => r.campaignId === filters.campaignId);
    return rows;
  }, [data, filters.agentId, filters.campaignId]);

  const pivot = useMemo(
    () => buildPivot(filtered, zones, measure),
    [filtered, zones, measure]
  );

  const { rowKeys, colKeys, cells } = pivot;

  if (!rowKeys.length) {
    return (
      <div style={emptyStyle}>
        Aucune donnée — modifiez les filtres ou actualisez.
      </div>
    );
  }

  const rowLabel = zones.rows.map((k) => fieldMeta(k).label).join(" / ") || "—";

  return (
    <div style={{ overflowX: "auto", borderRadius: 6, border: "1px solid #f0f0f0" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 160 }}>{rowLabel}</th>
            {colKeys.map((ck, i) => (
              <th key={i} style={thStyle}>{ck.join(" / ")}</th>
            ))}
            <th style={{ ...thStyle, background: "#e6f7ff", color: "#1890ff" }}>Total</th>
          </tr>
        </thead>

        <tbody>
          {rowKeys.map((rk, i) => {
            const rkey = rk.join("|");
            const allInRow = colKeys.flatMap(
              (ck) => cells[`${rkey}||${ck.join("|")}`] ?? []
            );
            const rowTotal = aggValue(allInRow, measure);

            return (
              <tr key={i} style={i % 2 === 0 ? {} : { background: "#fafafa" }}>
                <td style={{ ...tdStyle, textAlign: "left", fontWeight: 500 }}>
                  {rk.join(" / ")}
                </td>
                {colKeys.map((ck, j) => {
                  const key = `${rkey}||${ck.join("|")}`;
                  const val = aggValue(cells[key] ?? [], measure);
                  const pct = measure !== "count" && val != null ? val : null;
                  return (
                    <td key={j} style={tdStyle}>
                      <span style={pct != null ? scoreStyle(pct) : undefined}>
                        {fmtValue(val, measure)}
                      </span>
                    </td>
                  );
                })}
                <td style={{ ...tdStyle, fontWeight: 600, background: "rgba(230,247,255,0.13)" }}>
                  {fmtValue(rowTotal, measure)}
                </td>
              </tr>
            );
          })}

          {rowKeys.length > 1 && (
            <tr style={{ background: "#f0f0f0", fontWeight: 600 }}>
              <td style={{ ...tdStyle, textAlign: "left" }}>Total</td>
              {colKeys.map((ck, j) => {
                const colRows = rowKeys.flatMap(
                  (rk) => cells[`${rk.join("|")}||${ck.join("|")}`] ?? []
                );
                return (
                  <td key={j} style={tdStyle}>
                    {fmtValue(aggValue(colRows, measure), measure)}
                  </td>
                );
              })}
              <td style={tdStyle}>
                {fmtValue(aggValue(Object.values(cells).flat(), measure), measure)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}; // ✅ fermeture du composant

function scoreStyle(val: number): React.CSSProperties {
  if (val >= 90) return { color: "#52c41a", fontWeight: 500 };
  if (val >= 70) return { color: "#faad14", fontWeight: 500 };
  return { color: "#ff4d4f", fontWeight: 500 };
}

const tableStyle: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse", fontSize: 13,
};
const thStyle: React.CSSProperties = {
  padding: "8px 12px", background: "#fafafa",
  borderBottom: "2px solid #f0f0f0", textAlign: "right",
  fontWeight: 600, fontSize: 12, color: "#555", whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
  padding: "7px 12px", borderBottom: "1px solid #f0f0f0",
  textAlign: "right", whiteSpace: "nowrap",
};
const emptyStyle: React.CSSProperties = {
  padding: "2rem", textAlign: "center", color: "#999",
  fontSize: 13, border: "1px dashed #d9d9d9", borderRadius: 6,
};

export default PivotTable;