import React, { useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { buildPivot, aggValue, fmtValue, fieldMeta, MEASURE_LABELS } from "./Pivotutils";
import type { RootState } from "../../app/store";
import type { SectionStatState } from "./StatiTypes"; // ✅ type local
import {
  Chart, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Tooltip, Legend, BarController, LineController,
  Title, Filler,
} from "chart.js";

Chart.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Tooltip, Legend, BarController, LineController,
  Title, Filler
);

const PALETTE_SOLID = ["#1890ff","#52c41a","#fa8c16","#eb2f96","#722ed1","#13c2c2","#faad14","#f5222d"];
const PALETTE_ALPHA = ["rgba(24,144,255,0.73)","rgba(82,196,26,0.73)","rgba(250,140,22,0.73)","rgba(235,47,150,0.73)","rgba(114,46,209,0.73)","rgba(19,194,194,0.73)","rgba(250,173,20,0.73)","rgba(245,34,45,0.73)"];
const PALETTE_LIGHT = ["rgba(24,144,255,0.13)","rgba(82,196,26,0.13)","rgba(250,140,22,0.13)","rgba(235,47,150,0.13)","rgba(114,46,209,0.13)","rgba(19,194,194,0.13)","rgba(250,173,20,0.13)","rgba(245,34,45,0.13)"];

const PivotCharts: React.FC = () => {
  // ✅ lecture depuis sectionStat avec cast local
  const { data, zones, measure, filters } = useSelector(
    (s: RootState) => s.sectionStat as SectionStatState
  );

  const barRef  = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barChart  = useRef<Chart | null>(null);
  const lineChart = useRef<Chart | null>(null);

  const filtered = useMemo(() => {
    let rows = data;
    if (filters.agentId)    rows = rows.filter((r) => r.agentId    === filters.agentId);
    if (filters.campaignId) rows = rows.filter((r) => r.campaignId === filters.campaignId);
    return rows;
  }, [data, filters.agentId, filters.campaignId]);

  const pivot = useMemo(() => buildPivot(filtered, zones, measure), [filtered, zones, measure]);

  const mLabel       = MEASURE_LABELS[measure];
  const rowAxisLabel = zones.rows.map((k) => fieldMeta(k).label).join("/") || "Ligne";
  const colAxisLabel = zones.cols.map((k) => fieldMeta(k).label).join("/") || "Colonne";
  const tickCallback = (v: string | number) => measure === "count" ? v : `${v} %`;

  useEffect(() => {
    if (!barRef.current) return;
    const labels = pivot.rowKeys.slice(0, 20).map((rk) => rk.join(" / "));
    const values = pivot.rowKeys.slice(0, 20).map((rk) => {
      const allInRow = pivot.colKeys.flatMap((ck) => pivot.cells[`${rk.join("|")}||${ck.join("|")}`] ?? []);
      return aggValue(allInRow, measure);
    });
    barChart.current?.destroy();
    barChart.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: mLabel, data: values,
          backgroundColor: labels.map((_, i) => PALETTE_ALPHA[i % PALETTE_ALPHA.length]),
          borderColor:     labels.map((_, i) => PALETTE_SOLID[i % PALETTE_SOLID.length]),
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${fmtValue(ctx.raw as number, measure)}` } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 11 }, callback: tickCallback } },
          x: { ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: true, maxTicksLimit: 12 } },
        },
      },
    });
    return () => { barChart.current?.destroy(); barChart.current = null; };
  }, [pivot, measure]);

  useEffect(() => {
    if (!lineRef.current) return;
    const colLabels   = pivot.colKeys.slice(0, 24).map((ck) => ck.join(" / "));
    const multiSeries = pivot.rowKeys.length > 1 && pivot.rowKeys.length <= 8;
    const datasets = multiSeries
      ? pivot.rowKeys.map((rk, i) => ({
          label: rk.join(" / "),
          data: pivot.colKeys.slice(0, 24).map((ck) =>
            aggValue(pivot.cells[`${rk.join("|")}||${ck.join("|")}`] ?? [], measure)
          ),
          borderColor: PALETTE_SOLID[i % PALETTE_SOLID.length],
          backgroundColor: PALETTE_LIGHT[i % PALETTE_LIGHT.length],
          pointBackgroundColor: PALETTE_SOLID[i % PALETTE_SOLID.length],
          tension: 0.3, fill: false, borderWidth: 2, pointRadius: 3,
        }))
      : [{
          label: mLabel,
          data: pivot.colKeys.slice(0, 24).map((ck) => {
            const allInCol = pivot.rowKeys.flatMap((rk) => pivot.cells[`${rk.join("|")}||${ck.join("|")}`] ?? []);
            return aggValue(allInCol, measure);
          }),
          borderColor: "#1890ff", backgroundColor: "rgba(24,144,255,0.13)",
          pointBackgroundColor: "#1890ff",
          tension: 0.3, fill: true, borderWidth: 2, pointRadius: 3,
        }];
    lineChart.current?.destroy();
    lineChart.current = new Chart(lineRef.current, {
      type: "line",
      data: { labels: colLabels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: multiSeries, labels: { font: { size: 10 }, boxWidth: 10 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmtValue(ctx.raw as number, measure)}` } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 11 }, callback: tickCallback } },
          x: { ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: true, maxTicksLimit: 12 } },
        },
      },
    });
    return () => { lineChart.current?.destroy(); lineChart.current = null; };
  }, [pivot, measure]);

  if (!filtered.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 16 }}>
      <div style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: "12px 14px", background: "#fff" }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{mLabel} par {rowAxisLabel}</div>
        <div style={{ position: "relative", height: 220 }}>
          <canvas ref={barRef} role="img" aria-label={`Barres : ${mLabel} par ${rowAxisLabel}`} />
        </div>
      </div>
      <div style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: "12px 14px", background: "#fff" }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Évolution par {colAxisLabel}</div>
        <div style={{ position: "relative", height: 220 }}>
          <canvas ref={lineRef} role="img" aria-label={`Ligne : ${mLabel} par ${colAxisLabel}`} />
        </div>
      </div>
    </div>
  );
};

export default PivotCharts;