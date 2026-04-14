import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilters,
  fetchDataRequest,
  exportRequest,
  setMeasure,
} from "./Statistiqueslice";
import type { MeasureKey, SectionStatState } from "./StatiTypes";
import { MEASURE_LABELS } from "./Pivotutils";
import type { RootState } from "../../app/store";

const EXPORT_FORMATS = ["CSV", "XLS", "PDF", "RTF"] as const;

const FilterPanel: React.FC = () => {
  const dispatch = useDispatch();

  const state = useSelector((s: RootState) => s.sectionStat as SectionStatState);

  // ✅ fallbacks pour éviter .map sur undefined
  const filters       = state?.filters;
  const agents        = state?.agents        ?? [];
  const campaigns     = state?.campaigns     ?? [];
  const measure       = state?.measure       ?? "score";
  const loading       = state?.loading       ?? false;
  const exportLoading = state?.exportLoading ?? false;

  if (!filters) return null; // ✅ garde si le state n'est pas encore prêt

  const handleRefresh = () => {
    dispatch(fetchDataRequest({ filter: filters }));
  };

  const handleExport = (format: (typeof EXPORT_FORMATS)[number]) => {
    dispatch(exportRequest({ filter: filters, format }));
  };

  return (
    <div style={containerStyle}>
      {/* Dates */}
      <div style={groupStyle}>
        <label style={labelStyle}>Du</label>
        <input
          type="date"
          style={inputStyle}
          value={filters.dateDebut}
          onChange={(e) => dispatch(setFilters({ dateDebut: e.target.value }))}
        />
        <label style={labelStyle}>Au</label>
        <input
          type="date"
          style={inputStyle}
          value={filters.dateFin}
          onChange={(e) => dispatch(setFilters({ dateFin: e.target.value }))}
        />
      </div>

      {/* Campagne */}
      <div style={groupStyle}>
        <label style={labelStyle}>Campagne</label>
        <select
          style={selectStyle}
          value={filters.campaignId ?? ""}
          onChange={(e) =>
            dispatch(setFilters({ campaignId: e.target.value ? Number(e.target.value) : null }))
          }
        >
          <option value="">Toutes</option>
          {campaigns.map((c) => ( // ✅ campaigns garanti tableau
            <option key={c.id} value={c.id}>{c.description}</option>
          ))}
        </select>
      </div>

      {/* Agent */}
      <div style={groupStyle}>
        <label style={labelStyle}>Agent</label>
        <select
          style={selectStyle}
          value={filters.agentId ?? ""}
          onChange={(e) =>
            dispatch(setFilters({ agentId: e.target.value ? Number(e.target.value) : null }))
          }
        >
          <option value="">Tous</option>
          {agents.map((a) => ( // ✅ agents garanti tableau
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Tous les superviseurs */}
      <div style={groupStyle}>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={filters.allSupervisors ?? true}
            onChange={(e) => dispatch(setFilters({ allSupervisors: e.target.checked }))}
          />
          Tous superviseurs
        </label>
      </div>

      {/* Mesure */}
      <div style={groupStyle}>
        <label style={labelStyle}>Mesure</label>
        <select
          style={selectStyle}
          value={measure}
          onChange={(e) => dispatch(setMeasure(e.target.value as MeasureKey))}
        >
          {(Object.keys(MEASURE_LABELS) as MeasureKey[]).map((k) => (
            <option key={k} value={k}>{MEASURE_LABELS[k]}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div style={{ ...groupStyle, marginLeft: "auto" }}>
        <button style={btnPrimaryStyle} onClick={handleRefresh} disabled={loading}>
          {loading ? "Chargement…" : "Actualiser"}
        </button>
        {EXPORT_FORMATS.map((fmt) => (
          <button
            key={fmt}
            style={btnSecondaryStyle}
            onClick={() => handleExport(fmt)}
            disabled={exportLoading}
          >
            {fmt}
          </button>
        ))}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
  padding: "10px 16px", background: "#fff",
  borderBottom: "1px solid #e8e8e8", marginBottom: 12,
};
const groupStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: 12, color: "#666", whiteSpace: "nowrap" };
const inputStyle: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px",
  border: "1px solid #d9d9d9", borderRadius: 4, outline: "none",
};
const selectStyle: React.CSSProperties = {
  fontSize: 12, padding: "4px 8px",
  border: "1px solid #d9d9d9", borderRadius: 4, outline: "none", minWidth: 120,
};
const btnPrimaryStyle: React.CSSProperties = {
  fontSize: 12, padding: "5px 14px",
  background: "#1890ff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer",
};
const btnSecondaryStyle: React.CSSProperties = {
  fontSize: 12, padding: "4px 10px",
  background: "#fff", color: "#555",
  border: "1px solid #d9d9d9", borderRadius: 4, cursor: "pointer",
};

export default FilterPanel;